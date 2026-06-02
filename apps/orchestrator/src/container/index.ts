import { container } from "tsyringe";
import { KubeService } from "../modules/k8s/service/kube.service";
import { KubeController } from "../modules/k8s/controller/kube.controller";
import { JudgeService } from "../modules/judge/service/judge.service";
import { JudgeController } from "../modules/judge/controller/judge.controller";
import { InactivityWatcher } from "../modules/cleanup/inactivity.watcher";

export class DIContainer {
    static setup(): void {
        container.registerSingleton("IKubeService", KubeService);
        container.registerSingleton(KubeController);

        container.registerSingleton("IJudgeService", JudgeService);
        container.registerSingleton(JudgeController);

        container.registerSingleton(InactivityWatcher);
    }
}