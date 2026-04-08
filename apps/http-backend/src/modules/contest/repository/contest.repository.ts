import { injectable, singleton } from "tsyringe";
import type { Challenge, Contest, CreateContest, UpdateContest } from "common-types";
import { prismaClient } from "store/client";

export interface IContestRepository {
    getAllContests(): Promise<Contest[]>;
    findById(contestId: string): Promise<Contest | null>;
    existsById(contestId: string): Promise<boolean>;
    getAllChallengesInContest(contestId: string): Promise<Challenge[]>;
    addChallengeToContest(contestId: string, challengeId: string): Promise<void>;
    deleteChallengeFromContest(contestId: string, challengeId: string): Promise<void>;
    updateContest(updateContest: UpdateContest, contestId: string): Promise<Contest>;
    createContest(createContest: CreateContest): Promise<Contest>;
    deleteContest(contestId: string): Promise<void>;
}

export class ContestRepository implements IContestRepository {

    async getAllContests(): Promise<Contest[]> {
        return await prismaClient.contest.findMany();
    }

    async findById(contestId: string): Promise<Contest | null> {
        return await prismaClient.contest.findUnique({
            where: {
                contest_id: contestId
            }
        });
    }

    async existsById(contestId: string): Promise<boolean> {

        const contest = await prismaClient.contest.findUnique({
            where: {
                contest_id: contestId
            }
        });

        return contest != null;
    }

    async getAllChallengesInContest(contestId: string): Promise<Challenge[]> {
        const mappings = await prismaClient.contestToChallengeMapping.findMany({
            where: {
                contest_id: contestId
            },
            include: {
                challenge: true
            }
        });
        return mappings.map(mapping => mapping.challenge);
    }

    async deleteChallengeFromContest(contestId: string, challengeId: string): Promise<void> {
        await prismaClient.contestToChallengeMapping.delete({
            where: {
                contest_id_challenge_id: {
                    contest_id: contestId,
                    challenge_id: challengeId
                }
            }
        });
    }

    async addChallengeToContest(contestId: string, challengeId: string): Promise<void> {
        await prismaClient.$transaction(async (tx) => {
            const last = await tx.contestToChallengeMapping.findFirst({
                where: { contest_id: contestId },
                orderBy: { index: 'desc' },
                select: { index: true }
            });

            await tx.contestToChallengeMapping.create({
                data: {
                    contest_id: contestId,
                    challenge_id: challengeId,
                    index: last ? last.index + 1 : 0
                }
            });
        });
    }

    async updateContest(updateContest: UpdateContest, contestId: string): Promise<Contest> {
        return await prismaClient.contest.update({
            where: {
                contest_id: contestId
            },
            data: updateContest
        });
    }

    async createContest(createContest: CreateContest): Promise<Contest> {
        return await prismaClient.contest.create({
            data: createContest
        });
    }

    async deleteContest(contestId: string): Promise<void> {
        await prismaClient.$transaction(async (tx) => {
            await tx.contestToChallengeMapping.deleteMany({
                where: { contest_id: contestId }
            });

            await tx.contest.delete({
                where: { contest_id: contestId }
            });
        });
    }

}