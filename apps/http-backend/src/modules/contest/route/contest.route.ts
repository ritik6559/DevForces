import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";
import { container } from "tsyringe";
import { ContestController } from "../controller/contest.controller";

const router = Router();
const contestController = container.resolve(ContestController);

/**
 * @route GET /api/contest
 * @desc Get all the contests
 * @access Protected
 */
router.get("/", AuthMiddleware.authenticateToken, contestController.getAllContests);

/**
 * @route GET /api/contest/:contestId
 * @desc Get contest by id
 * @access Protected
 */
router.get("/:contestId", AuthMiddleware.authenticateToken, contestController.getContestById);

/**
 * @route POST /api/contest
 * @desc Create a new contest
 * @access Private (ADMIN)
 * @body { title: string, description: string, start_time: Date, end_time: Date, challenges?: Challenge[] }
 */
router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), contestController.createContest);

/**
 * @route POST /api/contest/:contestId/join
 * @desc Initialize users's workspace for a challenge in a contest (called when user clicks "Join" in the frontend)
 * @access Private (ADMIN)
 */
router.post("/:contestId/join", AuthMiddleware.authenticateToken, contestController.joinContest);

/**
 * @route DELETE /api/contest/:contestId/challenge/:challengeId
 * @desc Remove a challenge from a contest
 * @access Private (ADMIN)
 */
router.delete("/:contestId/challenge/:challengeId", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), contestController.deleteChallengeFromContest);

/**
 * @route PATCH /api/contest/:contestId
 * @desc Update an existing contest
 * @access Private (ADMIN)
 * @body { title?: string, description?: string, start_time?: Date, end_time?: Date }
 */
router.patch("/:contestId", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), contestController.updateContest);

/**
 * @route DELETE /api/contest/:contestId
 * @desc Delete an existing contest
 * @access Private (ADMIN)
 */
router.delete("/:contestId", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), contestController.deleteContest);

export default router;