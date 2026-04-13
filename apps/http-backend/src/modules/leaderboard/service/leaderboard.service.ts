import { inject, injectable } from "tsyringe";

import { ILeaderBoardRepository, RawLeaderboardEntry } from "../repository/leaderboard.repository";
import { prismaClient } from "store/client";
import { NotFoundError } from "error-handler";

export interface LeaderboardEntry {
    rank: number,
    userId: string,
    username: string,
    score: number
}

export interface TopPlayersResponse {
    players: LeaderboardEntry[],
    total_participants: number
}

export interface UserStandingResponse {
    rank: number;
    score: number;
    total_participants: number;
}

export interface ILeaderBoardService {
    getTopPlayers(contestId: string, count: number): Promise<TopPlayersResponse>;
    getUserStanding(contestId: string, userId: string): Promise<UserStandingResponse>;
}

@injectable()
export class LeaderBoardService implements ILeaderBoardService {

    constructor(@inject("ILeaderBoardRepository") private leaderboardRepository: ILeaderBoardRepository) { }

    async getTopPlayers(contestId: string, count: number): Promise<TopPlayersResponse> {
        const [entries, total_participants] = await Promise.all([
            this.leaderboardRepository.getTopPlayers(contestId, count),
            this.leaderboardRepository.getTotalParticipants(contestId),
        ]);

        return {
            players: await this.enrichWithUsernames(entries),
            total_participants,
        };
    }

    async getUserStanding(contestId: string, userId: string): Promise<UserStandingResponse> {
        const [rank, score, total_participants] = await Promise.all([
            this.leaderboardRepository.getUserRank(contestId, userId),
            this.leaderboardRepository.getUserScore(contestId, userId),
            this.leaderboardRepository.getTotalParticipants(contestId),
        ]);

        if (rank === null || score === null) {
            throw new NotFoundError("User has not submitted for this contest yet");
        }

        return {
            rank,
            score,
            total_participants,
        };
    }

    private async enrichWithUsernames(entries: RawLeaderboardEntry[]): Promise<LeaderboardEntry[]> {

        if (entries.length === 0) return [];

        const users = await prismaClient.user.findMany({
            where: { user_id: { in: entries.map((e) => e.userId) } },
            select: { user_id: true, username: true },
        });

        const usernameMap = new Map(users.map((u) => [u.user_id, u.username]));

        return entries.map((entry) => ({
            ...entry,
            username: usernameMap.get(entry.userId) ?? "Unknown",
        }));
    }


}