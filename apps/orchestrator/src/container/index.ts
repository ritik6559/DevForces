import { container } from "tsyringe";
import { KubeService } from "../modules/k8s/service/kube.service";
import { KubeController } from "../modules/k8s/controller/kube.controller";

export class DIContainer {
    static setup(): void {
        container.registerSingleton("IKubeService", KubeService);
        container.registerSingleton("KubeController", KubeController);
    }
}