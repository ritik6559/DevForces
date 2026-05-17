process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import {
    AppsV1Api,
    CoreV1Api,
    KubeConfig,
    NetworkingV1Api,
    type V1Deployment,
    type V1Ingress,
    type V1Service,
} from "@kubernetes/client-node";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { logger } from "logger";

type KubeManifest = V1Deployment | V1Service | V1Ingress;

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingV1Api = kubeconfig.makeApiClient(NetworkingV1Api);

export interface WorkspaceContext {
    contestId: string;
    challengeId: string;
    userId: string;
}

export interface IKubeService {
    parseManifests(filePath: string, context: WorkspaceContext): KubeManifest[];
    create(context: WorkspaceContext): Promise<void>;
    applyManifest(manifest: KubeManifest): Promise<void>;
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
}