import { AppsV1Api, CoreV1Api, KubeConfig, NetworkingV1Api, type V1Deployment, type V1Ingress, type V1Service } from "@kubernetes/client-node";
import fs from "fs";
import path from "path";
import yaml from "yaml";

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

    constructor(private readonly namespace: string = "default") { }

    parseManifests(filePath: string, workDir: string): KubeManifest[] {
        const raw = fs.readFileSync(filePath, "utf8");

        return yaml.parseAllDocuments(raw).map((doc) => {
            const replaced = doc.toString().replace(/service-name/g, `${workDir}-service`);
            return yaml.parse(replaced) as KubeManifest;
        });
    }

    async create(workDir: string): Promise<void> {
        const manifests = this.parseManifests(
            path.join(__dirname, "../../../../kube_service.yaml"),
            workDir
        );

        for (const manifest of manifests) {
            await this.applyManifest(manifest);
        }
    }

    async applyManifest(manifest: KubeManifest): Promise<void> {
        const { kind } = manifest;

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
                console.warn(`Unsupported manifest kind: ${kind}`);
        }
    }

}