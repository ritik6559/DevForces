import { z } from "zod";
import { RoleSchema } from "./user.types";

export const RefreshTokenSchema = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    token: z.string(),
    expires_at: z.date(),
    created_at: z.date().default(() => new Date()),
    updated_at: z.date()
});

export const StoreRefreshTokenSchema = z.object({
    user_id: z.uuid(),
    token: z.string(),
    expires_at: z.date()
});

export const TokenPayload = z.object({
    user_id: z.string(),
    email: z.email(),
    role: RoleSchema
})

export const TokenPair = z.object({
    access_token: z.string(),
    refresh_token: z.string()
});