import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

/**
 * @route GET /api/contest
 * @desc Get all the contests
 * @access Private
 */
router.get("/", AuthMiddleware.authenticateToken, () => {});

/**
 * @route GET /api/contest/:contestId
 * @desc Get contest by id
 * @access Private
 */
router.get("/:contestId", AuthMiddleware.authenticateToken, () => {});

/**
 * @route POST /api/auth
 * @desc Create a new contest
 * @access Private (ADMIN)
 * @body { title: string, description: string, start_time: Date }
 */
router.post("/", AuthMiddleware.authorizeRole("ADMIN"), () => {});

/**
 * @route PATCH /api/contest/:contestId
 * @desc Update an existing contest
 * @access Private (ADMIN)
 * @body { title?: string, description?: string, start_time?: Date }
 */
router.patch("/:contestId", AuthMiddleware.authorizeRole("ADMIN"), () => {});

export default router;