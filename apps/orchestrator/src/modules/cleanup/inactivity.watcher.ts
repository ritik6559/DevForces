import { inject, injectable } from "tsyringe";
import { logger } from "logger";
import { redis } from "../../libs/redis";
import { activityKey, submittingKey } from "../../libs/redis-keys";
import type { IKubeService } from "../k8s/service/kube.service";

const WATCH_INTERVAL_MS = 60_000;

/**
 * Periodically reaps workspace Deployments whose owner has gone idle.
 */
@injectable()
export class InactivityWatcher {

    private timer?: ReturnType<typeof setInterval>;

    constructor(@inject("IKubeService") private kubeService: IKubeService) {}

    start(): void {
        if (this.timer) {
            return;
        }
        logger.info("[inactivity-watcher] started", { intervalMs: WATCH_INTERVAL_MS });

        this.timer = setInterval(() => { void this.tick(); }, WATCH_INTERVAL_MS);
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = undefined;
    }

    private async tick(): Promise<void> {
        try {
            const deployments = await this.kubeService.listWorkspaceDeployments();

            for (const deployment of deployments) {
                try {
                    if (deployment.deleting || !deployment.context) {
                        continue;
                    }

                    const { contestId, challengeId, userId } = deployment.context;

                    if (await redis.exists(activityKey(userId, challengeId, contestId))) {
                        continue;
                    }

                    if (await redis.exists(submittingKey(userId, challengeId))) {
                        logger.info("[inactivity-watcher] skipping — submission in flight", {
                            name: deployment.name,
                        });
                        continue;
                    }

                    await this.kubeService.deleteWorkspace(deployment.context);
                    
                    logger.info("[inactivity-watcher] destroyed idle workspace", {
                        name: deployment.name, contestId, challengeId, userId,
                    });
                } catch (innerErr) {
                    logger.error("[inactivity-watcher] error processing deployment", {
                        name: deployment.name,
                        error: innerErr instanceof Error ? innerErr.message : String(innerErr),
                    });
                }
            }
        } catch (outerErr) {
            logger.error("[inactivity-watcher] cycle failed", {
                error: outerErr instanceof Error ? outerErr.message : String(outerErr),
            });
        }
    }
}
