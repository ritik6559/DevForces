import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";
import { container } from "tsyringe";
import { ChallengeController } from "../controller/challenge.controller";

const challenegController = container.resolve(ChallengeController);

const router = Router();

/**
 * @route GET /api/challenge/
 * @desc Get all the challeneges
 * @acess Private (ADMIN)
 */
router.get("/", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challenegController.getAllChallenges);

/**
 * @route GET /api/challenge/:id
 * @desc Get challenge by id
 * @access Private
 */
router.get("/:id", AuthMiddleware.authenticateToken, challenegController.getChallengeById);

/**
 * @route POST /api/challenge/
 * @desc Create a new challenge
 * @access Private (ADMIN)
 * @body { title: string, description: string, difficulty: string, notion_doc_id: string, max_point: int }
 */
router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challenegController.createChallenge);

/**
 * @route PATCH /api/challenge/:id
 * @desc Update an existing challenge
 * @access Private (ADMIN)
 * @body { title?: string, description?: string, difficulty?: string, notion_doc_id?: string, max_point?: int }
 */
router.patch("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challenegController.updateChallenge);

/**
 * @route DELETE /api/challenge/:id
 * @desc Delete an existing challenge
 * @access Private (ADMIN)
 */
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challenegController.deleteChallenge);

export default router;