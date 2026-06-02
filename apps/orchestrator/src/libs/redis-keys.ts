export const ACTIVITY_TTL_SECONDS = 300; // 5 minutes

/** Refreshed by the heartbeat; absence means the user is idle. */
export const activityKey = (userId: string, challengeId: string, contestId: string): string =>
    `activity:${userId}:${challengeId}:${contestId}`;

/** Set by http-backend while a submission is being judged (must match its format). */
export const submittingKey = (userId: string, challengeId: string): string =>
    `submitting:${userId}:${challengeId}`;
