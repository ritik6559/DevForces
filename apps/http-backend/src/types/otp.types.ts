import { z } from "zod";

export const SendOtpOptionsSchema = z.object({
    name: z.string().min(1),
    email: z.email(),
    template: z.string().min(1),
    purpose: z.enum(["registration", "login", "forgot_password", "verification"]),
});

export const VerifyOtpResultSchema = z.object({
    success: z.boolean(),
    attemptsLeft: z.number().int().nonnegative().optional(),
});