import { z } from "zod";
import { CreateUserSchema, CreateUserSchemaWithOtp, RoleSchema, UpdateUserSchema, UserSchema } from "./types/user.types";
import { ContestSchema, ContestToChallengeMapping, CreateContestSchema, UpdateContestSchema, CreateContestToChallengeMapping, UpdateContestToChallengeMapping } from "./types/contest.types"
import { ChallengeSchema, CreateChallengeSchema, UpdateChallengeSchema, DifficultySchema, TechStackSchema } from "./types/challenge.types";
import { CreateSubmissionSchema, SubmissionSchema } from "./types/submission.types"
import { CreateLeaderBoardSchema, LeaderBoardSchema, UpdateLeaderBoardSchema, LeaderboardEntrySchema, RawLeaderboardEntrySchema, TopPlayersResponseSchema, UserStandingResponseSchema } from "./types/leaderboard.types";
import { StoreRefreshTokenSchema, RefreshTokenSchema, TokenPayload, TokenPair } from "./types/token.types";
import { SendOtpSchema, SendOtpOptionsSchema, VerifyOtpResultSchema } from "./types/otp.types";

export type User = z.infer<typeof UserSchema>;
export type Contest = z.infer<typeof ContestSchema>;
export type ContestToChallengeMap = z.infer<typeof ContestToChallengeMapping>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type LeaderBoard = z.infer<typeof LeaderBoardSchema>;
export type TechStack = z.infer<typeof TechStackSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type CreateUserWithOtp = z.infer<typeof CreateUserSchemaWithOtp>;
export type CreateContest = z.infer<typeof CreateContestSchema>;
export type CreateContestToChallengeMap = z.infer<typeof CreateContestToChallengeMapping>;
export type CreateChallenge = z.infer<typeof CreateChallengeSchema>;
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;
export type CreateLeaderBoard = z.infer<typeof CreateLeaderBoardSchema>;
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
export type RawLeaderboardEntry = z.infer<typeof RawLeaderboardEntrySchema>;
export type TopPlayersResponse = z.infer<typeof TopPlayersResponseSchema>;
export type UserStandingResponse = z.infer<typeof UserStandingResponseSchema>;
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

export enum SocketEvents {
    LOADED = "loaded",
    FETCH_DIR = "fetch_dir",
    FETCH_CONTENT = "fetch_content",
    SAVE_FILE = "save_file",
    UPDATE_CONTENT = "update_content",
    REQUEST_TERMINAL = "request_terminal",
    TERMINAL_INPUT = "terminal_input",
    TERMINAL_RESIZE = "terminal_resize",
    TERMINAL_CLEAR = "terminal_clear",
    TERMINAL_CLEAR_ALL = "terminal_clear_all",  
    TERMINAL_OUTPUT = "terminal_output",
    TERMINAL_EXIT = "terminal_exit"
}

export {
    CreateUserSchemaWithOtp,
    SendOtpSchema,

    CreateChallengeSchema,

    CreateContestSchema,
    UpdateContestSchema,
    DifficultySchema,
    TechStackSchema,
    
}