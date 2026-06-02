import { Router } from "express";
import type { Request, Response } from "express";

import { ErrorHandler } from "error-handler";
import { AuthUtils } from "../../../middleware/auth.middleware";
import { activityMiddleware } from "../../../middleware/activity.middleware";
import { ACTIVITY_TTL_SECONDS } from "../../../libs/redis-keys";

const router = Router();

/**
 * @route POST /api/contests/:contestId/challenges/:challengeId/heartbeat
 * @desc Keep-alive ping for an open workspace. `activityMiddleware` refreshes the
 *       activity TTL; this handler just confirms the workspace is kept alive.
 *       The frontend should ping this on an interval while the IDE is open
 *       (covers the case where the user is reading a problem without editing).
 * @access Protected
 */
router.post(
  "/contests/:contestId/challenges/:challengeId/heartbeat",
  AuthUtils.authenticateToken,
  activityMiddleware,
  ErrorHandler.asyncHandler(async (_req: Request, res: Response) => {
    res
      .status(200)
      .json({ alive: true, expiresInSeconds: ACTIVITY_TTL_SECONDS });
  }),
);

export default router;
