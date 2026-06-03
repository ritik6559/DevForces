import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import type { IKubeService } from "../../k8s/service/kube.service";

export interface JudgeRequest {
    contestId: string;
    challengeId: string;
    userId: string;
    /** Raw contents of the challenge's tests.js, fetched from S3 by the caller. */
    testsCode: string;
}

export interface JudgeResult {
    /** false when the workspace pod is not running (expired) — caller maps to 404. */
    workspaceRunning: boolean;
    /** Raw stdout from `jest --json` (parsed by the caller). */
    stdout?: string;
    stderr?: string;
}

export interface IJudgeService {
    judge(req: JudgeRequest): Promise<JudgeResult>;
}

/**
 * Runs the challenge's Jest suite inside the user's existing workspace Pod.
 *
 * ## Assumptions
 * - The runner image (devforces-runner:v2.7+) bundles Node/npx and globally
 *   installs jest + supertest + express, with NODE_PATH set so they resolve
 *   from the workspace. See Dockerfile.runner.
 * - The project root is `/workspace/{contestId}/{challengeId}/{userId}`.
 * - Any app dependency beyond express must be present in the workspace.
 */
@injectable()
export class JudgeService implements IJudgeService {

    constructor(@inject("IKubeService") private kubeService: IKubeService) {}

    async judge(req: JudgeRequest): Promise<JudgeResult> {
        const { contestId, challengeId, userId, testsCode } = req;
        const context = { contestId, challengeId, userId };
        const workspacePath = `/workspace/${contestId}/${challengeId}/${userId}`;

        if (!(await this.kubeService.isWorkspaceRunning(context))) {
            logger.warn("Judge requested for non-running workspace", context);
            return { workspaceRunning: false };
        }

        const podName = await this.kubeService.getRunningPodName(context);
        if (!podName) {
            logger.warn("No running pod found for workspace", context);
            return { workspaceRunning: false };
        }

        // 1. Write tests.js into the workspace via stdin (no shell interpolation).
        await this.kubeService.execInPod(
            podName,
            ["/bin/sh", "-c", `cat > ${workspacePath}/tests.js`],
            testsCode,
        );

        // 2. Ensure jest is available, then run it with machine-readable output.
        //    --json emits results to stdout even when tests fail.
        //    stderr is NOT suppressed so fatal errors (missing binary, ESM config
        //    mismatch, etc.) are captured and surfaced in the submission error message.
        //
        //    The test file is named `tests.js`, which Jest's DEFAULT testMatch does
        //    not discover (it only matches *.test.js, *.spec.js, or __tests__/**).
        //    Passing `tests.js` positionally does not help — positional args are
        //    path regex *filters*, not file selectors — so jest reports "No tests
        //    found" and writes nothing to stdout. Override testMatch to find it by name.
        const runCmd =
            `cd ${workspacePath} && ` +
            `(npx --no-install jest --version >/dev/null 2>&1 || npm install --no-save jest supertest >/dev/null 2>&1); ` +
            `npx jest --testMatch "**/tests.js" --json --forceExit --testTimeout=10000`;

        const { stdout, stderr } = await this.kubeService.execInPod(
            podName,
            ["/bin/sh", "-c", runCmd],
        );

        logger.info("Judge run completed", { ...context, podName, stdoutLength: stdout.length, stderrLength: stderr.length });
        if (stderr) {
            logger.warn("Jest stderr", { ...context, podName, stderr });
        }

        return { workspaceRunning: true, stdout, stderr };
    }
}
