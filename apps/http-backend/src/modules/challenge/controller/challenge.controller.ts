import type { NextFunction, Response, Request } from "express";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { injectable } from "tsyringe";

@injectable()
export class ChallengeController {

    getAllChallenges = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
    
    getChallengeById = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
    
    createChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
    
    updateChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});

    deleteChallenge = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {});
}