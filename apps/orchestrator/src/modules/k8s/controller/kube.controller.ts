import type { Request, Response, NextFunction } from "express";
import { inject, injectable } from "tsyringe";

import { ErrorHandler, ValidationError, UnauthorizedError } from "error-handler";
import type { IKubeService } from "../service/kube.service";

@injectable()
export class KubeController {

    constructor(@inject("IKubeService") private kubeService: IKubeService) { }

    /**
     * Start Kubernetes resources for a workspace.
     *
     * The userId is taken from the authenticated token, NOT the request body —
     * this prevents a user from provisioning workspaces on behalf of arbitrary
     * users (IDOR / resource-exhaustion).
     */
    start = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;
        const { contestId, challengeId } = req.body;

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        if (!contestId || !challengeId) {
            return next(new ValidationError("Missing required fields: contestId and challengeId"));
        }

        await this.kubeService.create({ contestId, challengeId, userId });

        res.status(201).json({
            status: "success",
            message: "Kubernetes resources started successfully",
            data: {
                contestId,
                challengeId,
                userId
            }
        });
    });
}
