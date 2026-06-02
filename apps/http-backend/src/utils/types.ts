export const REDIS_CHANNELS = {
    SCORE_UPDATED: "score:updated",
} as const;

export const SCORE_STREAM = "stream:score:events";
export const SCORE_CONSUMER_GROUP = "leaderboard-workers";

export interface ScoreUpdatedEvent {
    contestId:    string;
    challengeId:  string;
    userId:       string;
    submissionId: string;
    newScore:     number;
}