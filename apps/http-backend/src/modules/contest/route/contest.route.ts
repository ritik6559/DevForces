import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";
import { container } from "tsyringe";
import { ContestController } from "../controller/contest.controller";

const router = Router();
const contestController = container.resolve(ContestController);

/**
 * @route GET /api/contest
 * @desc Get all the contests
 * @access Private
 */
router.get("/", AuthMiddleware.authenticateToken, contestController.getAllContests);

/**
 * @route GET /api/contest/:contestId
 * @desc Get contest by id
 * @access Private
 */
router.get("/:contestId", AuthMiddleware.authenticateToken, contestController.getContestById);

/**
 * @route POST /api/auth
 * @desc Create a new contest
 * @access Private (ADMIN)
 * @body { title: string, description: string, start_time: Date }
 */
router.post("/", AuthMiddleware.authorizeRole("ADMIN"), contestController.createContest);

/**
 * @route PATCH /api/contest/:contestId
 * @desc Update an existing contest
 * @access Private (ADMIN)
 * @body { title?: string, description?: string, start_time?: Date }
 */
router.patch("/:contestId", AuthMiddleware.authorizeRole("ADMIN"), contestController.updateContest);

/**
 * @route DELETE /api/contest/:contestId
 * @desc Delete an existing contest
 * @access Private (ADMIN)
 */
router.delete("/:contestId", AuthMiddleware.authorizeRole("ADMIN"), contestController.deleteContest);

export default router;