import { z } from "zod";

export const SendOtpSchema = z.object({
    email: z.email(),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .trim()
});

export const SendOtpOptionsSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    template: z.string().min(1),
    purpose: z.enum(["authentication", "forgot_password", "verification"]),
});

export const VerifyOtpResultSchema = z.object({
    success: z.boolean(),
    attemptsLeft: z.number().int().nonnegative().optional(),
});