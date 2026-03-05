import { container, injectable } from "tsyringe";
import type { Challenge, CreateChallenge, UpdateChallenge } from "../../../types";
import { ChallengeRespository, type IChallengeRepository } from "../repository/challenge.repository";
import { logger } from "../../../libs/logger";
import { InternalServerError, NotFoundError, ValidationError } from "../../../errors";

export interface IChallengeService {
    getAllChallenges(ip?: string): Promise<Challenge[]>;
    findChallengeById(id: string, ip?: string): Promise<Challenge | null>;
    updateChallenge(updateChallenge: UpdateChallenge, challengeId: string, ip?: string): Promise<Challenge>;
    createChallenge(createChallenge: CreateChallenge, ip?: string): Promise<Challenge>;
    deleteChallenge(id: string, ip?: string): Promise<void>;
}

/**
 * ChallengeService handles challenge business logic
 * Implements CRUD operations
 */
@injectable()
export class ChallengeService implements IChallengeService {

    private challengeRepository: IChallengeRepository;

    constructor() {
        this.challengeRepository = container.resolve(ChallengeRespository);
    }

    /**
     * Retrieves all challeneges
     * 
     * @param ip - Optional IP address for logging
     * @returns Array of all challenges
     */
    async getAllChallenges(ip?: string): Promise<Challenge[]> {
        const startTime = Date.now();

        try {
            logger.debug("Fetching all challenges", { ip });

            const challenges = await this.challengeRepository.getAllChallenge();

            logger.info("All challenges fetched successfully", {
                count: challenges.length,
                ip,
                duration: Date.now() - startTime
            });

            return challenges;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to fetch challenges", {
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to retrieve challenges");
        }
    }

    /**
     * Finds a challenge by ID
     * 
     * @param challengeId - Challenge ID to search for
     * @param ip - Optional IP address for logging
     * @returns Challenge if found, null otherwise
     */
    async findChallengeById(challengeId: string, ip?: string): Promise<Challenge | null> {
        const startTime = Date.now();

        try {

            logger.debug("Fetching challenge by id", { challengeId, ip });

            const challenge = await this.challengeRepository.findChallengeById(challengeId);

            if (!challenge) {

                logger.error("Challenge not found", {
                    challengeId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("Failed to fetch challenge by id: ", challengeId);
            }

            logger.info("Challenge found", {
                challengeId,
                challengeTitle: challenge.title,
                ip,
                duration: Date.now() - startTime
            });

            return challenge;
        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to fetch challenge by ID", {
                challengeId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to retrieve challenge");
        }
    }

    /**
     * Updates an existing challenge
     * 
     * @param updateChallenge - Challenge data to update
     * @param challengeId - Challenge ID to update
     * @param ip - Optional IP address for logging
     * @returns Updated challenge
     * @throws NotFoundError if challenge doesn't exist
     */
    async updateChallenge(updateChallenge: UpdateChallenge, challengeId: string, ip?: string): Promise<Challenge> {
        const startTime = Date.now();

        try {

            logger.debug("Updating challenge", {
                challengeId,
                updateData: updateChallenge,
                ip
            });

            const challenge = await this.challengeRepository.findChallengeById(challengeId);

            if( challenge == null ) {
                
                logger.warn("Attempt to update non-existent challenge", {
                    challengeId,
                    ip
                });
                
                throw new NotFoundError("Challenge not found.", )
            }

            const updatedChallenge = await this.challengeRepository.updateChallenge(updateChallenge, challengeId);

            logger.info("Challenge updated successfully", {
                challengeId,
                challengeTitle: challenge.title,
                ip,
                duration: Date.now() - startTime
            });

            return updatedChallenge;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to fetch challenge by ID", {
                challengeId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to retrieve challenge");
        }
    }

    /**
     * Creates a new challenge
     * 
     * @param createChallenge - Challenge data to create
     * @param ip - Optional IP address for logging
     * @return Created CHallenge
     */
    async createChallenge(createChallenge: CreateChallenge, ip?: string): Promise<Challenge> {
        const startTime = Date.now();

        try{

            logger.debug("Creating challenge", {
                createData: createChallenge,
                ip
            });

            const newChallenge = await this.challengeRepository.createChallenge(createChallenge);

            logger.info("Challenge created successfully", {
                challengeId: newChallenge.challenge_id,
                challlengeTitle: newChallenge.title,
                ip,
                duration: Date.now() - startTime
            });

            return newChallenge;
        } catch (error){
            const duration = Date.now() - startTime;

            logger.error("Failed to create challenge", {
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to create challenge");
        }
    }

    /**
     * Deletes a challenge
     * 
     * @param challengeId - Challenge ID to delete
     * @param ip - Optional IP address to delete
     * @throws NotFoundError if contest doesn't exists
     */
    async deleteChallenge(challengeId: string, ip?: string): Promise<void> {
        const startTime = Date.now();

        try{

            logger.debug("Deleting challenge", {
                challengeId,
                ip
            });

            const challenge = await this.challengeRepository.findChallengeById(challengeId);

            if( challenge == null ) {
                logger.warn("Attempt to delete a non-existent challenge", {
                    challengeId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("Challenge not found");
            }

            await this.challengeRepository.deleteChallenge(challengeId);

            logger.info("Challenge deleted sucessfully", {
                challengeId,
                ip,
                duration: Date.now() - startTime
            });

        } catch (error) {
             const duration = Date.now() - startTime;

            logger.error("Failed to delete challenge", {
                challengeId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to delete challenge");
        }
    }
}