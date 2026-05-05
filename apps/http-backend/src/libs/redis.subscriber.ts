import Redis from "ioredis";
import { REDIS_URL } from "../utils/config";
import { logger } from "logger";

export const subscriber = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

subscriber.on("error", (err) => {
    logger.error("Redis Subscriber Error:", {
        error: err.message,
    });
});

subscriber.on("connect", () => {
    logger.info("Redis Subscriber connected successfully.");
});