import Redis, { type RedisOptions } from "ioredis";
import { REDIS_URL } from "../utils/config";
import { logger } from "logger";

const baseOptions: RedisOptions = {
    maxRetriesPerRequest: null,
    lazyConnect: true,
};

const createClient = (role: string): Redis => {
    const client = new Redis(REDIS_URL, baseOptions);

    client.on("error", (err) => {
        logger.error(`Redis ${role} error`, { error: err.message });
    });

    client.on("connect", () => {
        logger.info(`Redis ${role} connected successfully`);
    });

    return client;
};

export const redis = createClient("client");
export const publisher = createClient("publisher");
export const subscriber = createClient("subscriber");

export const closeRedis = async (): Promise<void> => {
    await Promise.allSettled([redis.quit(), publisher.quit(), subscriber.quit()]);
};

export default redis;
