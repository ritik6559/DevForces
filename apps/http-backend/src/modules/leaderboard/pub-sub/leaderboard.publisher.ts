import { publisher } from "../../../libs/redis";
import { logger } from "logger";
import { SCORE_STREAM, ScoreUpdatedEvent } from "../../../utils/types";

export interface ILeaderBoardPublisher {
    publishScoreUpdated(event: ScoreUpdatedEvent): Promise<void>;
}

export class LeaderBoardPublisher implements ILeaderBoardPublisher {

    /**
     * Appends a score event to the Redis Stream. A consumer group ensures the
     * event is processed exactly once across all backend replicas.
     */
    async publishScoreUpdated(event: ScoreUpdatedEvent): Promise<void> {

        const startTime = Date.now();

        try {
            await publisher.xadd(SCORE_STREAM, "*", "data", JSON.stringify(event));

            logger.info("Score update event published", {
                stream: SCORE_STREAM,
                contestId: event.contestId,
                userId: event.userId,
                submissionId: event.submissionId,
                newScore: event.newScore,
                responseTime: Date.now() - startTime,
            });

        } catch (error) {
            logger.error("Failed to publish score update event", {
                stream: SCORE_STREAM,
                userId: event.userId,
                submissionId: event.submissionId,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : "Unknown error",
            });

            throw error;
        }
    }
}
