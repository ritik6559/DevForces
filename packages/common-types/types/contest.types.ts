import { z } from "zod";

export const ContestSchema = z.object({
    contest_id: z.uuid(),
    title: z.string().min(1),
    description: z.string(),
    start_time: z.date(),
    created_at: z.date().default(() => new Date()),
});

export const CreateContestSchema = z.object({
    title: z.string().min(1).max(255),
    description: z.string(),
    start_time: z.date()
});

export const UpdateContestSchema = z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    start_time: z.date().optional()
});

export const ContestToChallengeMapping = z.object({
    id: z.uuid(),
    contest_id: z.uuid(),
    challenge_id: z.uuid(),
    index: z.number().int().nonnegative(),
});

export const CreateContestToChallengeMapping = z.object({
  contest_id: z.uuid(),
  challenge_id: z.uuid(),
  index: z.number().int().nonnegative(),
});

export const UpdateContestToChallengeMapping = z.object({
  contest_id: z.uuid().optional(),
  challenge_id: z.uuid().optional(),
  index: z.number().int().nonnegative().optional(),
});