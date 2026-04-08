import type { RefreshToken, StoreRefreshToken } from "common-types";
import { prismaClient } from "store/client";
import { logger } from "../../../libs/logger";
import { InternalServerError } from "../../../errors";

export interface IJWTRepository {
    storeRefreshToken(data: StoreRefreshToken): Promise<RefreshToken>;
    findRefreshToken(token: string, user_id: string): Promise<RefreshToken | null>;
    deleteRefreshToken(token: string): Promise<void>;
    deleteExpiredRefreshToken(): Promise<void>;
    deleteAllUserTokens(userId: string): Promise<number>;
}

/**
 * TokenRepository handles database operations for refresh tokens
 * Implements secure token storage and retrieval
 */
export class JWTRepository implements IJWTRepository {
    
    /**
     * Stores a refresh token in the database
     * 
     * @param data - Token data to store
     * @returns Stored refresh token
     */
    async storeRefreshToken(data: StoreRefreshToken): Promise<RefreshToken> {
        try {
            const refreshToken = await prismaClient.refreshToken.create({
                data: {
                    user_id: data.user_id,
                    token: data.token,
                    expires_at: data.expires_at,
                }
            });

            logger.debug("Refresh token stored in database", {
                userId: data.user_id,
                tokenId: refreshToken.id,
                expiresAt: data.expires_at
            });

            return refreshToken;

        } catch (error) {
            logger.error("Failed to store refresh token", {
                userId: data.user_id,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to store authentication token");
        }
    }

    /**
     * Finds a refresh token by token string and user ID
     * 
     * @param token - Refresh token string
     * @param userId - User ID for validation
     * @returns Refresh token if found, null otherwise
     */
    async findRefreshToken(token: string, userId: string): Promise<RefreshToken | null> {
        try {
            const refreshToken = await prismaClient.refreshToken.findFirst({
                where: {
                    token,
                    user_id: userId
                }
            });

            if (refreshToken) {
                logger.debug("Refresh token found in database", {
                    userId,
                    tokenId: refreshToken.id
                });
            } else {
                logger.debug("Refresh token not found in database", {
                    userId
                });
            }

            return refreshToken;

        } catch (error) {
            logger.error("Failed to find refresh token", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to validate authentication token");
        }
    }

    /**
     * Deletes a specific refresh token
     * 
     * @param token - Token to delete
     */
    async deleteRefreshToken(token: string): Promise<void> {
        try {
            await prismaClient.refreshToken.deleteMany({
                where: { token }
            });

            logger.debug("Refresh token deleted from database", {
                token: token.substring(0, 20) + "..."
            });

        } catch (error) {
            logger.error("Failed to delete refresh token", {
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to revoke authentication token");
        }
    }

    /**
     * Deletes all expired Refresh Token
     * 
     */
    async deleteExpiredRefreshToken(): Promise<void> {
        await prismaClient.refreshToken.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        })
    }

    /**
     * Deletes all refresh tokens for a specific user
     * 
     * @param userId - User ID whose tokens should be deleted
     * @returns Number of deleted tokens
     */
    async deleteAllUserTokens(userId: string): Promise<number> {
        try {
            const result = await prismaClient.refreshToken.deleteMany({
                where: { 
                    user_id: userId 
                }
            });

            logger.debug("All user tokens deleted from database", {
                userId,
                deletedCount: result.count
            });

            return result.count;

        } catch (error) {
            logger.error("Failed to delete all user tokens", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError("Failed to revoke user tokens");
        }
    }
}