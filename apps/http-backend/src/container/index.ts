import { container } from "tsyringe";
import { AuthRespository } from "../modules/auth/repository/auth.repository";
import { AuthService } from "../modules/auth/service/auth.service";
import { AuthController } from "../modules/auth/controller/auth.controller";
import { JWTRepository } from "../modules/auth/repository/jwt.repository";
import { JWTService } from "../modules/auth/service/jwt.service";
import { OTPService } from "../modules/auth/service/otp.service";

export class DIContainer {
    static setup(): void {
        container.registerSingleton(AuthRespository);
        container.registerSingleton(AuthService);
        container.registerSingleton(AuthController);
        container.registerSingleton(JWTRepository);
        container.registerSingleton(JWTService);
        container.registerSingleton(OTPService);

    }
}