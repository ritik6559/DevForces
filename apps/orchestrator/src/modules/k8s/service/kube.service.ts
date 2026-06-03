process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
    AppsV1Api,
    CoreV1Api,
    Exec,
    KubeConfig,
    NetworkingV1Api,
    type V1Deployment,
    type V1Ingress,
    type V1Service,
} from "@kubernetes/client-node";
import { Readable, Writable } from "stream";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { logger } from "logger";

type KubeManifest = V1Deployment | V1Service | V1Ingress;

export interface ExecResult {
    stdout: string;
    stderr: string;
}

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);
const execClient = new Exec(kubeconfig);

const RUNNER_CONTAINER = "runner";

// Labels stamped on each workspace Deployment (see kube_service.yaml). The
// `app` label lets the inactivity watcher list workspaces; the `devforces/*`
// labels let it decode the owning context without parsing the resource name.
const WORKSPACE_LABEL = "devforces-workspace";
const LABEL_CONTEST_ID = "devforces/contest-id";
const LABEL_CHALLENGE_ID = "devforces/challenge-id";
const LABEL_USER_ID = "devforces/user-id";

export interface WorkspaceContext {
    contestId: string;
    challengeId: string;
    userId: string;
}

export interface WorkspaceDeployment {
    name: string;
    context: WorkspaceContext | null;
    deleting: boolean;
}

export interface IKubeService {
    parseManifests(filePath: string, context: WorkspaceContext): KubeManifest[];
    create(context: WorkspaceContext): Promise<void>;
    applyManifest(manifest: KubeManifest): Promise<void>;
    isWorkspaceRunning(context: WorkspaceContext): Promise<boolean>;
    getRunningPodName(context: WorkspaceContext): Promise<string | null>;
    execInPod(podName: string, command: string[], stdinData?: string): Promise<ExecResult>;
    listWorkspaceDeployments(): Promise<WorkspaceDeployment[]>;
    deleteWorkspace(context: WorkspaceContext): Promise<void>;
}

function short(id: string): string {
  return id.replace(/-/g, "").slice(0, 8);
}

/**
 * Generates a DNS-safe Kubernetes resource name from workspace context.
 * K8s names must be lowercase alphanumeric or '-', max 63 chars.
 * Format: c{contestId}-ch{challengeId}-u{userId}
 */
function buildServiceName(context: WorkspaceContext): string {
    return `c${short(context.contestId)}-ch${short(context.challengeId)}-u${short(context.userId)}`;
}

/**
 * KubeService is responsible for managing Kubernetes resources for each workspace.
 */
export class KubeService implements IKubeService {
    constructor(private readonly namespace: string = "default") {
        logger.debug("KubeService initialized", { namespace });
    }

    /**
     * Parses Kubernetes manifest templates and replaces all placeholders
     * with values derived from the workspace context.
     *
     * @param filePath  - Path to the YAML template file
     * @param context   - Contest / challenge / user identifiers
     * @returns Parsed list of Kubernetes manifests
     */
    parseManifests(filePath: string, context: WorkspaceContext): KubeManifest[] {
        const { contestId, challengeId, userId } = context;
        const serviceName = buildServiceName(context);

        logger.debug("Parsing Kubernetes manifests", { filePath, serviceName, contestId, challengeId, userId });

        const raw = fs.readFileSync(filePath, "utf8");

        const manifests = yaml.parseAllDocuments(raw).map((doc) => {
            const replaced = doc
                .toString()
                .replace(/__SERVICE_NAME__/g, serviceName)
                .replace(/__CONTEST_ID__/g, contestId)
                .replace(/__CHALLENGE_ID__/g, challengeId)
                .replace(/__USER_ID__/g, userId);

            return yaml.parse(replaced) as KubeManifest;
        });

        logger.info("Parsed Kubernetes manifests", {
            filePath,
            serviceName,
            manifestCount: manifests.length,
            kinds: manifests.map((m) => m.kind),
        });

        return manifests;
    }

    /**
     * Creates all Kubernetes resources (Deployment, Service, Ingress)
     * for the given workspace context.
     *
     * @param context - Contest / challenge / user identifiers
     */
    async create(context: WorkspaceContext): Promise<void> {
        const serviceName = buildServiceName(context);

        logger.info("Creating Kubernetes resources", {
            ...context,
            serviceName,
            namespace: this.namespace,
        });

        const manifests = this.parseManifests(
            path.join(__dirname, "../../../../kube_service.yaml"),
            context
        );

        for (const manifest of manifests) {
            await this.applyManifest(manifest);
        }

        logger.info("All Kubernetes resources created successfully", {
            ...context,
            serviceName,
            namespace: this.namespace,
            manifestCount: manifests.length,
        });
    }

    /**
     * Applies a single Kubernetes manifest to the cluster.
     *
     * @param manifest - The Kubernetes manifest to apply
     */
    async applyManifest(manifest: KubeManifest): Promise<void> {
        const { kind } = manifest;
        const name = manifest.metadata?.name ?? "unknown";

        logger.debug("Applying Kubernetes manifest", { kind, name, namespace: this.namespace });

        try {
            switch (kind) {
                case "Deployment":
                    await appsV1Api.createNamespacedDeployment({
                        namespace: this.namespace,
                        body: manifest as V1Deployment,
                    });
                    break;

                case "Service":
                    await coreV1Api.createNamespacedService({
                        namespace: this.namespace,
                        body: manifest as V1Service,
                    });
                    break;

                case "Ingress":
                    await networkingV1Api.createNamespacedIngress({
                        namespace: this.namespace,
                        body: manifest as V1Ingress,
                    });
                    break;

                default:
                    logger.warn(`Unsupported manifest kind: ${kind}`, {
                        kind,
                        name,
                        namespace: this.namespace,
                    });
                    return;
            }

            logger.info("Kubernetes manifest applied successfully", {
                kind,
                name,
                namespace: this.namespace,
            });
        } catch (error) {
            logger.error("Failed to apply Kubernetes manifest", {
                kind,
                name,
                namespace: this.namespace,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Reports whether the workspace Deployment has at least one available replica.
     */
    async isWorkspaceRunning(context: WorkspaceContext): Promise<boolean> {
        const name = buildServiceName(context);
        try {
            const deployment = await appsV1Api.readNamespacedDeployment({
                name,
                namespace: this.namespace,
            });
            return (deployment.status?.availableReplicas ?? 0) >= 1;
        } catch (error) {
            const status = (error as { code?: number; statusCode?: number })?.code
                ?? (error as { statusCode?: number })?.statusCode;
            if (status === 404) return false;
            throw error;
        }
    }

    /**
     * Finds the name of a Running Pod backing the workspace Deployment.
     *
     * @returns the Pod name, or null when no Running pod exists.
     */
    async getRunningPodName(context: WorkspaceContext): Promise<string | null> {
        const name = buildServiceName(context);
        const pods = await coreV1Api.listNamespacedPod({
            namespace: this.namespace,
            labelSelector: `app=${name}`,
        });

        const running = pods.items.find((p) => p.status?.phase === "Running");
        return running?.metadata?.name ?? null;
    }

    /**
     * Executes a command inside the runner container and collects stdout/stderr.
     *
     * ## Approach
     * Wraps client-node's WebSocket-based `Exec` in a promise. stdout/stderr are
     * accumulated via in-memory Writable streams; optional `stdinData` is piped
     * in via a Readable (used to write files with `cat >` without shell-escaping
     * the content). Resolves when the exec WebSocket closes.
     *
     * ## Why stdin streaming instead of shell interpolation?
     * Injecting file content by interpolating it into a shell command is unsafe
     * (quoting/escaping, command injection). Piping raw bytes over stdin avoids
     * the shell parsing the content entirely.
     *
     * ## Assumptions
     * - The container named `runner` exists and has `/bin/sh`.
     * - Output fits comfortably in memory (test result JSON is small).
     */
    async execInPod(podName: string, command: string[], stdinData?: string): Promise<ExecResult> {
        let stdout = "";
        let stderr = "";

        const stdoutStream = new Writable({
            write(chunk, _enc, cb) { stdout += chunk.toString(); cb(); },
        });
        const stderrStream = new Writable({
            write(chunk, _enc, cb) { stderr += chunk.toString(); cb(); },
        });
        const stdinStream = stdinData !== undefined ? Readable.from([stdinData]) : null;

        return new Promise<ExecResult>((resolve, reject) => {
            execClient
                .exec(
                    this.namespace,
                    podName,
                    RUNNER_CONTAINER,
                    command,
                    stdoutStream,
                    stderrStream,
                    stdinStream,
                    false,
                )
                .then((socket) => {
                    socket.on("close", () => resolve({ stdout, stderr }));
                    socket.on("error", (err) => reject(err));
                })
                .catch(reject);
        });
    }

    /**
     * Lists every workspace Deployment and decodes its owning context from the
     * `devforces/*` labels. Used by the inactivity watcher to map a Deployment
     * back to a user without parsing the generated resource name.
     */
    async listWorkspaceDeployments(): Promise<WorkspaceDeployment[]> {
        const res = await appsV1Api.listNamespacedDeployment({
            namespace: this.namespace,
            labelSelector: `app=${WORKSPACE_LABEL}`,
        });

        return res.items.map((deployment) => {
            const labels = deployment.metadata?.labels ?? {};
            const contestId = labels[LABEL_CONTEST_ID];
            const challengeId = labels[LABEL_CHALLENGE_ID];
            const userId = labels[LABEL_USER_ID];

            const context: WorkspaceContext | null =
                contestId && challengeId && userId
                    ? { contestId, challengeId, userId }
                    : null;

            return {
                name: deployment.metadata?.name ?? "",
                context,
                deleting: Boolean(deployment.metadata?.deletionTimestamp),
            };
        });
    }

    /**
     * Tears down a workspace's Deployment, Service, and Ingress.
     *
     * 404s are swallowed so a partially-deleted or already-gone workspace does
     * not abort cleanup; any other error propagates to the caller.
     */
    async deleteWorkspace(context: WorkspaceContext): Promise<void> {
        const name = buildServiceName(context);

        await this.deleteIgnoring404(
            () => appsV1Api.deleteNamespacedDeployment({ name, namespace: this.namespace }),
            "Deployment", name,
        );
        await this.deleteIgnoring404(
            () => coreV1Api.deleteNamespacedService({ name, namespace: this.namespace }),
            "Service", name,
        );
        await this.deleteIgnoring404(
            () => networkingV1Api.deleteNamespacedIngress({ name, namespace: this.namespace }),
            "Ingress", name,
        );
    }

    private async deleteIgnoring404(
        fn: () => Promise<unknown>,
        kind: string,
        name: string,
    ): Promise<void> {
        try {
            await fn();
            logger.info(`Deleted ${kind}`, { name, namespace: this.namespace });
        } catch (error) {
            const status = (error as { code?: number; statusCode?: number })?.code
                ?? (error as { statusCode?: number })?.statusCode;
            if (status === 404) return;
            throw error;
        }
    }
}