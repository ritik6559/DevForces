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

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  userId: z.string(),
  username: z.string(),
  score: z.number(),
});

export const TopPlayersResponseSchema = z.object({
  players: z.array(LeaderboardEntrySchema),
  total_participants: z.number(),
});

export const UserStandingResponseSchema = z.object({
  rank: z.number(),
  score: z.number(),
  total_participants: z.number(),
});

export const RawLeaderboardEntrySchema = z.object({
  userId: z.string(),
  score: z.number(),
  rank: z.number(),
});