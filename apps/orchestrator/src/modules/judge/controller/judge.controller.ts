import type { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import { ErrorHandler, ValidationError } from "error-handler";
import type { IJudgeService } from "../service/judge.service";

/**
 * HTTP boundary for the internal judge endpoint.
 *
 * Called server-to-server by http-backend (guarded by `internalKeyGuard`), not
 * by the browser. Returns the raw Jest stdout for the caller to score.
 */
@injectable()
export class JudgeController {

    constructor(@inject("IJudgeService") private judgeService: IJudgeService) {}

    judge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId, challengeId, userId, testsCode } = req.body;

        if (!contestId || !challengeId || !userId || typeof testsCode !== "string") {
            return next(new ValidationError("contestId, challengeId, userId and testsCode are required"));
        }

        const result = await this.judgeService.judge({ contestId, challengeId, userId, testsCode });

        res.status(200).json({
            status: "success",
            data: result,
        });
    });
}
