import type { Request, Response, NextFunction } from "express";

import { container, injectable } from "tsyringe";
import { ContestService, type IContestService } from "../service/contest.service";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { CreateContestSchema, UpdateContestSchema } from "../../../types/contest.types";
import { logger } from "../../../libs/logger";
import { ValidationError, NotFoundError } from "../../../errors";

@injectable()
export class ContestController {

    private contestService: IContestService;

    constructor() {
        this.contestService = container.resolve(ContestService);
    }

    /**
     * Get all contests endpoint
     * Fetches all the contests and returns them.
     */
    getAllContests = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        try {

            const contests = await this.contestService.getAllContests();

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
                message: "Fetched all contests",
                data: contests
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
     * Get contest by id endpoint
     * Fetches and returns a contest by id
     */
    getContestById = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const { contestId } = req.params;

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

            return next(new ValidationError("Contest id not provided"));
        }

        try {

            const contest = await this.contestService.findById(contestId);

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
                message: "Fetched contest successfully",
                data: contest
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
     * Update contest enpoint
     * Updates a contest and returns the updated contest
     */
    updateContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const { contestId } = req.params;

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

            return next(new ValidationError("Contest id not provided"));
        }

        try {

            const { title, description, start_time } = req.body;

            if (!title && !description && !start_time) {
                const responseTime = Date.now() - startTime;

                logger.logRequest(
                    req.method,
                    req.originalUrl || req.url,
                    400,
                    responseTime,
                    userAgent,
                    ip
                );

                return next(new ValidationError("At least one field must be provided for updation"));
            }

            const updatedContest = await this.contestService.updateContest({ title, description, start_time }, contestId);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                201,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "Contest updated successfully",
                data: updatedContest
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
     * Create contest endpint
     * Create a new contest, then return the new contest
     */
    createContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const isValidBody = CreateContestSchema.safeParse(req.body);

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

            return next(new ValidationError("Invalid request body", isValidBody.error.format()));
        }

        try {

            const { title, description, start_time } = isValidBody.data;

            const newContest = await this.contestService.createContest({ title, description, start_time }, ip);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                201,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "Contest created successfully",
                data: newContest
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof ValidationError ? 400 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Add challenge to contest endpoint
     */
    addChallengeToContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const { contestId, challengeId } = req.params;

        if (!contestId || !challengeId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Contest id or Challenge id not provided"));
        }

        try{

            await this.contestService.addChallengeToContest(contestId, challengeId, ip);

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
                message: "Challenge added to contest successfully",
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

    /**
     * Delete challenge from contest endpoint
     */
    deleteChallengeFromContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const { contestId, challengeId } = req.params;

        if (!contestId || !challengeId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Contest id or Challenge id not provided"));
        }

        try{

            await this.contestService.deleteChallengeFromContest(contestId, challengeId, ip);

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
                message: "Challenge deleted from contest successfully",
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

    /**
     * Delete contest endpoint
     */
    deleteContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const { contestId } = req.params;

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

            return next(new ValidationError("Contest id not provided"));
        }

        try{

            await this.contestService.deleteContest(contestId);

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
                message: "Contest deleted successfully",
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