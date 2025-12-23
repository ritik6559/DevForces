import { container, injectable } from "tsyringe";
import { AuthService, type IAuthService } from "../service/auth.service";
import type { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../../../middlewares/error.middleware";
import { CreateUserSchema } from "../../../types/user.types";
import { ValidationError } from "../../../errors";

@injectable()
export class AuthController {
    
    private readonly authService: IAuthService
    
    constructor() {
        this.authService = container.resolve(AuthService);
    }

    login = ErrorHandler.asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const isValidBody = CreateUserSchema.safeParse(req.body);
        
        if (!isValidBody.success) {
            return next(new ValidationError("Invalid request body", isValidBody.error.format()));
        }

        const { email, username, role } = isValidBody.data;
        const ip = req.ip;

        try {
            const user = await this.authService.loginUser({ email, username, role }, ip);
            
            res.status(200).json({
                status: "Success",
                message: "Login successful",
                data: user
            });

        } catch (error) {
            next(error);
        }
    });
}