import { z } from "zod";
import { CreateUserSchema, RoleSchema, UpdateUserSchema, UserSchema } from "./user.types";
import { ContestSchema, ContestToChallengeMapping, CreateContestSchema, UpdateContestSchema, CreateContestToChallengeMapping, UpdateContestToChallengeMapping } from "./contest.types"
import { ChallengeSchema, CreateChallengeSchema, UpdateChallengeSchema } from "./challenge.types";
import { ContestSubmissionSchema, CreateContestSubmissionSchema, CreateSubmissionSchema, SubmissionSchema, UpdateContestSubmissionSchema, UpdateSubmissionSchema } from "./submission.types"
import { CreateLeaderBoardSchema, LeaderBoardSchema, UpdateLeaderBoardSchema } from "./leaderboard.types";
import { StoreRefreshTokenSchema, RefreshTokenSchema, TokenPayload, TokenPair } from "./token.types";
import { SendOtpOptionsSchema, VerifyOtpResultSchema } from "./otp.types";

export type User = z.infer<typeof UserSchema>;
export type Contest = z.infer<typeof ContestSchema>;
export type ContestToChallengeMap = z.infer<typeof ContestToChallengeMapping>;
export type Challenge = z.infer<typeof ChallengeSchema>;
export type ContestSubmission = z.infer<typeof ContestSubmissionSchema>;
export type Submission = z.infer<typeof SubmissionSchema>;
export type LeaderBoard = z.infer<typeof LeaderBoardSchema>;

export type CreateUser = z.infer<typeof CreateUserSchema>;
export type CreateContest = z.infer<typeof CreateContestSchema>;
export type CreateContestToChallengeMap = z.infer<typeof CreateContestToChallengeMapping>;
export type CreateChallenge = z.infer<typeof CreateChallengeSchema>;
export type CreateContestSubmission = z.infer<typeof CreateContestSubmissionSchema>;
export type CreateSubmission = z.infer<typeof CreateSubmissionSchema>;
export type CreateLeaderBoard = z.infer<typeof CreateLeaderBoardSchema>;

export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type UpdateContest = z.infer<typeof UpdateContestSchema>;
export type UpdateContestToChallengeMap = z.infer<typeof UpdateContestToChallengeMapping>;
export type UpdateChallenge = z.infer<typeof UpdateChallengeSchema>;
export type UpdateContestSubmission = z.infer<typeof UpdateContestSubmissionSchema>;
export type UpdateSubmission = z.infer<typeof UpdateSubmissionSchema>;
export type UpdateLeaderBoard = z.infer<typeof UpdateLeaderBoardSchema>;

export type StoreRefreshToken = z.infer<typeof StoreRefreshTokenSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
export type TokenPayload = z.infer<typeof TokenPayload>;
export type TokenPair = z.infer<typeof TokenPair>;

export type SendOtpOptions = z.infer<typeof SendOtpOptionsSchema>;
export type VerifyOtpResult = z.infer<typeof VerifyOtpResultSchema>;