import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "error-handler";
import { INTERNAL_API_KEY } from "../utils/config";

/**
 * Guards service-to-service endpoints (e.g. the judge) with a shared secret.
 */
export function internalKeyGuard(req: Request, _res: Response, next: NextFunction): void {
    const provided = req.header("x-internal-key");

    if (provided !== INTERNAL_API_KEY) {
        return next(new UnauthorizedError("Invalid internal key"));
    }

    next();
}
