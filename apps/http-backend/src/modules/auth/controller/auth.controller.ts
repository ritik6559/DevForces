import { inject, injectable } from "tsyringe";
import type { Request, Response, NextFunction } from "express";

import { type IAuthService } from "../service/auth.service";
import { type IJWTService } from "../service/jwt.service";
import { ErrorHandler, ValidationError, UnauthorizedError } from "error-handler";
import { logger } from "logger";

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

@injectable()
export class AuthController {

    constructor(
        @inject("IAuthService")
        private authService: IAuthService,

        @inject("IJWTService")
        private jwtService: IJWTService
    ) {}

    private cookieOptions(maxAge: number) {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict" as const,
            maxAge,
        };
    }

    /**
     * Send OTP endpoint. Request body is validated by `validate(SendOtpSchema)`.
     */
    sendOtp = ErrorHandler.asyncHandler(async (req: Request, res: Response) => {
        const { email, username } = req.body;

        await this.authService.sendOtp(username, email, req.ip);

        res.status(200).json({
            status: "success",
            message: "OTP sent successfully to your email",
            data: {
                email: email.trim().toLowerCase(),
                expiresIn: "5 minutes"
            }
        });
    });

    /**
     * Login/Register endpoint with OTP verification.
     * Body is validated by `validate(CreateUserSchemaWithOtp)`.
     */
    login = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { email, username, otp } = req.body;

        if (!otp) {
            return next(new ValidationError("OTP is required"));
        }

        const user = await this.authService.loginUser({ email, username, otp }, req.ip);

        const { access_token, refresh_token } = await this.jwtService.generateTokenPair(user, req.ip);

        res.cookie("access_token", access_token, this.cookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie("refresh_token", refresh_token, this.cookieOptions(REFRESH_COOKIE_MAX_AGE));

        res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                user: {
                    id: user.user_id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                }
            }
        });
    });

    /**
     * Refresh token endpoint.
     */
    refreshToken = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const refresh_token = req.cookies?.refresh_token || req.body.refresh_token;

        if (!refresh_token) {
            return next(new ValidationError("Refresh token is required"));
        }

        const { access_token, refresh_token: new_refresh_token } =
            await this.jwtService.refreshAccessToken(refresh_token, req.ip);

        res.cookie("access_token", access_token, this.cookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie("refresh_token", new_refresh_token, this.cookieOptions(REFRESH_COOKIE_MAX_AGE));

        res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            data: null
        });
    });

    /**
     * Logout endpoint. Revokes the provided refresh token.
     */
    logout = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const refresh_token = req.cookies?.refresh_token || req.body.refresh_token;
        const userId = req.user?.userId;

        if (!refresh_token) {
            return next(new ValidationError("Refresh token is required"));
        }

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        await this.jwtService.revokeRefreshToken(refresh_token, userId);

        logger.logAuth("logout", userId, req.ip);

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.status(200).json({
            status: "success",
            message: "Logged out successfully"
        });
    });

    /**
     * Logout from all devices endpoint.
     */
    logoutAll = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;

        if (!userId) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        await this.jwtService.revokeAllUserTokens(userId);

        logger.logAuth("logout", userId, req.ip);

        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        res.status(200).json({
            status: "success",
            message: "Logged out from all devices successfully"
        });
    });

    /**
     * Get current user endpoint. Returns authenticated user info.
     */
    getCurrentUser = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError("User not authenticated"));
        }

        res.status(200).json({
            status: "success",
            data: {
                user: req.user
            }
        });
    });
}
