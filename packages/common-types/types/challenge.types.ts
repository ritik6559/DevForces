import { z } from "zod";

export const DifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

export const ChallengeSchema = z.object({
  challenge_id: z.uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: DifficultySchema,
  max_points: z.number().int().positive(),
  notion_doc_id: z.string().nullable(),

  s3_prefix: z
    .string()
    .min(1, "S3 prefix is required")
    .endsWith("/", "S3 prefix must end with /"),

  allowed_deps: z
    .record(z.string(), z.string())
    .catch({}),
});

export const CreateChallengeSchema = ChallengeSchema.omit({ challenge_id: true }).extend({
  allowed_deps: z.record(z.string(), z.string()).default({}),
});

export const UpdateChallengeSchema = CreateChallengeSchema.partial();