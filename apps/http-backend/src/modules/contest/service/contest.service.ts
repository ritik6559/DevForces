import { container, inject, injectable } from "tsyringe";
import type { Contest, CreateContest, UpdateContest } from "common-types";
import { ContestRepository, type IContestRepository } from "../repository/contest.repository";
import { logger } from "logger";
import { NotFoundError, ValidationError, InternalServerError } from "../../../errors";
import { ChallengeRespository, type IChallengeRepository } from "../../challenge/repository/challenge.repository";

export interface IContestService {
    getAllContests(ip?: string): Promise<Contest[]>;
    findById(contestId: string, ip?: string): Promise<Contest | null>;
    existsById(contestId: string, ip?: string): Promise<boolean>;
    addChallengeToContest(contestId: string, challengeId: string, ip?: string): Promise<void>;
    deleteChallengeFromContest(contestId: string, challengeId: string, ip?: string): Promise<void>;
    updateContest(updateContest: UpdateContest, contestId: string, ip?: string): Promise<Contest>;
    createContest(createContest: CreateContest, ip?: string): Promise<Contest>;
    deleteContest(contestId: string, ip?: string): Promise<void>;
}

/**
 * ContestService handles contest business logic
 * Implements CRUD operations
 */
@injectable()
export class ContestService implements IContestService {

    constructor(
        @inject("IContestRepository") private contestRepository: IContestRepository,
        @inject("IChallengeRepository") private challengeRepository: IChallengeRepository
    ) {} 

    /**
     * Retrieves all contests
     * 
     * @param ip - Optional IP address for logging
     * @returns Array of all contests
     */
    async getAllContests(ip?: string): Promise<Contest[]> {
        const startTime = Date.now();

        try {
            logger.debug("Fetching all contests", { ip });

            const contests = await this.contestRepository.getAllContests();

            logger.info("All contests fetched successfully", {
                count: contests.length,
                ip,
                duration: Date.now() - startTime
            });

            return contests;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to fetch contests", {
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to retrieve contests");
        }
    }

    /**
     * Finds a contest by ID
     * 
     * @param contestId - Contest ID to search for
     * @param ip - Optional IP address for logging
     * @returns Contest if found, null otherwise
     */
    async findById(contestId: string, ip?: string): Promise<Contest | null> {
        const startTime = Date.now();

        try {
            logger.debug("Fetching contest by ID", { contestId, ip });

            const contest = await this.contestRepository.findById(contestId);

            if (contest) {
                logger.info("Contest found", {
                    contestId,
                    contestTitle: contest.title,
                    ip,
                    duration: Date.now() - startTime
                });
            } else {
                logger.debug("Contest not found", {
                    contestId,
                    ip,
                    duration: Date.now() - startTime
                });

                throw new NotFoundError("Contest not found with id: " + contestId);
            }

            return contest;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to fetch contest by ID", {
                contestId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to retrieve contest");
        }
    }

    /**
     * Checks if a contest exists by ID
     * 
     * @param contestId - Contest ID to check
     * @param ip - Optional IP address for logging
     * @returns True if contest exists, false otherwise
     */
    async existsById(contestId: string, ip?: string): Promise<boolean> {
        const startTime = Date.now();

        try {

            logger.debug("Checking contest existence", { contestId, ip });

            const exists = await this.contestRepository.existsById(contestId);

            logger.debug("Contest existence checked", {
                contestId,
                exists,
                ip,
                duration: Date.now() - startTime
            });

            return exists;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to check contest existence", {
                contestId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to check contest existence");
        }
    }

    /**
     * Updates an existing contest
     * 
     * @param updateContest - Contest data to update
     * @param contestId - Contest ID to update
     * @param ip - Optional IP address for logging
     * @returns Updated contest
     * @throws NotFoundError if contest doesn't exist
     */
    async updateContest(
        updateContest: UpdateContest,
        contestId: string,
        ip?: string
    ): Promise<Contest> {
        const startTime = Date.now();

        try {
            logger.debug("Updating contest", {
                contestId,
                updateData: updateContest,
                ip
            });

            const exists = await this.contestRepository.existsById(contestId);

            if (!exists) {
                logger.warn("Attempt to update non-existent contest", {
                    contestId,
                    ip
                });

                throw new NotFoundError("Contest not found");
            }

            const updatedContest = await this.contestRepository.updateContest(
                updateContest,
                contestId
            );

            logger.info("Contest updated successfully", {
                contestId,
                contestTitle: updatedContest.title,
                ip,
                duration: Date.now() - startTime
            });

            return updatedContest;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to update contest", {
                contestId,
                updateData: updateContest,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to update contest");
        }
    }

    /**
     * Creates a new contest
     * 
     * @param createContest - Contest data to create
     * @param ip - Optional IP address for logging
     * @returns Created contest
     */
    async createContest(createContest: CreateContest, ip?: string): Promise<Contest> {
        const startTime = Date.now();

        try {

            logger.debug("Creating new contest", {
                contestData: createContest,
                ip
            });

            const newContest = await this.contestRepository.createContest(createContest);

            logger.info("Contest created successfully", {
                contestId: newContest.contest_id,
                contestTitle: newContest.title,
                ip,
                duration: Date.now() - startTime
            });

            return newContest;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to create contest", {
                contestData: createContest,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to create contest");
        }
    }

    /**
     * Deletes a contest by ID
     * 
     * @param contestId - Contest ID to delete
     * @param ip - Optional IP address for logging
     * @throws NotFoundError if contest doesn't exist
     */
    async deleteContest(contestId: string, ip?: string): Promise<void> {
        const startTime = Date.now();

        try {
            logger.debug("Deleting contest", { contestId, ip });

            const exists = await this.contestRepository.existsById(contestId);

            if (!exists) {
                logger.warn("Attempt to delete non-existent contest", {
                    contestId,
                    ip
                });

                throw new NotFoundError("Contest not found");
            }

            await this.contestRepository.deleteContest(contestId);

            logger.info("Contest deleted successfully", {
                contestId,
                ip,
                duration: Date.now() - startTime
            });

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to delete contest", {
                contestId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to delete contest");
        }
    }

    /**
     * Add a challenge to a contest
     * 
     * @param contestId Contest ID to which challenge is to be added
     * @param challengeId Challenge ID to be added
     * @param ip Optional IP address for logging
     */
    async addChallengeToContest(contestId: string, challengeId: string, ip?: string): Promise<void> {
        const startTime = Date.now();

        try {
            logger.debug("Adding challenge to contest", { contestId, challengeId, ip });

            const contest = await this.contestRepository.findById(contestId);

            if (!contest) {
                logger.warn("Attempt to add challenge to non-existent contest", {
                    contestId,
                    challengeId,
                    ip
                });

                throw new NotFoundError("Contest not found");
            }

            const challenge = await this.challengeRepository.findChallengeById(challengeId);

            if (!challenge) {
                logger.warn("Attempt to add non-existent challenge to contest", {
                    contestId,
                    challengeId,
                    ip
                });

                throw new NotFoundError("Challenge not found");
            }

            await this.contestRepository.addChallengeToContest(contestId, challengeId);

            logger.info("Challenge added to contest successfully", {
                contestId,
                challengeId,
                ip,
                duration: Date.now() - startTime
            });

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to add challenge to contest", {
                contestId,
                challengeId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to add challenge to contest");
        } 
    }

    /**
     * Delete a challenge from a contest
     * 
     * @param contestId Contest ID from which challenge is to be deleted
     * @param challengeId Challenge ID to be deleted
     * @param ip Optional IP address from logging
     */
    async deleteChallengeFromContest(contestId: string, challengeId: string, ip?: string): Promise<void> {
        const startTime = Date.now();

        try {
            logger.debug("Deleting challenge from contest", { contestId, challengeId, ip });

            const contest = await this.contestRepository.findById(contestId);

            if (!contest) {
                logger.warn("Attempt to delete challenge from non-existent contest", {
                    contestId,
                    challengeId,
                    ip
                });

                throw new NotFoundError("Contest not found");
            }

            const challenge = await this.challengeRepository.findChallengeById(challengeId);

            if (!challenge) {
                logger.warn("Attempt to delete non-existent challenge from contest", {
                    contestId,
                    challengeId,
                    ip
                });

                throw new NotFoundError("Challenge not found");
            }

            const contestChallenges = await this.contestRepository.getAllChallengesInContest(contestId);

            const isChallengeInContest = contestChallenges.some(
                (ch) => ch.challenge_id === challengeId
            );

            if (!isChallengeInContest) {
                logger.warn("Attempt to delete challenge not present in contest", {
                    contestId,
                    challengeId,
                    ip
                });

                throw new ValidationError("Challenge not part of the contest");
            }
            
            await this.contestRepository.deleteChallengeFromContest(contestId, challengeId);

            logger.info("Challenge deleted from contest successfully", {
                contestId,
                challengeId,
                ip,
                duration: Date.now() - startTime
            });

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Failed to delete challenge from contest", {
                contestId,
                challengeId,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }

            throw new InternalServerError("Failed to delete challenge from contest");
        }   
    }
}