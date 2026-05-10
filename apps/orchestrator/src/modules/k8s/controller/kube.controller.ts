import type { Request, Response, NextFunction } from "express";

import { ErrorHandler, NotFoundError, ValidationError } from "error-handler";
import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import type { IKubeService } from "../service/kube.service";

@injectable()
export class KubeController {

    constructor(@inject("IKubeService") private kubeService: IKubeService) { }

    /**
     * Start Kubernetes resources endpoint.
     */
    start = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get("user-agent");

        const { contestId, challengeId, userId } = req.body;

        if (!contestId || !challengeId || !userId) {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Missing required fields: userId and workDir"));
        }

        try {
            await this.kubeService.create({
                contestId,
                challengeId,
                userId
            });

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
                message: "Kubernetes resources started successfully",
                data: {
                    contestId,
                    challengeId,
                    userId
                }
            });

        } catch (error) {
            console.log(error)
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