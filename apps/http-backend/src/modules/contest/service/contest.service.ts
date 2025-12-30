import { container, injectable } from "tsyringe";
import type { Contest, CreateContest, UpdateContest } from "../../../types";
import { ContestRepository, type IContestRepository } from "../repository/contest.repository";
import { logger } from "../../../libs/logger";
import { NotFoundError, ValidationError, InternalServerError } from "../../../errors";

export interface IContestService {
    getAllContests(ip?: string): Promise<Contest[]>;
    findById(contestId: string, ip?: string): Promise<Contest | null>;
    existsById(contestId: string, ip?: string): Promise<boolean>;
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
    private readonly contestRepository: IContestRepository;

    constructor() {
        this.contestRepository = container.resolve(ContestRepository);
    }

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
}