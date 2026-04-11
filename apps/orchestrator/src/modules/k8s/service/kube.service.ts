import { AppsV1Api, CoreV1Api, KubeConfig, NetworkingV1Api, type V1Deployment, type V1Ingress, type V1Service } from "@kubernetes/client-node";
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

export interface IKubeService {
    parseManifests(filePath: string, workDir: string): KubeManifest[];
    create(workDir: string): Promise<void>;
    applyManifest(manifest: KubeManifest): Promise<void>;
};

/**
 * KubeService is responsible for managing Kubernetes resources for each workspace.
 */
export class KubeService implements IKubeService {

    constructor(private readonly namespace: string = "default") {
        logger.debug("KubeService initialized", { namespace });
    }

    /**
     * Parses Kubernetes manifest templates and replaces placeholders
     * @param filePath File Path of the Kubernetes manifest template
     * @param workDir Workspace Directory
     * @returns List of Kubernetes manifests with placeholders replaced
     */
    parseManifests(filePath: string, workDir: string): KubeManifest[] {
        logger.debug("Parsing Kubernetes manifests", { filePath, workDir });

        const raw = fs.readFileSync(filePath, "utf8");
        const manifests = yaml.parseAllDocuments(raw).map((doc) => {
            const replaced = doc.toString().replace(/service-name/g, `${workDir}-service`);
            return yaml.parse(replaced) as KubeManifest;
        });

        logger.info("Parsed Kubernetes manifests", {
            filePath,
            workDir,
            manifestCount: manifests.length,
            kinds: manifests.map((m) => m.kind),
        });

        return manifests;
    }

    /**
     * Creates Kubernetes resources based on the provided workspace directory.
     * @param workDir Workspace Directory
     */
    async create(workDir: string): Promise<void> {
        logger.info("Creating Kubernetes resources", { workDir, namespace: this.namespace });

        const manifests = this.parseManifests(
            path.join(__dirname, "../../../../kube_service.yaml"),
            workDir
        );

        for (const manifest of manifests) {
            await this.applyManifest(manifest);
        }

        logger.info("All Kubernetes resources created successfully", {
            workDir,
            namespace: this.namespace,
            manifestCount: manifests.length,
        });
    }

    /**
     * Apply a Kubernetes manifest to the cluster
     * @param manifest Kubernetes manifest to apply
     */
    async applyManifest(manifest: KubeManifest): Promise<void> {
        const { kind } = manifest;
        const name = (manifest.metadata?.name ?? "unknown");

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
                    logger.warn(`Unsupported manifest kind: ${kind}`, { kind, name, namespace: this.namespace });
                    return;
            }

            logger.info("Kubernetes manifest applied successfully", { kind, name, namespace: this.namespace });
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