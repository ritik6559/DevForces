import { ORCHESTRATOR_URL, INTERNAL_API_KEY } from "../../../utils/config";

export interface JudgeRequest {
    contestId: string;
    challengeId: string;
    userId: string;
    testsCode: string;
}

export interface JudgeResult {
    workspaceRunning: boolean;
    stdout?: string;
    stderr?: string;
}

/**
 * Calls the orchestrator's internal judge endpoint to run the test suite inside
 * the user's workspace pod.
 */
export async function runJudge(payload: JudgeRequest): Promise<JudgeResult> {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/judge`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-internal-key": INTERNAL_API_KEY,
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Judge request failed with status ${res.status}`);
    }

    const json = (await res.json()) as { data: JudgeResult };
    return json.data;
}
