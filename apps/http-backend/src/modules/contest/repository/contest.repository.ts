import { injectable, singleton } from "tsyringe";
import type { Contest, CreateContest, UpdateContest } from "../../../types";
import { prismaClient } from "store/client";

export interface IContestRepository {
    getAllContests(): Promise<Contest[]>;
    findById(contestId: string): Promise<Contest | null>;
    existsById(contestId: string): Promise<boolean>;
    addChallengeToContest(contestId: string, challengeId: string): Promise<void>;
    deleteChallengeFromContest(contestId: string, challengeId: string): Promise<void>;
    updateContest(updateContest: UpdateContest, contestId: string): Promise<Contest>;
    createContest(createContest: CreateContest): Promise<Contest>;
    deleteContest(contestId: string): Promise<void>;
}

@singleton()
@injectable()
export class ContestRepository implements IContestRepository {
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
        await prismaClient.contestToChallengeMapping.create({
            data: {
                challenge_id: challengeId,
                contest_id: contestId,
                index: 0
            }
        })
    }

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
        await prismaClient.contest.delete({
            where: {
                contest_id: contestId
            }
        })
    }
    
}