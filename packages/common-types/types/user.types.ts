import { z } from 'zod';

export const RoleSchema = z.enum(['USER', 'ADMIN']);

export const UserSchema = z.object({
  user_id:    z.uuid(),
  email:      z.email(),
  username:   z.string().min(1),
  role:       RoleSchema.default('USER'),
  created_at: z.date().default(() => new Date()),      
});

export const CreateUserSchema = z.object({
  email:    z.email(),
  username: z.string().min(1).max(100),
});

export const CreateUserSchemaWithOtp = z.object({
  email:    z.email(),
  username: z.string().min(1).max(100),
  otp:      z.string().length(6),         
});

export const UpdateUserSchema = z.object({
  email:    z.email().optional(),
  username: z.string().min(1).max(100).optional(),
  role:     RoleSchema.optional(),         
});