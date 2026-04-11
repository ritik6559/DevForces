import winston from 'winston';

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

class Logger {
    private logger: winston.Logger;

    constructor() {
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.json(),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                return JSON.stringify({
                    timestamp,
                    level,
                    message,
                    ...meta
                });
            })
        );

        this.logger = winston.createLogger({
            level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
            format: logFormat,
            defaultMeta: { service: 'DevForces' },
            transports: [
                new winston.transports.Console({
                    format: process.env.NODE_ENV === 'development'
                        ? winston.format.combine(
                            winston.format.colorize(),
                            winston.format.simple()
                        )
                        : logFormat
                }),
                ...(process.env.NODE_ENV === 'production' ? [
                    new winston.transports.File({
                        filename: 'logs/error.log',
                        level: LogLevel.ERROR,
                        maxsize: 5242880,
                        maxFiles: 5
                    }),
                    new winston.transports.File({
                        filename: 'logs/combined.log',
                        maxsize: 5242880,
                        maxFiles: 5
                    })
                ] : [])
            ]
        });
    }

    error(message: string, meta?: Record<string, unknown>): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.logger.warn(message, meta);
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.logger.info(message, meta);
    }

    debug(message: string, meta?: Record<string, unknown>): void {
        this.logger.debug(message, meta);
    }

    logRequest(
        method: string,
        url: string,
        statusCode: number,
        responseTime: number,
        userAgent?: string,
        ip?: string
    ): void {
        this.info(`HTTP ${method} ${url}`, {
            method,
            url,
            statusCode,
            responseTime,
            userAgent,
            ip,
            type: 'http_request'
        });
    }

    logAuth(event: 'login' | 'register' | 'logout' | 'token_refresh', userId?: string, ip?: string): void {
        this.info(`Auth event: ${event}`, {
            event,
            userId,
            ip,
            type: 'auth_event'
        });
    }

    logSecurity(event: string, details: Record<string, unknown>): void {
        this.warn(`Security event: ${event}`, {
            event,
            ...details,
            type: 'security_event'
        });
    }
}

export const logger = new Logger();