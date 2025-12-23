import { container, injectable } from "tsyringe";
import type { CreateUser, User } from "../../../types";
import { AuthRespository, type IAuthRepository } from "../repository/auth.repository";
import { AppError, InternalServerError, ValidationError } from "../../../errors/index";
import { logger } from "../../../libs/logger";
import { OTPService, type IOTPService } from "./otp.service";

export interface IAuthService {
    loginUser(createUserSchema: CreateUser, ip?: string): Promise<User>;
}

/**
 * AuthService handles user authentication and registration logic
 * Follows single responsibility principle and dependency injection patterns
 */
@injectable()
export class AuthService implements IAuthService {
    private readonly authRepository: IAuthRepository;
    private readonly otpService: IOTPService;

    constructor() {
        this.authRepository = container.resolve(AuthRespository);
        this.otpService = container.resolve(OTPService);
    }

    /**
     * Handles user login/registration flow
     * - If user exists, initiates OTP flow for existing user
     * - If user doesn't exist, creates new user with OTP verification
     * 
     * @param createUserSchema - User creation/login data
     * @param ip - Optional IP address for security logging
     * @returns User object after authentication
     * @throws AppError if validation or database operations fail
     */
    async loginUser(createUserSchema: CreateUser, ip?: string): Promise<User> {
        const startTime = Date.now();

        try {
            this.validateUserInput(createUserSchema);

            const { email } = createUserSchema;
            const normalizedEmail = this.normalizeEmail(email);

            logger.debug("Login attempt started", {
                email: normalizedEmail,
                ip,
                username: createUserSchema.username
            });

            const existingUser = await this.authRepository.findByEmail(normalizedEmail);

            if (existingUser) {
                const user = await this.handleExistingUser(existingUser, ip);
                
                logger.logAuth("login", existingUser.user_id, ip);
                logger.info("Login successful for existing user", {
                    userId: existingUser.user_id,
                    email: normalizedEmail,
                    duration: Date.now() - startTime
                });

                return user;
            }

            const newUser = await this.handleNewUser(
                { ...createUserSchema, email: normalizedEmail },
                ip
            );

            logger.logAuth("register", newUser.user_id, ip);
            logger.info("New user registration successful", {
                userId: newUser.user_id,
                email: normalizedEmail,
                duration: Date.now() - startTime
            });

            return newUser;

        } catch (error) {
            const duration = Date.now() - startTime;

            logger.error("Authentication failed", {
                email: createUserSchema.email,
                username: createUserSchema.username,
                ip,
                duration,
                error: error instanceof Error ? error.message : "Unknown error",
                errorCode: error instanceof AppError ? error.statusCode : "UNKNOWN_ERROR"
            });

             
            if (error instanceof ValidationError) {
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
     * Validates user input data
     */
    private validateUserInput(createUserSchema: CreateUser): void {
        const { email, username, role } = createUserSchema;

        if (!email?.trim()) {
            throw new ValidationError("Email is required");
        }

        if (!username?.trim()) {
            throw new ValidationError("Username is required");
        }

        if (!role) {
            throw new ValidationError("Role is required");
        }

         
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError("Invalid email format");
        }

         
        if (username.length < 3 || username.length > 30) {
            throw new ValidationError(
                "Username must be between 3 and 30 characters"
            );
        }

        logger.debug("User input validation passed", {
            email: email.trim().toLowerCase(),
            username
        });
    }

    /**
     * Normalizes email to lowercase for consistent comparison
     */
    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    /**
     * Handles login flow for existing users
     */
    private async handleExistingUser(user: User, ip?: string): Promise<User> {
        logger.info("Existing user found, initiating OTP flow", {
            userId: user.user_id,
            email: user.email
        });
        
        try {
             
            await this.otpService.sendOtp({
                name: user.username,
                email: user.email,
                template: "user-activation-mail",
                purpose: "login"
            });
            
            logger.debug("OTP sent successfully", {
                userId: user.user_id,
                email: user.email
            });

             
            logger.logSecurity("otp_generated", {
                userId: user.user_id,
                email: user.email,
                ip,
                purpose: "login"
            });
            
            return user;

        } catch (error) {
            logger.error("Failed to send OTP to existing user", {
                userId: user.user_id,
                email: user.email,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError(
                "Failed to send verification code. Please try again."
            );
        }
    }

    /**
     * Handles registration flow for new users
     */
    private async handleNewUser(
        createUserSchema: CreateUser,
        ip?: string
    ): Promise<User> {
        logger.info("Creating new user account", {
            email: createUserSchema.email,
            username: createUserSchema.username,
            role: createUserSchema.role
        });
        
        try {
             
            await this.otpService.sendOtp({
                name: createUserSchema.username,
                email: createUserSchema.email,
                template: "user-activation-mail",
                purpose: "registration"
            });
             
            const newUser = await this.authRepository.createUser(createUserSchema);
            
            logger.debug("OTP sent for new user registration", {
                email: createUserSchema.email
            });

             
            logger.logSecurity("otp_generated", {
                userId: newUser.user_id,
                email: newUser.email,
                ip,
                purpose: "registration"
            });
            
            logger.info("New user created successfully", {
                userId: newUser.user_id,
                email: newUser.email
            });
            
            return newUser;

        } catch (error) {
            logger.error("Failed to create new user", {
                email: createUserSchema.email,
                username: createUserSchema.username,
                error: error instanceof Error ? error.message : "Unknown error"
            });

            throw new InternalServerError(
                "Failed to create account. Please try again."
            );
        }
    }
}