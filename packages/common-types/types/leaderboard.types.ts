import { z } from "zod";

export const LeaderBoardSchema = z.object({
    leaderboard_id: z.uuid(),
    contest_id: z.uuid(),
    user_id: z.uuid(),
    total_Score: z.int(),
    update_at: z.date().default(() => new Date())
});

export const CreateLeaderBoardSchema = z.object({
    contest_id: z.uuid(),
    user_id: z.uuid(),
    total_Score: z.int(),
});

export const UpdateLeaderBoardSchema = z.object({
    contest_id: z.uuid().optional(),
    user_id: z.uuid().optional(),
    total_Score: z.int(),
});

