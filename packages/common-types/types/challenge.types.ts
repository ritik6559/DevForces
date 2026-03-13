import { z } from "zod";

export const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const ChallengeSchema = z.object({
  challenge_id: z.uuid(),

  title: z.string().min(1),

  description: z.string(),

  difficulty: DifficultySchema,

  notion_doc_id: z.string().min(1).optional(),

  max_points: z.number().int().positive(),

  // [{ path: string, content: string, locked: boolean }]
  starter_files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
      locked: z.boolean(),
    })
  ).default([]),

  // [{ filename: string, content: string }]
  test_files: z.array(
    z.object({
      filename: z.string(),
      content: z.string(),
    })
  ).default([]),

  // { "express": "^4.18.0" }
  allowed_deps: z.record(z.string(), z.string()).default({}),
});

export const CreateChallengeSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string(),
    difficulty: DifficultySchema,
    notion_doc_id: z.string().min(1),
    max_points: z.number().int().positive(),
});

export const UpdateChallengeSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    difficulty: DifficultySchema,
    notion_doc_id: z.string().min(1).optional(),
    max_points: z.number().int().positive().optional(),
});