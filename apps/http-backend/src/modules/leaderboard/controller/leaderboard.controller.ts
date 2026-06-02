import { inject, injectable } from "tsyringe";
import type { Request, Response, NextFunction } from "express";

import { type ILeaderBoardService } from "../service/leaderboard.service";
import { ErrorHandler, ValidationError } from "error-handler";

const DEFAULT_TOP_PLAYERS = 10;
const MAX_TOP_PLAYERS = 100;
const LEADERBOARD_CACHE_CONTROL = "private, no-cache, must-revalidate, max-age=5";

@injectable()
export class LeaderBoardController {

    constructor(@inject("ILeaderBoardService") private leaderboardService: ILeaderBoardService) { }

    getTopPlayers = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("ContestId not provided"));
        }

        const count = Math.min(
            parseInt(req.query.count as string) || DEFAULT_TOP_PLAYERS,
            MAX_TOP_PLAYERS
        );

        const players = await this.leaderboardService.getTopPlayers(contestId, count);

        res.set("Cache-Control", LEADERBOARD_CACHE_CONTROL);

        res.status(200).json({
            success: true,
            message: "Top Players fetched successfully",
            data: players
        });
    });

    getUserStanding = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId!;
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("ContestId not provided"));
        }

        const userStanding = await this.leaderboardService.getUserStanding(contestId, userId);

        res.set("Cache-Control", LEADERBOARD_CACHE_CONTROL);

        res.status(200).json({
            success: true,
            message: "User standing fetched successfully",
            data: userStanding
        });
    });
}
