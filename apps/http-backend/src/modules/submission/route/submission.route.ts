import { Router } from "express";
import { container } from "tsyringe";
import { SubmissionController } from "../controller/submission.controller";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();
const submissionController = container.resolve(SubmissionController);

/**
 * @route POST /api/submit
 * @desc Snapshot the user's workspace, run the challenge tests in their pod,
 *       score the result, and publish to the leaderboard.
 * @access Protected
 * @body { contestId: string, challengeId: string }
 */
router.post("/", AuthMiddleware.authenticateToken, submissionController.submit);

export default router;
