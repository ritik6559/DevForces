import { container } from "tsyringe";
import { AuthRespository } from "../modules/auth/repository/auth.repository";
import { AuthService } from "../modules/auth/service/auth.service";
import { AuthController } from "../modules/auth/controller/auth.controller";

export class DIContainer {
    static setup(): void {
        container.registerSingleton(AuthRespository);
        container.registerSingleton(AuthService);
        container.registerSingleton(AuthController);
    }
}