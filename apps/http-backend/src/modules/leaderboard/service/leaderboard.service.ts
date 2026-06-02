import { inject, injectable } from "tsyringe";

import { type ILeaderBoardRepository } from "../repository/leaderboard.repository";
import { prismaClient } from "store/client";
import { NotFoundError } from "error-handler";
import { type IContestService } from "../../contest/service/contest.service";
import { logger } from "logger";
import { ScoreUpdatedEvent } from "../../../utils/types";
import { LeaderboardEntry, RawLeaderboardEntry, TopPlayersResponse, UserStandingResponse } from "common-types";

export interface ILeaderBoardService {
    getTopPlayers(contestId: string, count: number, ip?: string): Promise<TopPlayersResponse>;
    getUserStanding(contestId: string, userId: string, ip?: string): Promise<UserStandingResponse>;
    handleScoreUpdated(event: ScoreUpdatedEvent): Promise<void>;
}

/**
 * LeaderBoardService responsible for updating and retrieving leaderboard data
 * Implements business logic for score management, ranking retrieval, and user standing information
 */
@injectable()
export class LeaderBoardService implements ILeaderBoardService {

    constructor(
        @inject("ILeaderBoardRepository") private leaderboardRepository: ILeaderBoardRepository,
        @inject("IContestService") private contestService: IContestService
    ) { }

    async getTopPlayers(contestId: string, count: number, ip?: string): Promise<TopPlayersResponse> {

        const startTime = Date.now();

        try {

            logger.info("Checking for contest existence", { contestId, ip });

            const contestExists = await this.contestService.existsById(contestId);

            if (!contestExists) {

                logger.error("Contest not found", {
                    contestId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("Contest not found");
            }

            logger.info("Retrieving leaderboard data", { contestId, ip });

            // Self-heal the Redis cache from Postgres if it was lost/evicted.
            await this.leaderboardRepository.rehydrateFromDb(contestId);

            const [entries, total_participants] = await Promise.all([
                this.leaderboardRepository.getTopPlayers(contestId, count),
                this.leaderboardRepository.getTotalParticipants(contestId),
            ]);

            return {
                players: await this.enrichWithUsernames(entries),
                total_participants,
            };
        } catch (error) {

            const duration = Date.now() - startTime;

            logger.error("Error retrieving leaderboard data", {
                contestId,
                ip,
                duration,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;

        }
    }

    async getUserStanding( contestId: string, userId: string, ip?: string ): Promise<UserStandingResponse> {

        const startTime = Date.now();

        try {

            logger.info("Fetching user standing", {
                contestId,
                userId,
                ip
            });

            const contestExists = await this.contestService.existsById(contestId);

            if (!contestExists) {
                logger.warn("Contest not found", {
                    contestId,
                    userId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("Contest not found");
            }

            // TODO add separate user service
            // const userExists = await prismaClient.user.findUnique({
            //     where: { user_id: userId },
            //     select: { user_id: true }
            // });

            // if (!userExists) {
            //     logger.warn("User not found", {
            //         contestId,
            //         userId,
            //         ip,
            //         duration: Date.now() - startTime
            //     });

            //     throw new NotFoundError("User not found");
            // }

            // Self-heal the Redis cache from Postgres if it was lost/evicted.
            await this.leaderboardRepository.rehydrateFromDb(contestId);

            const [rank, score, total_participants] = await Promise.all([
                this.leaderboardRepository.getUserRank(contestId, userId),
                this.leaderboardRepository.getUserScore(contestId, userId),
                this.leaderboardRepository.getTotalParticipants(contestId),
            ]);

            if (rank === null || score === null) {

                logger.warn("User has no submissions in contest", {
                    contestId,
                    userId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("User has not submitted for this contest yet");
            }

            const duration = Date.now() - startTime;

            logger.info("User standing retrieved successfully", {
                contestId,
                userId,
                rank,
                score,
                total_participants,
                ip,
                duration
            });

            return {
                rank,
                score,
                total_participants,
            };

        } catch (error) {

            const duration = Date.now() - startTime;

            logger.error("Error fetching user standing", {
                contestId,
                userId,
                ip,
                duration,
                error: error instanceof Error ? error.message : String(error)
            });

            throw error;
        }
    }

    async handleScoreUpdated(event: ScoreUpdatedEvent): Promise<void> {
        const startTime = Date.now();

        try {
            await this.leaderboardRepository.upsertScore(
                event.contestId,
                event.userId,
                event.scoreDelta,
                event.newScore
            );

            const responseTime = Date.now() - startTime;
            logger.info("Leaderboard score upserted", {
                contestId:    event.contestId,
                userId:       event.userId,
                submissionId: event.submissionId,
                newScore:     event.newScore,
                responseTime,
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.error("Failed to upsert leaderboard score", {
                contestId:    event.contestId,
                userId:       event.userId,
                submissionId: event.submissionId,
                responseTime,
                error: error instanceof Error ? error.message : "Unknown error",
            });
            throw error;
        }
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