import type { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import { type IContestService } from "../service/contest.service";
import { ErrorHandler, ValidationError } from "error-handler";
import { copyS3Folder } from "s3";
import { type IChallengeService } from "../../challenge/service/challenge.service";

@injectable()
export class ContestController {

    constructor(
        @inject("IContestService") private contestService: IContestService,
        @inject("IChallengeService") private challengeService: IChallengeService
    ) {}

    /**
     * Get all contests.
     */
    getAllContests = ErrorHandler.asyncHandler(async (_req: Request, res: Response) => {
        const contests = await this.contestService.getAllContests();

        res.status(200).json({
            status: "success",
            message: "Fetched all contests",
            data: contests
        });
    });

    /**
     * Get contest by id.
     */
    getContestById = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("Contest id not provided"));
        }

        const contest = await this.contestService.findById(contestId);

        res.status(200).json({
            status: "success",
            message: "Fetched contest successfully",
            data: contest
        });
    });

    /**
     * Update a contest.
     */
    updateContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("Contest id not provided"));
        }

        const { title, description, start_time } = req.body;

        if (!title && !description && !start_time) {
            return next(new ValidationError("At least one field must be provided for updation"));
        }

        const updatedContest = await this.contestService.updateContest(
            { title, description, start_time },
            contestId
        );

        res.status(200).json({
            status: "success",
            message: "Contest updated successfully",
            data: updatedContest
        });
    });

    /**
     * Create a new contest. Body is validated by `validate(CreateContestSchema)`.
     */
    createContest = ErrorHandler.asyncHandler(async (req: Request, res: Response) => {
        const { title, description, start_time, end_time, challenges } = req.body;

        const newContest = await this.contestService.createContest(
            { title, description, start_time, end_time },
            req.ip
        );

        if (challenges && challenges.length > 0) {
            await Promise.all(
                challenges.map((challenge: { challenge_id: string }) =>
                    this.contestService.addChallengeToContest(newContest.contest_id, challenge.challenge_id, req.ip)
                )
            );
        }

        res.status(200).json({
            status: "success",
            message: "Contest created successfully",
            data: newContest
        });
    });

    /**
     * Join a contest: initializes the user's workspace files in S3 for every
     * challenge of the contest by copying the per-tech-stack base code.
     */
    joinContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("Contest id or Challenge id not provided"));
        }

        // Throws NotFoundError if the contest does not exist.
        const contest = await this.contestService.findById(contestId);

        const challenges = await this.contestService.getAllChallengesForContest(contestId);

        await Promise.all(
            challenges.map((challenge) =>
                copyS3Folder(
                    `base/${contestId}/challenges/${challenge.challenge_id}`,
                    `contests/${contestId}/challenges/${challenge.challenge_id}/users/${userId}`
                )
            )
        );

        res.status(200).json({
            status: "success",
            message: "Challenge added to contest successfully",
            data: contest
        });
    });

    /**
     * Remove a challenge from a contest.
     */
    deleteChallengeFromContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId, challengeId } = req.params;

        if (!contestId || !challengeId) {
            return next(new ValidationError("Contest id or Challenge id not provided"));
        }

        await this.contestService.deleteChallengeFromContest(contestId, challengeId, req.ip);

        res.status(204).json({
            status: "success",
            message: "Challenge deleted from contest successfully",
            data: null
        });
    });

    /**
     * Delete a contest.
     */
    deleteContest = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { contestId } = req.params;

        if (!contestId) {
            return next(new ValidationError("Contest id not provided"));
        }

        await this.contestService.deleteContest(contestId);

        res.status(204).json({
            status: "success",
            message: "Contest deleted successfully",
            data: null
        });
    });
}
