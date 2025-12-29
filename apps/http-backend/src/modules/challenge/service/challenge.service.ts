import { container, injectable } from "tsyringe";
import type { Challenge, CreateChallenge, UpdateChallenge } from "../../../types";
import { ChallengeRespository, type IChallengeRepository } from "../repository/challenge.repository";

export interface IChallengeService {
    getAllChallenges(): Promise<Challenge[]>;
    findChallengeById(id: string): Promise<Challenge | null>;
    updateChallenge( updateChallenge: UpdateChallenge ): Promise<Challenge>;
    createChallenge( createChallenge: CreateChallenge ): Promise<Challenge>;
    deleteChallenge(id: string): Promise<void>;
}

@injectable()
export class ChallengeService implements IChallengeService {

    private challengeRepository: IChallengeRepository;

    constructor() {
        this.challengeRepository = container.resolve(ChallengeRespository);
    }

    getAllChallenges(): Promise<Challenge[]> {
        throw new Error("Method not implemented.");
    }
    
    findChallengeById(id: string): Promise<Challenge | null> {
        throw new Error("Method not implemented.");
    }
    
    updateChallenge(updateChallenge: UpdateChallenge): Promise<Challenge> {
        throw new Error("Method not implemented.");
    }
    
    createChallenge(createChallenge: CreateChallenge): Promise<Challenge> {
        throw new Error("Method not implemented.");
    }
    
    deleteChallenge(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}