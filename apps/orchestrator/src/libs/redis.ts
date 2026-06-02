import Redis from "ioredis";
import { REDIS_URL } from "../utils/config";
import { logger } from "logger";

/**
 * Redis connection for the orchestrator.
 *
 * Shares the same Redis instance as http-backend so this service can read the
 * `activity:*` keys (refreshed by the heartbeat) and `submitting:*` locks (set
 * during a judge run) when deciding whether a workspace is safe to reap.
 */
export const redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

redis.on("error", (err) => {
    logger.error("Redis error", { error: err.message });
});

redis.on("connect", () => {
    logger.info("Redis connected successfully");
});

export const closeRedis = async (): Promise<void> => {
    await redis.quit();
};
