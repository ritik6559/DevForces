import { z } from "zod";

export const ChallengeSchema = z.object({
    challenge_id: z.uuid(),
    title: z.string().min(1),
    description: z.string(),
    notion_doc_id: z.string().min(1),
    max_points: z.number().int().positive(),
});

export const CreateChallengeSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string(),
    notion_doc_id: z.string().min(1),
    max_points: z.number().int().positive(),
});

export const UpdateChallengeSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    notion_doc_id: z.string().min(1).optional(),
    max_points: z.number().int().positive().optional(),
});