import { z } from "zod";
import { CreateUserSchema, CreateUserSchemaWithOtp, RoleSchema, UpdateUserSchema, UserSchema } from "./types/user.types";
import { ContestSchema, ContestToChallengeMapping, CreateContestSchema, UpdateContestSchema, CreateContestToChallengeMapping, UpdateContestToChallengeMapping } from "./types/contest.types"
import { ChallengeSchema, CreateChallengeSchema, UpdateChallengeSchema } from "./types/challenge.types";
import { CreateSubmissionSchema, SubmissionSchema } from "./types/submission.types"
import { CreateLeaderBoardSchema, LeaderBoardSchema, UpdateLeaderBoardSchema } from "./types/leaderboard.types";
import { StoreRefreshTokenSchema, RefreshTokenSchema, TokenPayload, TokenPair } from "./types/token.types";
import { SendOtpSchema, SendOtpOptionsSchema, VerifyOtpResultSchema } from "./types/otp.types";

export type User = z.infer<typeof UserSchema>;
export type Contest = z.infer<typeof ContestSchema>;
export type ContestToChallengeMap = z.infer<typeof ContestToChallengeMapping>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type LeaderBoard = z.infer<typeof LeaderBoardSchema>;

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type CreateUserWithOtp = z.infer<typeof CreateUserSchemaWithOtp>;
export type CreateContest = z.infer<typeof CreateContestSchema>;
export type CreateContestToChallengeMap = z.infer<typeof CreateContestToChallengeMapping>;
export type CreateChallenge = z.infer<typeof CreateChallengeSchema>;
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;
export type CreateLeaderBoard = z.infer<typeof CreateLeaderBoardSchema>;

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UpdateContest = z.infer<typeof UpdateContestSchema>;
export type UpdateContestToChallengeMap = z.infer<typeof UpdateContestToChallengeMapping>;
export type UpdateChallenge = z.infer<typeof UpdateChallengeSchema>;
export type UpdateLeaderBoard = z.infer<typeof UpdateLeaderBoardSchema>;

export type StoreRefreshToken = z.infer<typeof StoreRefreshTokenSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type TokenPayload = z.infer<typeof TokenPayload>;
export type TokenPair = z.infer<typeof TokenPair>;

export type SendOtpOptions = z.infer<typeof SendOtpOptionsSchema>;
export type SendOtp = z.infer<typeof SendOtpSchema>;
export type VerifyOtpResult = z.infer<typeof VerifyOtpResultSchema>;

export {
    CreateUserSchemaWithOtp,
    SendOtpSchema,

    CreateChallengeSchema,

    CreateContestSchema,
    UpdateContestSchema,
}