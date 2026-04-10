import type { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "error-handler";
import { inject, injectable } from "tsyringe";
import type { IKubeService } from "../service/kube.service";

@injectable()
export class KubeController {

    constructor(@inject("IKubeService") private kubeService: IKubeService) { }

    start = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

        const { userId, workDir } = req.body;

        if( !userId || !workDir ) {
            res.status(400).json({ message: "Missing required fields: userId and workDir" });
            return;
        }

        try {
            await this.kubeService.create(workDir);
            res.status(200).json({ message: "Kubernetes resources started successfully" });
        } catch (err) {
            next(err);
        }
    });

}