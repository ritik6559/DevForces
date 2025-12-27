import type { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { JWTService } from "../modules/auth/service/jwt.service";
import { UnauthorizedError } from "../errors/index";
import { logger } from "../libs/logger";

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

export class AuthMiddleware {

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

            const jwtService = container.resolve(JWTService);
            const decoded = jwtService.verifyAccessToken(token);

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
                const jwtService = container.resolve(JWTService);
                const decoded = jwtService.verifyAccessToken(token);

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
}