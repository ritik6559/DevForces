/** Mirrors the http-backend SubmitResponse returned by POST /api/submit. */
export interface SubmitTestResult {
  name: string;
  status: "passed" | "failed" | "pending";
  duration_ms: number;
  error: string | null;
}

export interface SubmitResponse {
  submissionId: string;
  status: "COMPLETED" | "FAILED";
  score: {
    total: number;
    max: number;
    percentage: number;
    tests: number;
    static: number;
  };
  tests: {
    passed: number;
    failed: number;
    total: number;
    results: SubmitTestResult[];
  };
  leaderboard: {
    rank: number | null;
    previousBest: number | null;
  };
  executionTimeMs: number;
  error?: string;
}
