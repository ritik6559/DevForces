import { prismaClient } from "store/client";

import type { Challenge, CreateChallenge, UpdateChallenge } from "common-types";

export interface IChallengeRepository {
    getAllChallenge(): Promise<Challenge[]>;
    existsById(challengeId: string): Promise<boolean>;
    findChallengeById(challengeId: string): Promise<Challenge | null>;
    getChallengesByContestId(contestId: string): Promise<Challenge[]>;
    updateChallenge(updateChallenge: UpdateChallenge, id: string): Promise<Challenge>;
    createChallenge(createChallenge: CreateChallenge): Promise<Challenge>;
    deleteChallenge(id: string): Promise<void>;
}

export class ChallengeRespository implements IChallengeRepository {

    async getAllChallenge(): Promise<Challenge[]> {
        return await prismaClient.challenge.findMany();
    }

    async existsById(challengeId: string): Promise<boolean> {
        const challenge = await prismaClient.challenge.findUnique({
            where: {
                challenge_id: challengeId
            }
        });

        return challengeId != null;

    }

    async findChallengeById(id: string): Promise<Challenge | null> {
        return await prismaClient.challenge.findUnique({
            where: { challenge_id: id },
        });
    }

    async getChallengesByContestId(contestId: string): Promise<Challenge[]> {
        return await prismaClient.contestToChallengeMapping.findMany({
            where: { contest_id: contestId },
            include: {
                challenge: true,
            },
        }).then(mappings => mappings.map(mapping => mapping.challenge));
    }

    async updateChallenge(updateChallenge: UpdateChallenge, id: string): Promise<Challenge> {
        return await prismaClient.challenge.update({
            where: { challenge_id: id },
            data: {
                ...updateChallenge,
            },
        });
    }

    async createChallenge(createChallenge: CreateChallenge): Promise<Challenge> {
        return await prismaClient.challenge.create({
            data: {
                ...createChallenge,
            },
        });
    }
    async deleteChallenge(id: string): Promise<void> {
        await prismaClient.challenge.delete({
            where: {
                challenge_id: id
            }
        });
    }

}