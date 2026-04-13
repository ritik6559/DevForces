import { prismaClient } from "store/client";
import redis from "../../../libs/redis";

export interface RawLeaderboardEntry {
    userId: string;
    score: number;
    rank: number;
}

export interface ILeaderBoardRepository {
    upsertScore(contestId: string, userId: string, scoreDelta: number, newScore: number): Promise<void>;
    getTopPlayers(contestId: string, count: number): Promise<RawLeaderboardEntry[]>;
    getUserRank(contestId: string, userId: string): Promise<number | null>;
    getUserScore(contestId: string, userId: string): Promise<number | null>;
    getTotalParticipants(contestId: string): Promise<number>
    rehydarteFromDb(contestId: string): Promise<void>;
}

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

    async upsertScore(contestId: string, userId: string, scoreDelta: number, newScore: number): Promise<void> {

        const key = this.getRedisKey(contestId);

        const existingScore = await redis.zscore(key, userId);

        if (existingScore == null) {
            await redis.zadd(key, newScore, userId);
        } else {
            await redis.zincrby(key, scoreDelta, userId);
        }

        await prismaClient.leaderBoard.upsert({
            where: {
                contest_id_user_id: {
                    contest_id: contestId,
                    user_id: userId
                }
            },
            update: { total_score: { increment: scoreDelta } },
            create: {
                contest_id: contestId,
                user_id: userId,
                total_score: newScore
            }
        });

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

    // rebuilds Redis from PostgreSQL if empty
    async rehydarteFromDb(contestId: string): Promise<void> {
        
        const key = this.getRedisKey(contestId);
        const exists = await redis.exists(key);
        
        if( exists ) {
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
        
        if( entries.length == 0 ) {
            return;
        }

        // Redis pipelining is a technique for improving performance by issuing multiple commands at once without waiting for the response to each individual command
        const pipeline = redis.pipeline();

        for( const entry of entries ) {
            pipeline.zadd(key, entry.total_score, entry.user_id);
        }

        await pipeline.exec();
    }

}