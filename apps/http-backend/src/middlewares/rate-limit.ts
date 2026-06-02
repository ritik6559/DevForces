import rateLimit from "express-rate-limit";

const errorBody = (message: string) => ({
    status: "error",
    message,
    data: null,
});

/**
 * General limiter for unauthenticated auth endpoints (login, refresh) to slow
 * credential-stuffing and token-guessing.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: errorBody("Too many requests, please try again later."),
});

/**
 * Tighter limiter for OTP issuance to prevent email/OTP spam and enumeration.
 */
export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    limit: 5,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: errorBody("Too many OTP requests, please try again later."),
});
