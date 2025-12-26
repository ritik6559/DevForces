import { container } from "tsyringe";
import { AuthRespository } from "../modules/auth/repository/auth.repository";
import { AuthService } from "../modules/auth/service/auth.service";
import { AuthController } from "../modules/auth/controller/auth.controller";
import { JWTRepository } from "../modules/auth/repository/jwt.repository";
import { JWTService } from "../modules/auth/service/jwt.service";
import { OTPService } from "../modules/auth/service/otp.service";
import { ContestRepository } from "../modules/contest/repository/contest.repository";
import { ContestService } from "../modules/contest/service/contest.service";
import { ContestController } from "../modules/contest/controller/contest.controller";

export class DIContainer {
    static setup(): void {
        // AUTH
        container.registerSingleton(AuthRespository);
        container.registerSingleton(AuthService);
        container.registerSingleton(AuthController);

        // JWT
        container.registerSingleton(JWTRepository);
        container.registerSingleton(JWTService);
        
        // OTP
        container.registerSingleton(OTPService);

        // CONTEST
        container.registerSingleton(ContestRepository);
        container.registerSingleton(ContestService);
        container.registerSingleton(ContestController);
    }
}