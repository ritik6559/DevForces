import { Router } from "express";
import { container } from "tsyringe";
import { validate } from "error-handler";
import { CreateUserSchemaWithOtp, SendOtpSchema } from "common-types";
import { AuthController } from "../controller/auth.controller";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";
import { authLimiter, otpLimiter } from "../../../middlewares/rate-limit";

const router = Router();
const authController = container.resolve(AuthController);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user's email
 * @access  Public
 * @body    { email: string, username: string }
 */
router.post("/send-otp", otpLimiter, validate(SendOtpSchema), authController.sendOtp);

/**
 * @route   POST /api/auth/login
 * @desc    Login/Register with OTP verification
 * @access  Public
 * @body    { email: string, username: string, role: string, otp: string }
 */
router.post("/login", authLimiter, validate(CreateUserSchemaWithOtp), authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (requires valid refresh token)
 * @body    { refresh_token: string } or cookie
 */
router.post("/refresh", authLimiter, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout from current device
 * @access  Private
 * @body    { refresh_token: string } or cookie
 */
router.post("/logout", AuthMiddleware.authenticateToken, authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post("/logout-all", AuthMiddleware.authenticateToken, authController.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get("/me", AuthMiddleware.authenticateToken, authController.getCurrentUser);

export default router;