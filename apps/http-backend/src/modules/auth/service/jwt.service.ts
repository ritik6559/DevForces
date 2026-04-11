import { container, inject, injectable } from "tsyringe";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

import { AppError, InternalServerError, UnauthorizedError } from "../../../errors/index";
import type { TokenPair, TokenPayload, User } from "common-types";
import { JWTRepository, type IJWTRepository } from "../repository/jwt.repository";
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from "../../../utils/config";
import { logger } from "logger";

export interface IJWTService {
    generateTokenPair(user: User, ip?: string): Promise<TokenPair>;
    verifyAccessToken(token: string): TokenPayload;
    refreshAccessToken(refreshToken: string, ip?: string): Promise<TokenPair>;
    revokeRefreshToken(refreshToken: string, userId: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
}

@injectable()
export class JWTService implements IJWTService {

    private ACCESS_TOKEN_SECRET: string;
    private REFRESH_TOKEN_SECRET: string;
    private ACCESS_TOKEN_EXPIRY: string;
    private REFRESH_TOKEN_EXPIRY: string;

    constructor(
        @inject("IJWTRepository") private jwtRepository: IJWTRepository
    ) {
        this.ACCESS_TOKEN_SECRET = ACCESS_TOKEN_SECRET;
        this.REFRESH_TOKEN_SECRET = REFRESH_TOKEN_SECRET;
        this.ACCESS_TOKEN_EXPIRY = ACCESS_TOKEN_EXPIRY;
        this.REFRESH_TOKEN_EXPIRY = REFRESH_TOKEN_EXPIRY;

        this.validateConfiguration();
    }

    /**
     * Validates JWT configuration on service initialization
     */
    private validateConfiguration(): void {
        if (!this.ACCESS_TOKEN_SECRET || !this.REFRESH_TOKEN_SECRET) {
            logger.error("JWT configuration error: Missing token secrets", {
                hasAccessSecret: !!this.ACCESS_TOKEN_SECRET,
                hasRefreshSecret: !!this.REFRESH_TOKEN_SECRET
            });
            throw new Error("JWT secrets are not configured");
        }

        if (this.ACCESS_TOKEN_SECRET.length < 32 || this.REFRESH_TOKEN_SECRET.length < 32) {
            logger.warn("JWT secrets should be at least 32 characters long");
        }

        logger.info("JWT Service initialized successfully", {
            accessTokenExpiry: this.ACCESS_TOKEN_EXPIRY,
            refreshTokenExpiry: this.REFRESH_TOKEN_SECRET
        });
    }

    /**
     * Generates both access and refresh tokens for a user
     * Stores refresh token in database for validation
     * 
     * @param user - User object containing user details
     * @param ip - Optional IP address for security logging
     * @returns TokenPair containing access and refresh tokens
     */
    async generateTokenPair(user: User, ip?: string): Promise<TokenPair> {
        try {
            const payload: TokenPayload = {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            };

            const accessToken = this.generateAccessToken(payload);
            const refreshToken = this.generateRefreshToken(payload);

            const expiresAt = this.calculateTokenExpiry(this.REFRESH_TOKEN_EXPIRY);

            await this.jwtRepository.storeRefreshToken({
                user_id: user.user_id,
                token: refreshToken,
                expires_at: expiresAt,
            });

            logger.info("Token pair generated successfully", {
                userId: user.user_id,
                email: user.email,
                ip
            });

            logger.logSecurity("token_generated", {
                userId: user.user_id,
                email: user.email,
                ip,
                tokenType: "refresh"
            });

            return {
                access_token: accessToken,
                refresh_token: refreshToken
            };

        } catch (error) {
            logger.error("Failed to generate token pair", {
                userId: user.user_id,
                email: user.email,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to generate authentication tokens");
        }
    }

    /**
     * Verifies and decodes an access token
     * 
     * @param token - JWT access token to verify
     * @returns Decoded token payload
     * @throws UnauthorizedError if token is invalid or expired
     */
    verifyAccessToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
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

    /**
     * Refreshes access token using a valid refresh token
     * Validates refresh token against database
     * Generates new token pair and rotates refresh token
     * 
     * @param refreshToken - Valid refresh token
     * @param ip - Optional IP address for security logging
     * @returns New token pair
     */
    async refreshAccessToken(refreshToken: string, ip?: string): Promise<TokenPair> {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);

            const storedToken = await this.jwtRepository.findRefreshToken(
                refreshToken,
                decoded.user_id
            );

            if (!storedToken) {
                logger.logSecurity("invalid_refresh_token_attempt", {
                    userId: decoded.user_id,
                    ip,
                    reason: "Token not found in database"
                });

                throw new UnauthorizedError("Invalid or revoked refresh token");
            }

            if (new Date() > new Date(storedToken.expires_at)) {
                logger.logSecurity("expired_refresh_token_attempt", {
                    userId: decoded.user_id,
                    ip,
                    expiresAt: storedToken.expires_at
                });

                await this.jwtRepository.deleteRefreshToken(refreshToken);

                throw new UnauthorizedError("Refresh token has expired");
            }

            await this.jwtRepository.deleteRefreshToken(refreshToken);

            const user: User = {
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            } as User;

            const newTokenPair = await this.generateTokenPair(user, ip);

            logger.info("Access token refreshed successfully", {
                userId: decoded.user_id,
                ip
            });

            logger.logAuth("token_refresh", decoded.user_id, ip);

            return newTokenPair;

        } catch (error) {
            logger.error("Token refresh failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                ip
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Failed to refresh token");
        }
    }



    /**
     * Revokes a specific refresh token
     * 
     * @param refreshToken - Token to revoke
     * @param userId - User ID for validation
     */
    async revokeRefreshToken(refreshToken: string, userId: string): Promise<void> {
        try {
            await this.jwtRepository.deleteRefreshToken(refreshToken);

            logger.info("Refresh token revoked", {
                userId
            });

            logger.logSecurity("token_revoked", {
                userId,
                tokenType: "refresh"
            });

        } catch (error) {
            logger.error("Failed to revoke token", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to revoke token");
        }
    }

    /**
     * Revokes all refresh tokens for a user (e.g., on logout from all devices)
     * 
     * @param userId - User ID whose tokens should be revoked
     */
    async revokeAllUserTokens(userId: string): Promise<void> {
        try {
            const deletedCount = await this.jwtRepository.deleteAllUserTokens(userId);

            logger.info("All user tokens revoked", {
                userId,
                deletedCount
            });

            logger.logSecurity("all_tokens_revoked", {
                userId,
                deletedCount
            });

        } catch (error) {
            logger.error("Failed to revoke all user tokens", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to revoke tokens");
        }
    }

    /**
     * Calculates token expiry date based on expiry string
     */
    private calculateTokenExpiry(expiryString: string): Date {
        const now = new Date();
        const match = expiryString.match(/^(\d+)([smhd])$/);

        if (!match) {
            logger.warn("Invalid expiry format, using default 7 days", {
                providedExpiry: expiryString
            });
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        const value = parseInt(match[1]!);
        const unit = match[2];

        switch (unit) {
            case "s":
                return new Date(now.getTime() + value * 1000);
            case "m":
                return new Date(now.getTime() + value * 60 * 1000);
            case "h":
                return new Date(now.getTime() + value * 60 * 60 * 1000);
            case "d":
                return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
    }

    /**
     * Verifies a refresh token
     */
    private verifyRefreshToken(token: string): TokenPayload {
        try {
            const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
                issuer: "DevForces",
                audience: "DevForces-API"
            }) as TokenPayload;

            return {
                user_id: decoded.user_id,
                email: decoded.email,
                role: decoded.role
            };

        } catch (error) {
            logger.warn("Refresh token verification failed", {
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedError("Refresh token has expired");
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedError("Invalid refresh token");
            }

            throw new UnauthorizedError("Token verification failed");
        }
    }

    /**
     * Generates an access token with short expiry
     */
    private generateAccessToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.ACCESS_TOKEN_EXPIRY as StringValue,
            issuer: "DevForces",
            audience: "DevForces-API"
        };

        return jwt.sign(payload, this.ACCESS_TOKEN_SECRET, options);
    }

    /**
     * Generates a refresh token with longer expiry
     */
    private generateRefreshToken(payload: TokenPayload): string {
        const options: SignOptions = {
            expiresIn: this.REFRESH_TOKEN_EXPIRY as StringValue,
            issuer: "DevForces",
            audience: "DevForces-API"
        };

        return jwt.sign(payload, this.REFRESH_TOKEN_SECRET, options);
    }
}