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
import { ChallengeRespository } from "../modules/challenge/repository/challenge.repository";
import { ChallengeService } from "../modules/challenge/service/challenge.service";
import { ChallengeController } from "../modules/challenge/controller/challenge.controller";
import { LeaderBoardRepository } from "../modules/leaderboard/repository/leaderboard.repository";
import { LeaderBoardService } from "../modules/leaderboard/service/leaderboard.service";
import { LeaderBoardController } from "../modules/leaderboard/controller/leaderboard.controller";
import { LeaderBoardPublisher } from "../modules/leaderboard/pub-sub/leaderboard.publisher";
import { LeaderBoardSubscriber } from "../modules/leaderboard/pub-sub/leaderboard.subscriber";

export class DIContainer {
    static setup(): void {

        console.log("Setting up Dependency Injection Container...");

        // AUTH
        container.registerSingleton("IAuthRespository", AuthRespository);
        container.registerSingleton("IAuthService", AuthService);
        container.registerSingleton("IAuthController", AuthController);

        // JWT
        container.registerSingleton("IJWTRepository", JWTRepository);
        container.registerSingleton("IJWTService", JWTService);

        // OTP
        container.registerSingleton("IOTPService", OTPService);

        // CONTEST
        container.registerSingleton("IContestRepository", ContestRepository);
        container.registerSingleton("IContestService", ContestService);
        container.registerSingleton("IContestController", ContestController);

        // CHALLENGE
        container.registerSingleton("IChallengeRepository", ChallengeRespository);
        container.registerSingleton("IChallengeService", ChallengeService);
        container.registerSingleton("IChallengeController", ChallengeController);

        // LEADERBOARD
        container.registerSingleton("ILeaderBoardRepository", LeaderBoardRepository);
        container.registerSingleton("ILeaderBoardService", LeaderBoardService);
        container.registerSingleton("ILeaderBoardController", LeaderBoardController);
        container.registerSingleton("ILeaderBoardSubscriber", LeaderBoardSubscriber);
        container.registerSingleton("ILeaderBoardPublisher", LeaderBoardPublisher);
    }
}