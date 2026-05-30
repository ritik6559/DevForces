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

/**
 * Payload for {@link SocketEvents.UPDATE_CONTENT}. The client sends only a
 * unified-diff `patch` (not the full file) describing how to turn the content
 * it last synced (`baseHash`) into the new content (`newHash`).
 */
export interface UpdateContentPayload {
    /** File path relative to the workspace root, e.g. `src/index.js`. */
    path: string;
    /** Unified-diff patch produced by `createContentPatch`. */
    patch: string;
    /** Hash of the content the patch was created against (drift detection). */
    baseHash: string;
    /** Hash of the expected result after applying the patch (integrity check). */
    newHash: string;
}

/** Acknowledgement returned for an {@link SocketEvents.UPDATE_CONTENT} event. */
export interface UpdateContentAck {
    success: boolean;
    error?: string;
    /**
     * Set when the server's copy drifted from the client's base (or the patch
     * failed to apply). The client should rebase on `content` and retry.
     */
    resync?: boolean;
    /** The server's current content, sent alongside `resync`. */
    content?: string;
}

export {
    hashContent,
    createContentPatch,
    applyContentPatch,
} from "./utils/diff";

export {
    CreateUserSchemaWithOtp,
    SendOtpSchema,

    CreateChallengeSchema,

    CreateContestSchema,
    UpdateContestSchema,
    DifficultySchema,
    TechStackSchema,
    
}