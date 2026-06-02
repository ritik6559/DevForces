import type { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import { ErrorHandler, ValidationError, UnauthorizedError } from "error-handler";
import { type ISubmissionService } from "../service/submission.service";

/**
 * HTTP boundary for POST /api/submit. Maps the service's discriminated outcome
 * to the documented status codes / response bodies.
 */
@injectable()
export class SubmissionController {

    constructor(@inject("ISubmissionService") private submissionService: ISubmissionService) {}

    submit = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;
        const { contestId, challengeId } = req.body;

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        if (!contestId || !challengeId) {
            return next(new ValidationError("contestId and challengeId are required"));
        }

        const outcome = await this.submissionService.submit(userId, contestId, challengeId);

        switch (outcome.kind) {
            case "ok":
                return res.status(200).json(outcome.body);

            case "contest_not_active":
                return res.status(400).json({
                    error: "contest_not_active",
                    message: "This contest is not currently active.",
                });

            case "mapping_not_found":
                return res.status(404).json({
                    error: "challenge_not_in_contest",
                    message: "This challenge is not part of the contest.",
                });

            case "submission_in_progress":
                return res.status(409).json({
                    error: "submission_in_progress",
                    message: "A submission is already running for this challenge.",
                });

            case "workspace_expired":
                return res.status(404).json({
                    error: "workspace_expired",
                    message: "Your workspace is not running. Please reload.",
                });
        }
    });
}
