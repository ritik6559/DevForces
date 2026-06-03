import { prismaClient } from "store/client";
import redis from "../../../libs/redis";
import { RawLeaderboardEntry } from "common-types";

export interface ILeaderBoardRepository {
    setScoreIfHigher(contestId: string, userId: string, newScore: number): Promise<void>;
    getTopPlayers(contestId: string, count: number): Promise<RawLeaderboardEntry[]>;
    getUserRank(contestId: string, userId: string): Promise<number | null>;
    getUserScore(contestId: string, userId: string): Promise<number | null>;
    getTotalParticipants(contestId: string): Promise<number>;
    rehydrateFromDb(contestId: string): Promise<void>;
}

/**
 * LeaderBoardRepository implements leaderboard data management using Redis for
 * fast ranking and PostgreSQL for durable persistence.
 */
export class LeaderBoardRepository implements ILeaderBoardRepository {

    private getRedisKey(contestId: string): string {
        return `leaderboard:${contestId}`;
    }

    private parseZrevrangeResult(
        results: string[],
        startRank: number
    ): RawLeaderboardEntry[] {

        const entries: RawLeaderboardEntry[] = [];

        for (let i = 0; i < results.length; i += 2) {
            entries.push({
                userId: results[i]!,
                score: parseInt(results[i + 1]!),
                rank: startRank + (i / 2) + 1,
            });
        }

        return entries;
    }

    /**
     * Records a user's contest score using GREATEST semantics — the stored value
     * is only ever raised to a new best, never lowered.
     */
    async setScoreIfHigher(contestId: string, userId: string, newScore: number): Promise<void> {
        const existing = await prismaClient.leaderBoard.findUnique({
            where: {
                contest_id_user_id: { contest_id: contestId, user_id: userId },
            },
        });

        if (!existing) {
            await prismaClient.leaderBoard.create({
                data: { contest_id: contestId, user_id: userId, total_score: newScore },
            });
        } else if (newScore > existing.total_score) {
            await prismaClient.leaderBoard.update({
                where: { contest_id_user_id: { contest_id: contestId, user_id: userId } },
                data: { total_score: newScore },
            });
        }

        await redis.zadd(this.getRedisKey(contestId), "GT", newScore, userId);
    }

    async getTopPlayers(contestId: string, count: number): Promise<RawLeaderboardEntry[]> {
        const results = await redis.zrevrange(
            this.getRedisKey(contestId), 0, count - 1, "WITHSCORES"
        );

        return this.parseZrevrangeResult(results, 0);
    }

    async getUserRank(contestId: string, userId: string): Promise<number | null> {
        const rank = await redis.zrevrank(this.getRedisKey(contestId), userId);

        return rank !== null ? rank + 1 : null;
    }

    async getUserScore(contestId: string, userId: string): Promise<number | null> {
        const score = await redis.zscore(this.getRedisKey(contestId), userId);

        return score !== null ? parseInt(score) : null;
    }

    async getTotalParticipants(contestId: string): Promise<number> {
        return redis.zcard(this.getRedisKey(contestId));
    }

    /**
     * Rebuilds the Redis ZSET from PostgreSQL when the cache is empty (e.g.
     * after a Redis restart or eviction). No-op when the cache already exists.
     */
    async rehydrateFromDb(contestId: string): Promise<void> {

        const key = this.getRedisKey(contestId);
        const exists = await redis.exists(key);

        if (exists) {
            return;
        }

        const entries = await prismaClient.leaderBoard.findMany({
            where: {
                contest_id: contestId
            },
            orderBy: {
                total_score: "desc"
            }
        });

        if (entries.length === 0) {
            return;
        }

        // Pipeline batches the commands into a single round-trip.
        const pipeline = redis.pipeline();

        for (const entry of entries) {
            pipeline.zadd(key, entry.total_score, entry.user_id);
        }

        await pipeline.exec();
    }

}
