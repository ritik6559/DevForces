import type { NextFunction, Response, Request } from "express";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { container, injectable } from "tsyringe";
import { logger } from "../../../libs/logger";
import { ChallengeService, type IChallengeService } from "../service/challenge.service";
import { NotFoundError, ValidationError } from "../../../errors";
import { CreateChallengeSchema } from "common-types";

@injectable()
export class ChallengeController {

    private challengeService: IChallengeService;

    constructor() {
        this.challengeService = container.resolve(ChallengeService)
    }

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

            const challenge = await this.challengeService.findChallengeById(challengeId, ip);

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

            return next(new ValidationError("Invalid request body " + isValidBody.error.format()));
        }

        try {

            const { title, difficulty, notion_doc_id, max_points, s3_prefix, description } = isValidBody.data;

            const newChallenge = await this.challengeService.createChallenge({ title, description, difficulty, notion_doc_id, max_points, s3_prefix }, ip);

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

                return next(new ValidationError("At least one field must be provided"));
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