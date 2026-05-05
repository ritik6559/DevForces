import { injectable } from "tsyringe";
import { publisher } from "../../../libs/redis.publisher";
import { logger } from "logger";
import { REDIS_CHANNELS, ScoreUpdatedEvent } from "../../../utils/types";

export interface ILeaderBoardPublisher {
    publishScoreUpdated(event: ScoreUpdatedEvent): Promise<void>;
}

@injectable()
export class LeaderBoardPublisher implements ILeaderBoardPublisher {

    async publishScoreUpdated(event: ScoreUpdatedEvent): Promise<void> {

        const startTime = Date.now();

        try {
            await publisher.publish(
                REDIS_CHANNELS.SCORE_UPDATED,
                JSON.stringify(event)
            );

            const responseTime = Date.now() - startTime;

            logger.info("Score update event published", {
                channel: REDIS_CHANNELS.SCORE_UPDATED,
                contestId: event.contestId,
                userId: event.userId,
                submissionId: event.submissionId,
                newScore: event.newScore,
                responseTime,
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.error("Failed to publish score update event", {
                channel: REDIS_CHANNELS.SCORE_UPDATED,
                userId: event.userId,
                submissionId: event.submissionId,
                responseTime,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        }
    }
}