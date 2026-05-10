import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

import { UnauthorizedError } from "error-handler";
import { logger } from "logger";
import type { TokenPayload } from "common-types";
import { ACCESS_TOKEN_SECRET } from "../utils/config";

config();

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                role: string;
            };
        }
    }
}

export class AuthUtils {
    private ACCESS_TOKEN_SECRET: string;

    constructor() {
        this.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
    }

    /**
     * Middleware to verify JWT access token
     * Supports both cookie-based and Authorization header authentication
     */
    static authenticateToken = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let token = req.cookies?.access_token;

            if (!token) {
                const authHeader = req.headers.authorization;

                if (!authHeader) {
                    logger.warn("Authentication attempt without token", {
                        ip: req.ip,
                        url: req.originalUrl,
                        method: req.method
                    });

                    throw new UnauthorizedError("Access token is required");
                }

                if (!authHeader.startsWith("Bearer ")) {
                    logger.warn("Invalid token format", {
                        ip: req.ip,
                        url: req.originalUrl
                    });

                    throw new UnauthorizedError("Invalid token format");
                }

                token = authHeader.substring(7);
            }

            if (!token) {
                throw new UnauthorizedError("Access token is required");
            }

            const decoded = this.verifyAccessToken(token);

            req.user = {
                userId: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            };

            logger.debug("User authenticated successfully", {
                userId: decoded.user_id,
                email: decoded.email,
                url: req.originalUrl
            });

            next();

        } catch (error) {
            console.log(error);
            logger.error("Authentication failed", {
                ip: req.ip,
                url: req.originalUrl,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            logger.logSecurity("authentication_failed", {
                ip: req.ip,
                url: req.originalUrl,
                method: req.method,
                reason: error instanceof Error ? error.message : "Unknown error"
            });

            next(error);
        }
    };

    /**
     * Middleware to check if user has required role
     * Must be used after authenticateToken middleware
     */
    static authorizeRole = (...allowedRoles: string[]) => {
        return (req: Request, res: Response, next: NextFunction): void => {
            try {
                if (!req.user) {
                    throw new UnauthorizedError("User not authenticated");
                }

                if (!allowedRoles.includes(req.user.role)) {
                    logger.warn("Authorization failed - insufficient permissions", {
                        userId: req.user.userId,
                        userRole: req.user.role,
                        requiredRoles: allowedRoles,
                        url: req.originalUrl
                    });

                    logger.logSecurity("authorization_failed", {
                        userId: req.user.userId,
                        userRole: req.user.role,
                        requiredRoles: allowedRoles,
                        url: req.originalUrl,
                        ip: req.ip
                    });

                    throw new UnauthorizedError(
                        "You do not have permission to access this resource"
                    );
                }

                logger.debug("User authorized successfully", {
                    userId: req.user.userId,
                    role: req.user.role,
                    url: req.originalUrl
                });

                next();

            } catch (error) {
                console.log(error)
                next(error);
            }
        };
    };

    /**
     * Optional authentication middleware
     * Attaches user info if token is valid, but doesn't fail if no token
     */
    static optionalAuth = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            let token = req.cookies?.access_token;

            if (!token) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            if (token) {
                const decoded = this.verifyAccessToken(token);

                req.user = {
                    userId: decoded.user_id,
                    email: decoded.email,
                    role: decoded.role
                };
            }

            next();

        } catch (error) {
            logger.debug("Optional auth failed, continuing without user", {
                url: req.originalUrl
            });
            next();
        }
    };

    static verifyAccessToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
                issuer: "DevForces",
                audience: "DevForces-API"
            }) as TokenPayload;

            return {
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            };

        } catch (error) {
            logger.warn("Access token verification failed", {
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError("Access token has expired");
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError("Invalid access token");
            }

            throw new UnauthorizedError("Token verification failed");
        }
    }
}