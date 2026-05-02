import type { NextFunction, Response, Request } from "express";
import { ErrorHandler, NotFoundError, ValidationError } from "error-handler";
import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import { type IChallengeService } from "../service/challenge.service";
import { CreateChallengeSchema } from "common-types";
import { type IContestService } from "../../contest/service/contest.service";

@injectable()
export class ChallengeController {

    constructor(
        @inject("IChallengeService") private challengeService: IChallengeService,
        @inject("IContestService") private contestService: IContestService
    ) {}

    /**
     * Get all challenges enpoint
     * Fetches and return all the challenges
     */
    getAllChallenges = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        try {

            const challeneges = await this.challengeService.getAllChallenges(ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "Fetched all challenges",
                data: challeneges
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Get Challenge by ID endpoint
     * Fetches and returns a challenge
     */
    getChallengeById = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const challengeId = req.params.id;

        if (!challengeId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Challenge ID not provided"));
        }

        try {

            const challenge = await this.challengeService.findById(challengeId, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "Fetched challenge successfully",
                data: challenge
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof NotFoundError ? 404 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Get Challenges by Contest ID endpoint
     * Fetches and returns all challenges of a contest
     */
    getChallengesByContestId = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const contestId = req.params.contestId;

        if (!contestId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Contest ID not provided"));
        }

        try {

            const challenges = await this.challengeService.getChallengesByContestId(contestId, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "Fetched challenges successfully",
                data: challenges
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof NotFoundError ? 404 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Create new challenge endpoint
     * Creates and returns a new challenge
     */
    createChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const isValidBody = CreateChallengeSchema.safeParse(req.body);

        if (!isValidBody.success) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Invalid request body " + isValidBody.error.message));
        }

        try {

            const { title, difficulty, notion_doc_id, max_points, description, tech_stack } = isValidBody.data;

            const newChallenge = await this.challengeService.createChallenge({ title, description, difficulty, notion_doc_id, max_points, tech_stack }, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                201,
                responseTime,
                userAgent,
                ip
            );

            res.status(201).json({
                status: "success",
                message: "Challenge created successfully",
                data: newChallenge
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Update challenge endpoint
     * Updates and returns the updated challenge
     */
    updateChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const challengeId = req.params.id;

        if (!challengeId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Challenge ID not provided"));
        }

        try {

            const { title, description, difficulty, notion_doc_id, max_points } = req.body;

            if (!title && !description && !difficulty && !notion_doc_id && !max_points) {
                const responseTime = Date.now() - startTime;

                logger.logRequest(
                    req.method,
                    req.originalUrl || req.url,
                    400,
                    responseTime,
                    userAgent,
                    ip
                );

                return next(new ValidationError("Please provide "));
            }

            const updatedChallenge = await this.challengeService.updateChallenge({ title, description, difficulty, notion_doc_id, max_points }, challengeId, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                201,
                responseTime,
                userAgent,
                ip
            );

            res.status(201).json({
                status: "success",
                message: "Challenge updated successfully",
                data: updatedChallenge
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof NotFoundError ? 404 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Delete challenge endpoint
     */
    deleteChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const challengeId = req.params.id;

        if (!challengeId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Challenge ID not provided"));
        }

        try {

            await this.challengeService.deleteChallenge(challengeId, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                204,
                responseTime,
                userAgent,
                ip
            );

            res.status(204).json({
                status: "success",
                message: "Challenge deleted successfully",
                data: null
            });
        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof NotFoundError ? 404 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });
}