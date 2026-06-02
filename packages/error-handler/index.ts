import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';
import { logger } from 'logger';
import { AppError, BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, ServiceUnavailableError, UnauthorizedError, ValidationError } from './errors';

export class ErrorHandler {
    /**
     * Centralized Express error handler. Must keep four parameters so Express
     * recognizes it as an error-handling middleware.
     */
    static handle(err: Error, req: Request, res: Response, _next: NextFunction): void {

        if (err instanceof AppError) {
            logger.warn("Handled application error", {
                statusCode: err.statusCode,
                message: err.message,
                method: req.method,
                url: req.originalUrl || req.url,
            });

            res.status(err.statusCode).json({
                status: 'error',
                message: err.message,
                data: null,
                // Surface structured details (e.g. Zod validation issues) only
                // when present — additive, never removes existing fields.
                ...(err.details !== undefined ? { details: err.details } : {}),
            });

            return;
        }

        logger.error("Unhandled error", {
            message: err.message,
            stack: err.stack,
            method: req.method,
            url: req.originalUrl || req.url,
        });

        res.status(500).json({
            status: "error",
            message: "Something went wrong, please try again later.",
            data: null,
        });
    }

    /**
     * Wraps an async route handler so rejected promises are forwarded to the
     * centralized error handler. Removes the need for per-handler try/catch.
     */
    static asyncHandler(
        fn: (req: Request, res: Response, next: NextFunction) => unknown
    ) {
        return (req: Request, res: Response, next: NextFunction): void => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

/**
 * Logs one structured line per HTTP request once the response is finished,
 * capturing the final status code and latency. Replaces the per-handler
 * `logger.logRequest(...)` boilerplate that was duplicated across controllers.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on("finish", () => {
        logger.logRequest(
            req.method,
            req.originalUrl || req.url,
            res.statusCode,
            Date.now() - start,
            req.get("user-agent"),
            req.ip,
        );
    });

    next();
}

type ValidationSource = "body" | "query" | "params";

/**
 * Returns middleware that validates a request segment against a Zod schema.
 * On success the parsed (normalized) value replaces `req.body`; on failure a
 * ValidationError carrying the formatted issues is forwarded to the handler.
 *
 * Note: only `body` is reassigned — `req.query`/`req.params` are getters in
 * Express 5 and must not be mutated.
 */
export const validate =
    (schema: ZodTypeAny, source: ValidationSource = "body") =>
    (req: Request, _res: Response, next: NextFunction): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            return next(new ValidationError("Invalid request body", result.error.format()));
        }

        if (source === "body") {
            req.body = result.data;
        }

        next();
    };

export {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    BadRequestError,
    InternalServerError,
    ServiceUnavailableError
}
