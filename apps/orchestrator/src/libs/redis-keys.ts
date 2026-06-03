export const ACTIVITY_TTL_SECONDS = 300; // 5 minutes

export const activityKey = (userId: string, challengeId: string, contestId: string): string =>
    `activity:${userId}:${challengeId}:${contestId}`;

export const submittingKey = (userId: string, challengeId: string): string =>
    `submitting:${userId}:${challengeId}`;
