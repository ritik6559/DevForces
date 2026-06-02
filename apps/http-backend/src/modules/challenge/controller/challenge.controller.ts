import type { NextFunction, Response, Request } from "express";
import { inject, injectable } from "tsyringe";

import { ErrorHandler, ValidationError } from "error-handler";
import { type IChallengeService } from "../service/challenge.service";
import { type IContestService } from "../../contest/service/contest.service";

@injectable()
export class ChallengeController {

    constructor(
        @inject("IChallengeService") private challengeService: IChallengeService,
        @inject("IContestService") private contestService: IContestService
    ) {}

    /**
     * Get all challenges.
     */
    getAllChallenges = ErrorHandler.asyncHandler(async (req: Request, res: Response) => {
        const challenges = await this.challengeService.getAllChallenges(req.ip);

        res.status(200).json({
            status: "success",
            message: "Fetched all challenges",
            data: challenges
        });
    });

    /**
     * Get a challenge by id.
     */
    getChallengeById = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const challengeId = req.params.id;

        if (!challengeId) {
            return next(new ValidationError("Challenge ID not provided"));
        }

        const challenge = await this.challengeService.findById(challengeId, req.ip);

        res.status(200).json({
            status: "success",
            message: "Fetched challenge successfully",
            data: challenge
        });
    });

    /**
     * Get all challenges for a contest.
     */
    getChallengesByContestId = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const contestId = req.params.contestId;

        if (!contestId) {
            return next(new ValidationError("Contest ID not provided"));
        }

        const challenges = await this.challengeService.getChallengesByContestId(contestId, req.ip);

        res.status(200).json({
            status: "success",
            message: "Fetched challenges successfully",
            data: challenges
        });
    });

    /**
     * Create a new challenge. Body is validated by `validate(CreateChallengeSchema)`.
     */
    createChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response) => {
        const { title, difficulty, notion_doc_id, max_points, description, tech_stack } = req.body;

        const newChallenge = await this.challengeService.createChallenge(
            { title, description, difficulty, notion_doc_id, max_points, tech_stack },
            req.ip
        );

        res.status(201).json({
            status: "success",
            message: "Challenge created successfully",
            data: newChallenge
        });
    });

    /**
     * Update an existing challenge.
     */
    updateChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const challengeId = req.params.id;

        if (!challengeId) {
            return next(new ValidationError("Challenge ID not provided"));
        }

        const { title, description, difficulty, notion_doc_id, max_points } = req.body;

        if (!title && !description && !difficulty && !notion_doc_id && !max_points) {
            return next(new ValidationError("Please provide "));
        }

        const updatedChallenge = await this.challengeService.updateChallenge(
            { title, description, difficulty, notion_doc_id, max_points },
            challengeId,
            req.ip
        );

        res.status(201).json({
            status: "success",
            message: "Challenge updated successfully",
            data: updatedChallenge
        });
    });

    /**
     * Delete a challenge.
     */
    deleteChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const challengeId = req.params.id;

        if (!challengeId) {
            return next(new ValidationError("Challenge ID not provided"));
        }

        await this.challengeService.deleteChallenge(challengeId, req.ip);

        res.status(204).json({
            status: "success",
            message: "Challenge deleted successfully",
            data: null
        });
    });
}
