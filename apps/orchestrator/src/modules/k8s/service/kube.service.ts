import { AppsV1Api, CoreV1Api, KubeConfig, NetworkingV1Api, type V1Deployment, type V1Ingress, type V1Service } from "@kubernetes/client-node";

type KubeManifest = V1Deployment | V1Service | V1Ingress;

const kubeconfig = new KubeConfig();
kubeconfig.loadFromDefault();

const coreV1Api = kubeconfig.makeApiClient(CoreV1Api);
const appsV1Api = kubeconfig.makeApiClient(AppsV1Api);
const networkingApi = kubeconfig.makeApiClient(NetworkingV1Api);

export interface IKubeService {
    parseManifests(filePath: string, workDir: string): KubeManifest[];
    create(workDir: string): Promise<void>;
    delete(workDir: string): Promise<void>;
    applyManifest(manifest: KubeManifest): Promise<void>;
};

export class KubeService implements IKubeService {

    constructor( private readonly namespace: string = "default" ) {}

    parseManifests(filePath: string, workDir: string): KubeManifest[] {
        throw new Error("Method not implemented.");
    }

    
    create(workDir: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    delete(workDir: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
    applyManifest(manifest: KubeManifest): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}