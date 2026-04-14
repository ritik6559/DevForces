import { Router } from "express"
import { container } from "tsyringe";
import { LeaderBoardController } from "../controller/leaderboard.controller";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

const leaderboardController = container.resolve(LeaderBoardController);

/**
 * @route GET /contests/:contestId/leaderboard/?count=10
 * @desc Get top players for a contest leaderboard, with optional count query parameter (default 10, max 100)
 * @access Protected
 * 
 */
router.get("/", AuthMiddleware.authenticateToken, leaderboardController.getTopPlayers);

/**
 * @route GET /contests/"contestId/leaderboard/me"
 * @desc Get the current user standing in a particular contest
 * @access Protected
 */
router.get("/me", AuthMiddleware.authenticateToken, leaderboardController.getUserStanding);

export default router;