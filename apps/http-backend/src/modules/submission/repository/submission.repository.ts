import { prismaClient } from "store/client";

export interface ChallengeMapping {
    id: string;
    contest_id: string;
    challenge_id: string;
    index: number;
}

export interface TestDetail {
    name: string;
    passed: boolean;
    duration_ms: number;
    error: string | null;
}

export interface EvaluationInput {
    submissionId: string;
    totalScore: number;
    testsScore: number;
    staticScore: number;
    testsPassed: number;
    testsTotal: number;
    executionTimeMs: number;
    testDetails: TestDetail[];
}

export interface ISubmissionRepository {
    getContest(contestId: string): Promise<{ status: string } | null>;
    getChallengeMaxPoints(challengeId: string): Promise<number | null>;
    resolveMapping(contestId: string, challengeId: string): Promise<ChallengeMapping | null>;
    createSubmission(userId: string, challengeId: string, mappingId: string | null): Promise<string>;
    setSubmissionStatus(submissionId: string, status: "RUNNING" | "COMPLETED" | "FAILED", s3Prefix?: string): Promise<void>;
    markProgressSubmitted(userId: string, challengeId: string, contestId: string): Promise<void>;
    upsertEvaluationResult(input: EvaluationInput): Promise<void>;
    getPreviousBest(contestId: string, userId: string): Promise<number | null>;
    getRank(contestId: string, totalScore: number): Promise<number>;
}

export class SubmissionRepository implements ISubmissionRepository {

    async getContest(contestId: string): Promise<{ status: string } | null> {
        return prismaClient.contest.findUnique({
            where: { contest_id: contestId },
            select: { status: true },
        });
    }

    async getChallengeMaxPoints(challengeId: string): Promise<number | null> {
        const challenge = await prismaClient.challenge.findUnique({
            where: { challenge_id: challengeId },
            select: { max_points: true },
        });
        return challenge?.max_points ?? null;
    }

    async resolveMapping(contestId: string, challengeId: string): Promise<ChallengeMapping | null> {
        return prismaClient.contestToChallengeMapping.findUnique({
            where: {
                contest_id_challenge_id: { contest_id: contestId, challenge_id: challengeId },
            },
        });
    }

    async createSubmission(userId: string, challengeId: string, mappingId: string | null): Promise<string> {
        const submission = await prismaClient.submission.create({
            data: {
                user_id: userId,
                challenge_id: challengeId,
                status: "PENDING",
                contest_to_challenge_mapping_id: mappingId,
            },
            select: { submission_id: true },
        });
        return submission.submission_id;
    }

    async setSubmissionStatus(
        submissionId: string,
        status: "RUNNING" | "COMPLETED" | "FAILED",
        s3Prefix?: string
    ): Promise<void> {
        await prismaClient.submission.update({
            where: { submission_id: submissionId },
            data: {
                status,
                ...(s3Prefix ? { submission_s3_prefix: s3Prefix } : {}),
            },
        });
    }

    async markProgressSubmitted(userId: string, challengeId: string, contestId: string): Promise<void> {
        await prismaClient.userChallengeProgress.upsert({
            where: {
                user_id_challenge_id_contest_id: {
                    user_id: userId,
                    challenge_id: challengeId,
                    contest_id: contestId,
                },
            },
            update: { status: "SUBMITTED" },
            create: {
                user_id: userId,
                challenge_id: challengeId,
                contest_id: contestId,
                status: "SUBMITTED",
            },
        });
    }

    async upsertEvaluationResult(input: EvaluationInput): Promise<void> {
        const common = {
            total_score: input.totalScore,
            tests_score: input.testsScore,
            static_score: input.staticScore,
            tests_passed: input.testsPassed,
            tests_total: input.testsTotal,
            execution_time_ms: input.executionTimeMs,
            test_details: input.testDetails as unknown as object,
        };

        await prismaClient.evaluationResult.upsert({
            where: { submission_id: input.submissionId },
            create: { submission_id: input.submissionId, ...common, llm_feedback: null },
            update: common,
        });
    }

    async getPreviousBest(contestId: string, userId: string): Promise<number | null> {
        const lb = await prismaClient.leaderBoard.findUnique({
            where: { contest_id_user_id: { contest_id: contestId, user_id: userId } },
            select: { total_score: true },
        });
        return lb?.total_score ?? null;
    }

    async getRank(contestId: string, totalScore: number): Promise<number> {
        const higher = await prismaClient.leaderBoard.count({
            where: { contest_id: contestId, total_score: { gt: totalScore } },
        });
        return higher + 1;
    }
}
