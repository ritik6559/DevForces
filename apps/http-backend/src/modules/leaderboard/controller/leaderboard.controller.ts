import { inject, injectable } from "tsyringe";
import type { Request, Response, NextFunction } from "express";

import { ILeaderBoardService } from "../service/leaderboard.service";
import { ErrorHandler, NotFoundError, ValidationError } from "error-handler";
import { logger } from "logger";

@injectable()
export class LeaderBoardController {

    constructor(@inject("ILeaderBoardService") private leaderboardService: ILeaderBoardService) { }

    getTopPlayers = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

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

            return next(new ValidationError("ContestId not provided"));
        }

        try {
            const count = Math.min(parseInt(req.query.count as string) || 10, 100);

            const players = await this.leaderboardService.getTopPlayers(contestId, count);

            res.set("Cache-Control", "private, no-cache, must-revalidate, max-age=5");

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
                success: true,
                message: "Top Players fetched successfully",
                data: players
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

    getUserStanding = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get("user-agent");
        const userId = req.user?.userId!;

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

            return next(new ValidationError("ContestId not provided"));
        }

        try {

            const userStanding = await this.leaderboardService.getUserStanding(contestId, userId);

            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.set("Cache-Control", "private, no-cache, must-revalidate, max-age=5");

            res.status(200).json({
                sucess: true,
                message: "User standing fetched successfully",
                data: userStanding
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