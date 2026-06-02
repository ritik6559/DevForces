import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import { copyS3Folder, getS3Content } from "s3";

import { redis } from "../../../libs/redis";
import { type ISubmissionRepository, type TestDetail } from "../repository/submission.repository";
import { type ILeaderBoardPublisher } from "../../leaderboard/pub-sub/leaderboard.publisher";
import { runJudge } from "../lib/judge-client";

const SUBMISSION_LOCK_TTL_SECONDS = 180;

/** Subset of Jest's `--json` output we depend on. */
interface JestAssertion {
    fullName: string;
    status: "passed" | "failed" | "pending";
    duration?: number;
    failureMessages: string[];
}
interface JestSuite {
    testResults: JestAssertion[];
}
interface JestJsonOutput {
    numPassedTests: number;
    numFailedTests: number;
    numTotalTests: number;
    testResults: JestSuite[];
}

interface TestResultView {
    name: string;
    status: "passed" | "failed" | "pending";
    duration_ms: number;
    error: string | null;
}

export interface SubmitResponse {
    submissionId: string;
    status: "COMPLETED" | "FAILED";
    score: { total: number; max: number; percentage: number; tests: number; static: number };
    tests: { passed: number; failed: number; total: number; results: TestResultView[] };
    leaderboard: { rank: number | null; previousBest: number | null };
    executionTimeMs: number;
    error?: string;
}

export type SubmitOutcome =
    | { kind: "ok"; body: SubmitResponse }
    | { kind: "contest_not_active" }
    | { kind: "mapping_not_found" }
    | { kind: "submission_in_progress" }
    | { kind: "workspace_expired" };

export interface ISubmissionService {
    submit(userId: string, contestId: string, challengeId: string): Promise<SubmitOutcome>;
}

/**
 * Orchestrates a submission end-to-end: guards, persistence, S3 snapshot
 */
@injectable()
export class SubmissionService implements ISubmissionService {

    constructor(
        @inject("ISubmissionRepository") private repo: ISubmissionRepository,
        @inject("ILeaderBoardPublisher") private leaderboardPublisher: ILeaderBoardPublisher,
    ) {}

    async submit(userId: string, contestId: string, challengeId: string): Promise<SubmitOutcome> {
        const startTime = Date.now();

        const contest = await this.repo.getContest(contestId);
        if (!contest || contest.status !== "ACTIVE") {
            return { kind: "contest_not_active" };
        }

        const mapping = await this.repo.resolveMapping(contestId, challengeId);
        if (!mapping) {
            return { kind: "mapping_not_found" };
        }

        const maxPoints = (await this.repo.getChallengeMaxPoints(challengeId)) ?? 0;

        const lockKey = `submitting:${userId}:${challengeId}`;
        const acquired = await redis.set(lockKey, "1", "EX", SUBMISSION_LOCK_TTL_SECONDS, "NX");
        
        if (acquired !== "OK") {
            return { kind: "submission_in_progress" };
        }

        let submissionId: string | undefined;

        try {
            submissionId = await this.repo.createSubmission(userId, challengeId, mapping.id);
            await this.repo.markProgressSubmitted(userId, challengeId, contestId);
            await this.repo.setSubmissionStatus(submissionId, "RUNNING");

            const submissionPrefix = `contests/${contestId}/challenges/${challengeId}/submissions/${submissionId}/`;
            const userPrefix = `contests/${contestId}/challenges/${challengeId}/users/${userId}`;
            await copyS3Folder(userPrefix, submissionPrefix);
            await this.repo.setSubmissionStatus(submissionId, "RUNNING", submissionPrefix);

            const testsCode = await getS3Content(`contests/${contestId}/challenges/${challengeId}/tests.js`);
            
            if (testsCode == null) {
                await this.repo.setSubmissionStatus(submissionId, "FAILED");
                return {
                    kind: "ok",
                    body: this.failedBody(submissionId, maxPoints, Date.now() - startTime,
                        "Challenge has no tests.js configured."),
                };
            }

            const judge = await runJudge({ contestId, challengeId, userId, testsCode });
            
            if (!judge.workspaceRunning) {
                await this.repo.setSubmissionStatus(submissionId, "FAILED");
                return { kind: "workspace_expired" };
            }

            const parsed = this.tryParseJest(judge.stdout);
            
            if (!parsed) {
                await this.repo.setSubmissionStatus(submissionId, "FAILED");
                return {
                    kind: "ok",
                    body: this.failedBody(submissionId, maxPoints, Date.now() - startTime,
                        `Jest could not run.\n${judge.stdout ?? ""}\n${judge.stderr ?? ""}`),
                };
            }

            const testsTotal = parsed.numTotalTests;
            const testsPassed = parsed.numPassedTests;
            const testsScore = testsTotal === 0 ? 0 : Math.round((testsPassed / testsTotal) * maxPoints);
            const staticScore = 0;
            const totalScore = testsScore + staticScore;
            const results = this.toResultViews(parsed);
            const testDetails: TestDetail[] = results.map((r) => ({
                name: r.name,
                passed: r.status === "passed",
                duration_ms: r.duration_ms,
                error: r.error,
            }));
            const executionTimeMs = Date.now() - startTime;

            await this.repo.upsertEvaluationResult({
                submissionId,
                totalScore,
                testsScore,
                staticScore,
                testsPassed,
                testsTotal,
                executionTimeMs,
                testDetails,
            });
            await this.repo.setSubmissionStatus(submissionId, "COMPLETED");

            const previousBest = await this.repo.getPreviousBest(contestId, userId);

            await this.leaderboardPublisher.publishScoreUpdated({
                contestId,
                challengeId,
                userId,
                submissionId,
                newScore: totalScore,
            });

            const rank = await this.repo.getRank(contestId, totalScore);

            logger.info("Submission judged", {
                submissionId, userId, contestId, challengeId, totalScore, testsPassed, testsTotal,
            });

            return {
                kind: "ok",
                body: {
                    submissionId,
                    status: "COMPLETED",
                    score: {
                        total: totalScore,
                        max: maxPoints,
                        percentage: maxPoints ? Math.round((totalScore / maxPoints) * 1000) / 10 : 0,
                        tests: testsScore,
                        static: staticScore,
                    },
                    tests: {
                        passed: testsPassed,
                        failed: parsed.numFailedTests,
                        total: testsTotal,
                        results,
                    },
                    leaderboard: { rank, previousBest },
                    executionTimeMs,
                },
            };
        } catch (error) {
            if (submissionId) {
                await this.repo.setSubmissionStatus(submissionId, "FAILED").catch(() => {});
            }
            logger.error("Submission failed unexpectedly", {
                userId, contestId, challengeId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        } finally {
            await redis.del(lockKey);
        }
    }

    private tryParseJest(stdout: string | undefined): JestJsonOutput | null {
        if (!stdout) return null;
        try {
            return JSON.parse(stdout) as JestJsonOutput;
        } catch {
            return null;
        }
    }

    private toResultViews(parsed: JestJsonOutput): TestResultView[] {
        
        return parsed.testResults.flatMap((suite) =>
            suite.testResults.map((t) => ({
                name: t.fullName,
                status: t.status,
                duration_ms: Math.round(t.duration ?? 0),
                error: t.failureMessages?.[0] ?? null,
            }))
        );
    }

    private failedBody(
        submissionId: string,
        maxPoints: number,
        executionTimeMs: number,
        error: string
    ): SubmitResponse {
        return {
            submissionId,
            status: "FAILED",
            score: { total: 0, max: maxPoints, percentage: 0, tests: 0, static: 0 },
            tests: { passed: 0, failed: 0, total: 0, results: [] },
            leaderboard: { rank: null, previousBest: null },
            executionTimeMs,
            error,
        };
    }
}
