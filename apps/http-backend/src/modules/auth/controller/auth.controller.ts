import { container, injectable } from "tsyringe";
import type { NextFunction, Request, Response } from "express";

import { AuthService, type IAuthService } from "../service/auth.service";
import { JWTService, type IJWTService } from "../service/jwt.service";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { ValidationError, UnauthorizedError } from "../../../errors";
import { logger } from "../../../libs/logger";
import { CreateUserSchemaWithOtp } from "common-types";
import { SendOtpSchema } from "common-types";

@injectable()
export class AuthController {
    
    private readonly authService: IAuthService;
    private readonly jwtService: IJWTService;
    
    constructor() {
        this.authService = container.resolve(AuthService);
        this.jwtService = container.resolve(JWTService);
    }

    /**
     * Send OTP endpoint
     * Sends OTP to user's email for verification
     */
    sendOtp = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

        console.log("Heloooooooo")
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const isValidBody = SendOtpSchema.safeParse(req.body);

        if (!isValidBody.success) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Invalid request body", isValidBody.error.format()));
        }

        try {

            const { email, username } = isValidBody.data;

            await this.authService.sendOtp(username, email, ip);
            
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                message: "OTP sent successfully to your email",
                data: {
                    email: email.trim().toLowerCase(),
                    expiresIn: "5 minutes"
                }
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof ValidationError ? 400 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Login/Register endpoint with OTP verification
     * Verifies OTP and creates user if doesn't exist, then returns tokens
     */
    login = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const isValidBody = CreateUserSchemaWithOtp.safeParse(req.body);
        
        if (!isValidBody.success) {
            console.log(isValidBody.error)
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            
            return next(new ValidationError("Invalid request body", isValidBody.error.format()));
        }

        const { email, username, otp } = isValidBody.data;

        if (!otp) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("OTP is required"));
        }

        try {
            const user = await this.authService.loginUser({ email, username, otp }, ip);

            const { access_token, refresh_token } = await this.jwtService.generateTokenPair(user, ip);
            
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.cookie("access_token", access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refresh_token", refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                status: "success",
                message: "Login successful",
                data: {
                    user: {
                        id: user.user_id,
                        email: user.email,
                        username: user.username,
                        role: user.role
                    },
                    access_token,
                    refresh_token
                }
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof ValidationError ? 400 : 
                error instanceof UnauthorizedError ? 401 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Refresh token endpoint
     * Issues new access and refresh tokens using valid refresh token
     */
    refreshToken = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const refresh_token = req.cookies?.refresh_token || req.body.refresh_token;

        if (!refresh_token) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Refresh token is required"));
        }

        try {
            const { access_token, refresh_token: new_refresh_token } = await this.jwtService.refreshAccessToken(
                refresh_token,
                ip
            );
            
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.cookie("access_token", access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000
            });

            res.cookie("refresh_token", new_refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(200).json({
                status: "success",
                message: "Token refreshed successfully",
                data: {
                    access_token,
                    refresh_token: new_refresh_token
                }
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                error instanceof UnauthorizedError ? 401 : 500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Logout endpoint
     * Revokes the provided refresh token
     */
    logout = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const refresh_token = req.cookies?.refresh_token || req.body.refresh_token;
        const userId = req.user?.userId;

        if (!refresh_token) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                400,
                responseTime,
                userAgent,
                ip
            );

            return next(new ValidationError("Refresh token is required"));
        }

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        try {
            await this.jwtService.revokeRefreshToken(refresh_token, userId);
            
            const responseTime = Date.now() - startTime;

            logger.logAuth("logout", userId, ip);

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");

            res.status(200).json({
                status: "success",
                message: "Logged out successfully"
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Logout from all devices endpoint
     * Revokes all refresh tokens for the authenticated user
     */
    logoutAll = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const userId = req.user?.userId;

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        try {
            await this.jwtService.revokeAllUserTokens(userId);
            
            const responseTime = Date.now() - startTime;

            logger.logAuth("logout", userId, ip);

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.clearCookie("access_token");
            res.clearCookie("refresh_token");

            res.status(200).json({
                status: "success",
                message: "Logged out from all devices successfully"
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });

    /**
     * Get current user endpoint
     * Returns authenticated user info
     */
    getCurrentUser = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        if (!req.user) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        try {
            const responseTime = Date.now() - startTime;

            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                200,
                responseTime,
                userAgent,
                ip
            );

            res.status(200).json({
                status: "success",
                data: {
                    user: req.user
                }
            });

        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            logger.logRequest(
                req.method,
                req.originalUrl || req.url,
                500,
                responseTime,
                userAgent,
                ip
            );

            next(error);
        }
    });
}