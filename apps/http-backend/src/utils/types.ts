export const REDIS_CHANNELS = {
    SCORE_UPDATED: "score:updated",
} as const;

/**
 * Score events are delivered via a Redis Stream + consumer group rather than
 * Pub/Sub. Pub/Sub fans out to EVERY subscriber, so with N backend replicas a
 * single event would be processed N times and the Postgres score incremented
 * N times. A consumer group delivers each event to exactly one consumer.
 */
export const SCORE_STREAM = "stream:score:events";
export const SCORE_CONSUMER_GROUP = "leaderboard-workers";

export interface ScoreUpdatedEvent {
    contestId:    string;
    userId:       string;
    submissionId: string;
    newScore:     number;
    scoreDelta:   number;
    totalScore:   number;
}