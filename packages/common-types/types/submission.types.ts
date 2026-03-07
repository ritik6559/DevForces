import { z } from "zod";

export const ContestSubmissionSchema = z.object({
    contest_submission_id: z.uuid(),
    submission: z.string().min(1),
    contest_to_challenge_mapping_id: z.uuid(),
    user_id: z.uuid(),
    points: z.number().int().nonnegative(),
    created_at: z.date().default(() => new Date()),
});

export const SubmissionSchema = z.object({
    submission_id: z.uuid(),
    description: z.string().min(1),
    challenge_id: z.uuid(),
    user_id: z.uuid(),
    points: z.number().int().nonnegative(),
    created_at: z.date().default(() => new Date()),
});

export const CreateContestSubmissionSchema = z.object({
    submission: z.string().min(1),
    contest_to_challenge_mapping_id: z.uuid(),
    user_id: z.uuid(),
    points: z.number().int().min(0),
});

export const CreateSubmissionSchema = z.object({
    description: z.string().min(1),
    challenge_id: z.uuid(),
    user_id: z.uuid(),
    points: z.number().int().min(0),
});

export const UpdateContestSubmissionSchema = z.object({
    submission: z.string().min(1).optional(),
    contest_to_challenge_mapping_id: z.uuid().optional(),
    user_id: z.string().uuid().optional(),
    points: z.number().int().min(0).optional(),
});

export const UpdateSubmissionSchema = z.object({
    description: z.string().min(1).optional(),
    challenge_id: z.uuid().optional(),
    user_id: z.uuid().optional(),
    points: z.number().int().min(0).optional(),
});