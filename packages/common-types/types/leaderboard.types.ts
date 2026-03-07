import { z } from "zod";

export const LeaderBoardSchema = z.object({
    leaderboard_id: z.uuid(),
    contest_id: z.uuid(),
    user_id: z.uuid(),
    rank: z.string().min(1),
});

export const CreateLeaderBoardSchema = z.object({
    contest_id: z.uuid(),
    user_id: z.uuid(),
    rank: z.string().min(1),
});

export const UpdateLeaderBoardSchema = z.object({
    contest_id: z.uuid().optional(),
    user_id: z.uuid().optional(),
    rank: z.string().min(1).optional(),
});