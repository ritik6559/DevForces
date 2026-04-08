import crypto from "crypto";

import redis from "../../../libs/redis";
import { ValidationError } from "../../../errors";
import { logger } from "../../../libs/logger";
import { sendMail } from "../../../utils/send-mail";
import type { SendOtpOptions, VerifyOtpResult } from "common-types";
import { OTP_SALT } from "../../../utils/config";

export interface IOTPService {
    sendOtp(options: SendOtpOptions): Promise<void>;
    verifyOtp(email: string, otp: string): Promise<VerifyOtpResult>;
    isAccountLocked(email: string): Promise<boolean>;
    clearOtpData(email: string): Promise<void>;
}

/**
 * OTPService handles OTP generation, validation, and rate limiting
 * Implements secure OTP verification with Redis-based tracking
 */
export class OTPService implements IOTPService {
    
    private readonly OTP_EXPIRY = 300; // 5 minutes
    private readonly OTP_COOLDOWN = 60; // 1 minute
    private readonly SPAM_LOCK_DURATION = 3600; // 1 hour
    private readonly ACCOUNT_LOCK_DURATION = 1800; // 30 minutes
    private readonly MAX_OTP_REQUESTS_PER_HOUR = 10;
    private readonly MAX_FAILED_ATTEMPTS = 5;
    private readonly OTP_LENGTH = 6;

    /**
     * Sends OTP to user's email
     * Implements rate limiting and spam protection
     * 
     * @param options - OTP sending options including name, email, template
     * @throws ValidationError if rate limits are exceeded
     */
    async sendOtp(options: SendOtpOptions): Promise<void> {
        const { name, email, template, purpose } = options;

        try {
            logger.debug("OTP send request initiated", {
                email,
                purpose
            });

            console.log("OTP for" + email)

            await this.checkOtpRestrictions(email);
            await this.trackOtpRequests(email);
            const otp = this.generateOtp();

            await sendMail(email, "Verify your email", template, { name, otp });

            const hashedOtp = this.hashOtp(otp);
            await redis.set(`otp:${email}`, hashedOtp, "EX", this.OTP_EXPIRY);

            await redis.set(`otp_cooldown:${email}`, "true", "EX", this.OTP_COOLDOWN);

            logger.info("OTP sent successfully", {
                email,
                purpose,
                expiresIn: this.OTP_EXPIRY
            });

            logger.logSecurity("otp_sent", {
                email,
                purpose,
                otpLength: this.OTP_LENGTH
            });

        } catch (error) {
            logger.error("Failed to send OTP", {
                email,
                purpose,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof ValidationError) {
                throw error;
            }

            throw new ValidationError("Failed to send OTP. Please try again later");
        }
    }

    /**
     * Verifies OTP provided by user
     * Tracks failed attempts and locks account after threshold
     * 
     * @param email - User's email
     * @param otp - OTP to verify
     * @returns Verification result with success status
     * @throws ValidationError if OTP is invalid or expired
     */
    async verifyOtp(email: string, otp: string): Promise<VerifyOtpResult> {
        try {
            logger.debug("OTP verification attempt", { email });

            const storedOtp = await redis.get(`otp:${email}`);

            if (!storedOtp) {
                logger.warn("OTP verification failed - expired or not found", { email });
                
                logger.logSecurity("otp_verification_failed", {
                    email,
                    reason: "expired_or_not_found"
                });

                throw new ValidationError("OTP expired or not found. Please request a new one");
            }

            const failedAttemptsKey = `otp_attempts:${email}`;
            const failedAttempts = parseInt(await redis.get(failedAttemptsKey) || "0");

            if (storedOtp !== this.hashOtp(otp)) {
                const newFailedAttempts = failedAttempts + 1;
                const attemptsLeft = this.MAX_FAILED_ATTEMPTS - newFailedAttempts;

                logger.warn("Invalid OTP provided", {
                    email,
                    failedAttempts: newFailedAttempts,
                    attemptsLeft
                });

                if (newFailedAttempts >= this.MAX_FAILED_ATTEMPTS) {
                    await redis.set(
                        `otp_lock:${email}`,
                        "locked",
                        "EX",
                        this.ACCOUNT_LOCK_DURATION
                    );
                    
                    await redis.del(`otp:${email}`, failedAttemptsKey);

                    logger.logSecurity("account_locked_otp_attempts", {
                        email,
                        failedAttempts: newFailedAttempts,
                        lockDuration: this.ACCOUNT_LOCK_DURATION
                    });

                    throw new ValidationError(
                        "Too many failed attempts. Your account is locked for 30 minutes"
                    );
                }

                await redis.set(
                    failedAttemptsKey,
                    newFailedAttempts.toString(),
                    "EX",
                    this.OTP_EXPIRY
                );

                logger.logSecurity("invalid_otp_attempt", {
                    email,
                    attemptsLeft
                });

                throw new ValidationError(
                    `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left`
                );
            }

            await redis.del(`otp:${email}`, `otp_attempts:${email}`);

            logger.info("OTP verified successfully", { email });

            logger.logSecurity("otp_verified", {
                email,
                success: true
            });

            return { success: true };

        } catch (error) {
            logger.error("OTP verification error", {
                email,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            if (error instanceof ValidationError) {
                throw error;
            }

            throw new ValidationError("Failed to verify OTP. Please try again");
        }
    }

    /**
     * Checks if email is under any OTP-related restrictions
     * 
     * @param email - User's email
     * @throws ValidationError if any restrictions are active
     */
    private async checkOtpRestrictions(email: string): Promise<void> {
        const isLocked = await redis.get(`otp_lock:${email}`);
        if (isLocked) {
            logger.warn("OTP request blocked - account locked", { email });

            logger.logSecurity("otp_request_blocked", {
                email,
                reason: "account_locked"
            });

            throw new ValidationError(
                "Account locked due to multiple failed attempts. Please try again after 30 minutes"
            );
        }

        const isSpamLocked = await redis.get(`otp_spam_lock:${email}`);
        if (isSpamLocked) {
            logger.warn("OTP request blocked - spam lock", { email });

            logger.logSecurity("otp_request_blocked", {
                email,
                reason: "spam_lock"
            });

            throw new ValidationError(
                "Too many OTP requests. Please wait 1 hour before trying again"
            );
        }

        const isInCooldown = await redis.get(`otp_cooldown:${email}`);
        if (isInCooldown) {
            logger.debug("OTP request blocked - cooldown period", { email });

            throw new ValidationError(
                "Please wait 1 minute before requesting another OTP"
            );
        }
    }

    /**
     * Tracks OTP requests to prevent spam
     * 
     * @param email - User's email
     * @throws ValidationError if spam threshold is reached
     */
    private async trackOtpRequests(email: string): Promise<void> {
        const otpRequestKey = `otp_request_count:${email}`;
        const otpRequests = parseInt(await redis.get(otpRequestKey) || "0");

        if (otpRequests >= this.MAX_OTP_REQUESTS_PER_HOUR) {
            await redis.set(
                `otp_spam_lock:${email}`,
                "locked",
                "EX",
                this.SPAM_LOCK_DURATION
            );

            logger.logSecurity("spam_lock_activated", {
                email,
                otpRequests,
                lockDuration: this.SPAM_LOCK_DURATION
            });

            throw new ValidationError(
                "Too many OTP requests. Please wait 1 hour before trying again"
            );
        }

        await redis.set(
            otpRequestKey,
            (otpRequests + 1).toString(),
            "EX",
            this.SPAM_LOCK_DURATION
        );

        logger.debug("OTP request tracked", {
            email,
            requestCount: otpRequests + 1,
            maxAllowed: this.MAX_OTP_REQUESTS_PER_HOUR
        });
    }

    /**
     * Generates a random OTP
     * 
     * @returns Random OTP string
     */
    private generateOtp(): string {
        const min = Math.pow(10, this.OTP_LENGTH - 1);
        const max = Math.pow(10, this.OTP_LENGTH) - 1;
        return crypto.randomInt(min, max).toString();
    }

    private hashOtp(otp: string): string {
        return crypto.createHash("sha256").update(otp + OTP_SALT).digest("hex");
    }

    /**
     * Checks if an account is currently locked
     * 
     * @param email - User's email
     * @returns True if account is locked
     */
    async isAccountLocked(email: string): Promise<boolean> {
        const isLocked = await redis.get(`otp_lock:${email}`);
        return !!isLocked;
    }

    /**
     * Clears all OTP-related data for an email
     * Useful for testing or administrative actions
     * 
     * @param email - User's email
     */
    async clearOtpData(email: string): Promise<void> {
        try {
            await redis.del(
                `otp:${email}`,
                `otp_attempts:${email}`,
                `otp_lock:${email}`,
                `otp_spam_lock:${email}`,
                `otp_cooldown:${email}`,
                `otp_request_count:${email}`
            );

            logger.info("OTP data cleared", { email });

        } catch (error) {
            logger.error("Failed to clear OTP data", {
                email,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new ValidationError("Failed to clear OTP data");
        }
    }

    /**
     * Gets remaining attempts for OTP verification
     * 
     * @param email - User's email
     * @returns Number of remaining attempts
     */
    async getRemainingAttempts(email: string): Promise<number> {
        const failedAttemptsKey = `otp_attempts:${email}`;
        const failedAttempts = parseInt(await redis.get(failedAttemptsKey) || "0");
        return Math.max(0, this.MAX_FAILED_ATTEMPTS - failedAttempts);
    }

    /**
     * Gets time until account unlock (in seconds)
     * 
     * @param email - User's email
     * @returns Seconds until unlock, or 0 if not locked
     */
    async getTimeUntilUnlock(email: string): Promise<number> {
        const ttl = await redis.ttl(`otp_lock:${email}`);
        return Math.max(0, ttl);
    }
}