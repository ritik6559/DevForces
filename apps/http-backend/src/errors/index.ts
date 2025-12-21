export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public override readonly message: string;
    public readonly details?: unknown;

    constructor(
        statusCode: number,
        message: string,
        isOperational: boolean = true,
        details?: unknown
    ) {
        super(message);

        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.message = message;
        this.details = details;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
        
        this.name = this.constructor.name;
    }
}

export class ValidationError extends AppError {
    constructor(message: string = 'Validation failed', details?: unknown) {
        super(400, message, true, details);
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized', details?: unknown) {
        super(401, message, true, details);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden', details?: unknown) {
        super(403, message, true, details);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = 'Resource not found', details?: unknown) {
        super(404, message, true, details);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = 'Conflict occurred', details?: unknown) {
        super(409, message, true, details);
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = 'Bad request', details?: unknown) {
        super(400, message, true, details);
    }
}

export class InternalServerError extends AppError {
    constructor(message: string = 'Internal server error', details?: unknown) {
        super(500, message, false, details);
    }
}

export class ServiceUnavailableError extends AppError {
    constructor(message: string = 'Service unavailable', details?: unknown) {
        super(503, message, false, details);
    }
}