export const REDIS_CHANNELS = {
    SCORE_UPDATED: "score:updated",
} as const;

export interface ScoreUpdatedEvent {
    contestId:    string;
    userId:       string;
    submissionId: string;
    newScore:     number;
    scoreDelta:   number;
    totalScore:   number;
}