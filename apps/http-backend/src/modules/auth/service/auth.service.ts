import { container, inject, injectable } from "tsyringe";

import type { CreateUser, User } from "common-types";
import { AuthRespository, type IAuthRepository } from "../repository/auth.repository";
import { AppError, InternalServerError, ValidationError, UnauthorizedError } from "../../../errors/index";
import { logger } from "logger";
import { OTPService, type IOTPService } from "./otp.service";

export interface IAuthService {
    sendOtp(username: string, email: string, ip?: string): Promise<void>;
    loginUser(createUserSchema: CreateUser & { otp: string }, ip?: string): Promise<User>;
}

/**
 * AuthService handles user authentication and registration logic
 */
@injectable()
export class AuthService implements IAuthService {

    constructor(
        @inject("IAuthRespository") private authRepository: IAuthRepository,
        @inject("IOTPService") private otpService: IOTPService
    ) {}

    /**
     * Sends OTP to user's email
     * This is called before login/registration
     * 
     * @param username Username of the user
     * @param email Email of the user
     * @param ip Optional IP address for security logging
     */
    async sendOtp(username: string, email: string, ip?: string): Promise<void> {
        const startTime = Date.now();

        try {
            const normalizedEmail = this.normalizeEmail(email);
            this.validateEmail(normalizedEmail);

            logger.debug("Sending OTP", { email: normalizedEmail, username, ip });

            await this.otpService.sendOtp({
                name: username,
                email: normalizedEmail,
                template: "user-activation-mail",
                purpose: "authentication"
            });

            logger.info("OTP sent successfully", {
                email: normalizedEmail,
                username,
                ip,
                duration: Date.now() - startTime
            });

        } catch (error) {
            const duration = Date.now() - startTime;
            logger.error("Failed to send OTP", {
                email,
                username,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Failed to send OTP. Please try again.");
        }
    }

    /**
     * Handles user login/registration flow with OTP verification
     * - Verifies the OTP first
     * - If user exists, logs them in
     * - If user doesn't exist, creates new user
     * 
     * @param createUserSchema User creation/login data with OTP
     * @param ip Optional IP address for security logging
     * @returns User object after authentication
     * @throws AppError if validation or database operations fail
     */
    async loginUser(
        createUserSchema: CreateUser & { otp: string }, 
        ip?: string
    ): Promise<User> {
        const startTime = Date.now();

        try {
            const { email, username, otp } = createUserSchema;
            const normalizedEmail = this.normalizeEmail(email);

            logger.debug("Login attempt with OTP verification", {
                email: normalizedEmail,
                username,
                ip
            });

            const isOtpValid = await this.otpService.verifyOtp(normalizedEmail, otp);
            
            if (!isOtpValid) {
                logger.logSecurity("invalid_otp_attempt", {
                    email: normalizedEmail,
                    ip,
                    reason: "Invalid or expired OTP"
                });
                throw new UnauthorizedError("Invalid or expired OTP");
            }

            logger.debug("OTP verified successfully", { email: normalizedEmail });

            const existingUser = await this.authRepository.findByEmail(normalizedEmail);

            if (existingUser) {
                logger.logAuth("login", existingUser.user_id, ip);
                logger.info("Login successful for existing user", {
                    userId: existingUser.user_id,
                    email: normalizedEmail,
                    duration: Date.now() - startTime
                });

                return existingUser;
            }

            const newUser = await this.authRepository.createUser({
                email: normalizedEmail,
                username,
            });

            logger.logAuth("register", newUser.user_id, ip);
            logger.info("New user registration successful", {
                userId: newUser.user_id,
                email: normalizedEmail,
                duration: Date.now() - startTime
            });

            return newUser;

        } catch (error) {
            console.log(error);
            const duration = Date.now() - startTime;
            logger.error("Authentication failed", {
                email: createUserSchema.email,
                username: createUserSchema.username,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error",
                errorCode: error instanceof AppError ? error.statusCode : "UNKNOWN_ERROR"
            });

            if (error instanceof ValidationError || error instanceof UnauthorizedError) {
                logger.logSecurity("invalid_login_attempt", {
                    email: createUserSchema.email,
                    ip,
                    reason: error.message,
                    errorCode: error.statusCode
                });
            }

            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError(
                "Authentication failed. Please try again."
            );
        }
    }

    /**
     * Validates email format
     */
    private validateEmail(email: string): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError("Invalid email format");
        }
    }

    /**
     * Normalizes email to lowercase for consistent comparison
     */
    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }
}