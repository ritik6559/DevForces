import type { RefreshToken, StoreRefreshToken } from "common-types";
import { prismaClient } from "store/client";
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

    async storeRefreshToken(data: StoreRefreshToken): Promise<RefreshToken> {
        try {
            const refreshToken = await prismaClient.refreshToken.create({
                data: {
                    user_id: data.user_id,
                    token: data.token,
                    expires_at: data.expires_at,
                }
            });

            return refreshToken;

        } catch (error) {

            throw new InternalServerError("Failed to store authentication token");
        }
    }

    async findRefreshToken(token: string, userId: string): Promise<RefreshToken | null> {
        try {
            const refreshToken = await prismaClient.refreshToken.findFirst({
                where: {
                    token,
                    user_id: userId
                }
            });

            return refreshToken;

        } catch (error) {
            throw new InternalServerError("Failed to validate authentication token");
        }
    }


    async deleteRefreshToken(token: string): Promise<void> {
        try {
            await prismaClient.refreshToken.deleteMany({
                where: { token }
            });
        } catch (error) {
            throw new InternalServerError("Failed to revoke authentication token");
        }
    }


    async deleteExpiredRefreshToken(): Promise<void> {
        await prismaClient.refreshToken.deleteMany({
            where: {
                expires_at: {
                    lt: new Date()
                }
            }
        });
    }

    async deleteAllUserTokens(userId: string): Promise<number> {
        try {
            const result = await prismaClient.refreshToken.deleteMany({
                where: {
                    user_id: userId
                }
            });

            return result.count;

        } catch (error) {
            throw new InternalServerError("Failed to revoke user tokens");
        }
    }
}