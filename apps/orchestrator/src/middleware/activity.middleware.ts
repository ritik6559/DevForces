import type { Request, Response, NextFunction } from "express";
import { redis } from "../libs/redis";
import { activityKey, ACTIVITY_TTL_SECONDS } from "../libs/redis-keys";

/**
 * Refreshes a user's workspace activity TTL on authenticated, workspace-scoped
 * requests (those carrying `:contestId` and `:challengeId` route params).
 */
export function activityMiddleware(req: Request, _res: Response, next: NextFunction): void {
    const userId = req.user?.userId;
    const { contestId, challengeId } = req.params;

    if (userId && contestId && challengeId) {
        redis
            .set(activityKey(userId, challengeId, contestId), "1", "EX", ACTIVITY_TTL_SECONDS)
            .catch(() => { /* fire-and-forget */ });
    }

    next();
}
