import { z } from "zod";

export const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const TechStackSchema = z.enum(['NODEJS', 'PYTHON']);

export const ChallengeSchema = z.object({
  challenge_id: z.uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: DifficultySchema,
  max_points: z.number().int().positive(),
  tech_stack: TechStackSchema,
  notion_doc_id: z.string().nullable(),
});

export const CreateChallengeSchema = ChallengeSchema.omit({ challenge_id: true }).extend({});

export const UpdateChallengeSchema = CreateChallengeSchema.partial();