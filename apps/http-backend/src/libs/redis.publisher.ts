import Redis from "ioredis";
import { REDIS_URL } from "../utils/config";
import { logger } from "logger";

export const publisher = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    lazyConnect: true,
});

publisher.on("error", (err) => {
    logger.error("Redis Publisher Error:", {
        error: err.message,
    });
});

publisher.on("connect", () => {
    logger.info("Redis Publisher connected successfully.");
});