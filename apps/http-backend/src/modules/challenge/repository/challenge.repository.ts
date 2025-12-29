import { injectable, singleton } from "tsyringe";
import type { Challenge, CreateChallenge, UpdateChallenge } from "../../../types";
import { prismaClient } from "store/client";

export interface IChallengeRepository {
    getAllChallenge(): Promise<Challenge[]>;
    findChallengeById(id: string): Promise<Challenge | null>;
    updateChallenge(updateChallenge: UpdateChallenge, id: string): Promise<Challenge>;
    createChallenge(createChallenge: CreateChallenge): Promise<Challenge>;
    deleteChallenge(id: string): Promise<void>;
}

@singleton()
@injectable()
export class ChallengeRespository implements IChallengeRepository {
    
    async getAllChallenge(): Promise<Challenge[]> {
        return prismaClient.challenge.findMany();
    }

    async findChallengeById(id: string): Promise<Challenge | null> {
        return await prismaClient.challenge.findUnique({
            where: {
                challenge_id: id
            }
        });
    }

    async updateChallenge(updateChallenge: UpdateChallenge, id: string): Promise<Challenge> {
        return await prismaClient.challenge.update({
            where: {
                challenge_id: id
            },
            data: updateChallenge
        });
    }

    async createChallenge(createChallenge: CreateChallenge): Promise<Challenge> {
        return await prismaClient.challenge.create({
            data: createChallenge
        });
    }

    async deleteChallenge(id: string): Promise<void> {
        prismaClient.challenge.delete({
            where: {
                challenge_id: id
            }
        });
    }

}