import { container, injectable } from "tsyringe";
import { AuthService, type IAuthService } from "../service/auth.service";
import type { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { CreateUserSchema } from "../../../types/user.types";
import { ValidationError } from "../../../errors";
import { logger } from "../../../libs/logger";

@injectable()
export class AuthController {
    
    private readonly authService: IAuthService
    
    constructor() {
        this.authService = container.resolve(AuthService);
    }

    login = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();
        const ip = req.ip;
        const userAgent = req.get('user-agent');

        const isValidBody = CreateUserSchema.safeParse(req.body);
        
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

        const { email, username, role } = isValidBody.data;

        try {
            const user = await this.authService.loginUser({ email, username, role }, ip);
            
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
                status: "Success",
                message: "Login successful",
                data: user
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
}