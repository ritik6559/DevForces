import { inject, injectable } from "tsyringe";
import { type ILeaderBoardService } from "../service/leaderboard.service";
import { subscriber } from "../../../libs/redis.subscriber";
import { REDIS_CHANNELS, ScoreUpdatedEvent } from "../../../utils/types";
import { logger } from "logger";

export interface ILeaderBoardSubscriber {
    subscribe(): Promise<void>;
    unsubscribe(): Promise<void>;
}

@injectable()
export class LeaderBoardSubscriber implements ILeaderBoardSubscriber {

    constructor(@inject("ILeaderBoardService") private leaderboardService: ILeaderBoardService) {}

    async subscribe(): Promise<void> {
        await subscriber.subscribe(REDIS_CHANNELS.SCORE_UPDATED);

        logger.info("Leaderboard Subscriber listening", {
            chaneel: REDIS_CHANNELS.SCORE_UPDATED
        });

        subscriber.on("message", async ( channel: string, message: string ) => {
            if( channel != REDIS_CHANNELS.SCORE_UPDATED ) {
                return;
            }

            const startTime = Date.now();

            try{
                const event: ScoreUpdatedEvent = JSON.parse(message);

                logger.info("Score update event received", {
                    channel,
                    contestId:    event.contestId,
                    userId:       event.userId,
                    submissionId: event.submissionId,
                    newScore:     event.newScore,
                });

                await this.leaderboardService.handleScoreUpdated(event);

                const responseTime = Date.now() - startTime;

                logger.info("Leaderboard updated successfully", {
                    contestId:    event.contestId,
                    userId:       event.userId,
                    submissionId: event.submissionId,
                    responseTime,
                });
            } catch (error) {

                const responseTime = Date.now() - startTime;

                logger.error("Failed to process score update event", {
                    channel,
                    message,
                    responseTime,
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }

        });
    }

    async unsubscribe(): Promise<void> {
        await subscriber.unsubscribe(REDIS_CHANNELS.SCORE_UPDATED);

        logger.info("Leaderboard subscriber stopped", {
            channel: REDIS_CHANNELS.SCORE_UPDATED,
        });
    }
}