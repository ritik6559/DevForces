import { injectable, singleton } from "tsyringe";
import { prismaClient } from "store/client";

import type { Challenge, CreateChallenge, UpdateChallenge } from "common-types";

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
        const challenges = await prismaClient.challenge.findMany();

        return challenges.map((c) => ({
            ...c,
            allowed_deps:
                c.allowed_deps && typeof c.allowed_deps === "object"
                    ? (c.allowed_deps as Record<string, string>)
                    : {},
        }));
    }

    async findChallengeById(id: string): Promise<Challenge | null> {
        const challenge = await prismaClient.challenge.findUnique({
            where: { challenge_id: id },
        });

        if (!challenge) return null;

        return {
            ...challenge,
            allowed_deps:
                challenge.allowed_deps && typeof challenge.allowed_deps === "object"
                    ? (challenge.allowed_deps as Record<string, string>)
                    : {},
        };
    }

    async updateChallenge(updateChallenge: UpdateChallenge, id: string): Promise<Challenge> {
        const challenge = await prismaClient.challenge.update({
            where: { challenge_id: id },
            data: {
                ...updateChallenge,
                allowed_deps: updateChallenge.allowed_deps as any,
            },
        });

        return {
            ...challenge,
            allowed_deps:
                challenge.allowed_deps && typeof challenge.allowed_deps === "object"
                    ? (challenge.allowed_deps as Record<string, string>)
                    : {},
        };
    }

    async createChallenge(createChallenge: CreateChallenge): Promise<Challenge> {
        const challenge = await prismaClient.challenge.create({
            data: {
                ...createChallenge,
                allowed_deps: createChallenge.allowed_deps as any,
            },
        });

        return {
            ...challenge,
            allowed_deps:
                challenge.allowed_deps && typeof challenge.allowed_deps === "object"
                    ? (challenge.allowed_deps as Record<string, string>)
                    : {},
        };
    }
    async deleteChallenge(id: string): Promise<void> {
        await prismaClient.challenge.delete({
            where: {
                challenge_id: id
            }
        });
    }

}