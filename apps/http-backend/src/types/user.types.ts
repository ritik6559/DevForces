import { z } from 'zod';

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
    user_id: z.uuid(),
    email: z.email(),
    username: z.string().min(1),
    role: RoleSchema,
});

export const CreateUserSchema = z.object({
    email: z.email(),
    username: z.string().min(1).max(100),
});

export const CreateUserSchemaWithOtp = z.object({
    email: z.email(),
    username: z.string().min(1).max(100),
    otp: z.string().min(4).max(4),
    role: RoleSchema.default('USER'),
});

export const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    username: z.string().min(1).max(100).optional(),
    role: RoleSchema.optional(),
});