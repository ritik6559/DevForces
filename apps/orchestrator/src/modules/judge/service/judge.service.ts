import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import type { IKubeService } from "../../k8s/service/kube.service";

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

export interface IJudgeService {
    judge(req: JudgeRequest): Promise<JudgeResult>;
}

/**
 * Runs the challenge's Jest suite inside the user's existing workspace Pod.
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

        await this.kubeService.execInPod(
            podName,
            ["/bin/sh", "-c", `cat > ${workspacePath}/tests.js`],
            testsCode,
        );

        // 2. Ensure jest is available, then run it with machine-readable output.
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
