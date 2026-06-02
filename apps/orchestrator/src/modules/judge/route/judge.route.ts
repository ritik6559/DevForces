import { Router } from "express";
import { container } from "tsyringe";
import { JudgeController } from "../controller/judge.controller";
import { internalKeyGuard } from "../../../middleware/internal-key.middleware";

const router = Router();
const judgeController = container.resolve(JudgeController);

/**
 * @route POST /api/judge
 * @desc Run the challenge test suite inside the user's workspace pod.
 * @access Internal (service-to-service, guarded by x-internal-key)
 * @body { contestId, challengeId, userId, testsCode }
 */
router.post("/", internalKeyGuard, judgeController.judge);

export default router;
