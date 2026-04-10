import type { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';

export class ErrorHandler {
    static handle( err: Error, req: Request, res: Response, next: NextFunction ): void {
        
        if( err instanceof AppError ) {
            
            res.status(err.statusCode).json({
                status: 'error',
                message: err.message,
                data: null
            });
            
            return;
        }

        console.log(err);
        
        res.status(500).json({
            status: "error",
            message: "Something went wrong, please try again later.",
            data: null
        });
    }

    static asyncHandler(fn: Function) {
        
        return (req: Request, res: Response, next: NextFunction) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    
    }
}