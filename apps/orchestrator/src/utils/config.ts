// AUTH CONFIG
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
export const OTP_SALT = process.env.OTP_SALT!;

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "devforces-internal-dev-key";
