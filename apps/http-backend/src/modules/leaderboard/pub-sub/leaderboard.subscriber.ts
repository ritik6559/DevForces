import os from "os";
import { inject, injectable } from "tsyringe";
import { type ILeaderBoardService } from "../service/leaderboard.service";
import { subscriber } from "../../../libs/redis";
import { SCORE_STREAM, SCORE_CONSUMER_GROUP, ScoreUpdatedEvent } from "../../../utils/types";
import { logger } from "logger";

export interface ILeaderBoardSubscriber {
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
}

// Each replica gets a unique consumer name within the shared group.
const CONSUMER_NAME = `${os.hostname()}-${process.pid}`;
const READ_COUNT = 10;
const BLOCK_MS = 5000;

// Shape of XREADGROUP's reply: [ [stream, [ [id, [field, value, ...] ], ... ] ], ... ]
type StreamReadReply = Array<[string, Array<[string, string[]]>]>;

@injectable()
export class LeaderBoardSubscriber implements ILeaderBoardSubscriber {

    private running = false;

    constructor(@inject("ILeaderBoardService") private leaderboardService: ILeaderBoardService) {}

    async subscribe(): Promise<void> {
        await this.ensureConsumerGroup();

        this.running = true;
        // Run the blocking read loop in the background.
        void this.consumeLoop();

        logger.info("Leaderboard stream consumer started", {
            stream: SCORE_STREAM,
            group: SCORE_CONSUMER_GROUP,
            consumer: CONSUMER_NAME,
        });
    }

    async unsubscribe(): Promise<void> {
        this.running = false;

        logger.info("Leaderboard stream consumer stopping", {
            stream: SCORE_STREAM,
            group: SCORE_CONSUMER_GROUP,
            consumer: CONSUMER_NAME,
        });
    }

    private async ensureConsumerGroup(): Promise<void> {
        try {
            // MKSTREAM creates the stream if absent; "0" starts from the
            // beginning so no backlog is missed.
            await subscriber.xgroup("CREATE", SCORE_STREAM, SCORE_CONSUMER_GROUP, "0", "MKSTREAM");
        } catch (error) {
            // BUSYGROUP = group already exists, which is expected on restart.
            if (!(error instanceof Error) || !error.message.includes("BUSYGROUP")) {
                throw error;
            }
        }
    }

    private async consumeLoop(): Promise<void> {
        while (this.running) {
            let reply: StreamReadReply | null;

            try {
                reply = (await subscriber.xreadgroup(
                    "GROUP", SCORE_CONSUMER_GROUP, CONSUMER_NAME,
                    "COUNT", READ_COUNT,
                    "BLOCK", BLOCK_MS,
                    "STREAMS", SCORE_STREAM, ">"
                )) as StreamReadReply | null;
            } catch (error) {
                logger.error("Failed to read from score stream", {
                    error: error instanceof Error ? error.message : "Unknown error",
                });
                // Back off briefly before retrying to avoid a hot error loop.
                await new Promise((resolve) => setTimeout(resolve, 1000));
                continue;
            }

            if (!reply) {
                continue; // BLOCK timed out with no messages
            }

            for (const [, entries] of reply) {
                for (const [id, fields] of entries) {
                    await this.processEntry(id, fields);
                }
            }
        }
    }

    private async processEntry(id: string, fields: string[]): Promise<void> {
        const startTime = Date.now();

        try {
            const dataIndex = fields.indexOf("data");
            const raw = dataIndex >= 0 ? fields[dataIndex + 1] : undefined;

            if (!raw) {
                // Malformed entry — ack it so it is not redelivered forever.
                await subscriber.xack(SCORE_STREAM, SCORE_CONSUMER_GROUP, id);
                return;
            }

            const event: ScoreUpdatedEvent = JSON.parse(raw);

            await this.leaderboardService.handleScoreUpdated(event);
            await subscriber.xack(SCORE_STREAM, SCORE_CONSUMER_GROUP, id);

            logger.info("Leaderboard updated successfully", {
                contestId: event.contestId,
                userId: event.userId,
                submissionId: event.submissionId,
                responseTime: Date.now() - startTime,
            });
        } catch (error) {
            // Leave the entry unacked so it remains in the Pending Entries List
            // and can be retried/claimed later.
            logger.error("Failed to process score event", {
                id,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }
}
