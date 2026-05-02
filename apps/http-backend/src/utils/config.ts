// AUTH CONFIG
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
export const OTP_SALT = process.env.OTP_SALT!;

// MAIL CONFIG
export const SMTP_HOST = process.env.SMTP_HOST!;
export const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
export const SMTP_SERVICE = process.env.SMTP_SERVICE!;
export const SMTP_USER = process.env.SMTP_USER!;
export const SMTP_PASS = process.env.SMTP_PASS!;

// REDIS CONFIG
export const REDIS_URL = process.env.REDIS_URL!;