import { z } from "zod";

export const DifficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);

export const SubmissionStatusSchema = z.enum([
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
]);

export const ChallengeProgressStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
]);

const SubmissionFileSchema = z.object({
  path: z
    .string()
    .min(1)
    .refine(
      (p) => !p.startsWith("..") && !p.startsWith("/"),
      "Path traversal not allowed"
    )
    .refine(
      (p) => /\.(js|ts|json)$/.test(p),
      "Only .js, .ts, .json files allowed"
    ),
  content: z.string().max(50_000, "File exceeds 50KB limit"),
});

export const CreateSubmissionSchema = z.object({
  challenge_id: z.uuid(),

  contest_to_challenge_mapping_id: z.uuid().nullable(),

  files: z
    .array(SubmissionFileSchema)
    .min(1, "At least one file required")
    .max(20, "Max 20 files per submission")
    .refine(
      (files) => files.reduce((sum, f) => sum + f.content.length, 0) <= 500_000,
      "Total submission size exceeds 500KB"
    ),
});

export const SubmissionSchema = z.object({
  submission_id: z.uuid(),
  user_id:       z.uuid(),
  challenge_id:  z.uuid(),
  created_at:    z.date().default(() => new Date()),
  status:        SubmissionStatusSchema,

  submission_s3_prefix: z.string().endsWith("/").nullable(),

  contest_to_challenge_mapping_id: z.uuid().nullable(),
});

export const SubmissionResponseSchema = z.object({
  submission_id: z.uuid(),
  status:        SubmissionStatusSchema,
  job_id:        z.uuid(), 
});

export const AutosaveSchema = z.object({
  contest_id:   z.uuid(),
  challenge_id: z.uuid(),
  files: z
    .array(SubmissionFileSchema)
    .min(1, "At least one file required")
    .max(20, "Too many files"),
});

export const UserChallengeProgressSchema = z.object({
  id:           z.uuid(),
  user_id:      z.uuid(),
  challenge_id: z.uuid(),
  contest_id:   z.uuid(),
  status:       ChallengeProgressStatusSchema.default("NOT_STARTED"),

  draft_s3_prefix: z
    .string()
    .endsWith("/", "S3 prefix must end with /")
    .nullable()
    .default(null),

  last_saved_at: z.date().default(() => new Date()),
  created_at:    z.date().default(() => new Date()),
  updated_at:    z.date().default(() => new Date()),
});

const TestDetailSchema = z.object({
  name:        z.string(),
  passed:      z.boolean(),
  error:       z.string().nullable().optional(),
  duration_ms: z.number().int().nonnegative(),
});

export const EvaluationResultSchema = z.object({
  id:            z.uuid(),
  submission_id: z.uuid(),
  created_at:    z.date().default(() => new Date()),

  total_score:       z.number().int().min(0).max(100),
  tests_score:       z.number().int().min(0).max(100),
  static_score:      z.number().int().min(0).max(100),
  tests_passed:      z.number().int().nonnegative(),
  tests_total:       z.number().int().nonnegative(),
  execution_time_ms: z.number().int().nonnegative(),

  test_details: z.array(TestDetailSchema),
  llm_feedback: z.string().nullable().optional(),
});

export const EvaluationResultResponseSchema = EvaluationResultSchema
  .omit({ id: true, submission_id: true, created_at: true })
  .extend({
    rank: z.number().int().positive(), // user's new leaderboard rank
  });

const AllowedDepsSchema = z.record(
  z.string(), 
  z.string()  
);

export const ChallengeSchema = z.object({
  challenge_id:  z.uuid(),
  title:         z.string().min(1, "Title is required"),
  description:   z.string().min(1, "Description is required"),
  difficulty:    DifficultySchema,
  max_points:    z.number().int().positive(),
  notion_doc_id: z.string().optional().nullable(),

  s3_prefix: z
    .string()
    .min(1, "S3 prefix is required")
    .endsWith("/", "S3 prefix must end with /"),

  allowed_deps: AllowedDepsSchema.default({}),
});

export const CreateChallengeSchema = ChallengeSchema.omit({ challenge_id: true });

export const UpdateChallengeSchema = CreateChallengeSchema.partial();

export const ChallengeResponseSchema = ChallengeSchema.extend({
  files: z.array(
    z.object({
      path:    z.string(),
      content: z.string(),
      locked:  z.boolean(), 
    })
  ),
  is_resume:     z.boolean(),               
  last_saved_at: z.date().default(() => new Date()),
});