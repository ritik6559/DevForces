import { Router } from "express";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";
import { container } from "tsyringe";
import { ChallengeController } from "../controller/challenge.controller";

const challengeController = container.resolve(ChallengeController);

const router = Router();

/**
 * @route GET /api/challenge/
 * @desc Get all the challeneges
 * @access Private (ADMIN)
 */
router.get("/", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challengeController.getAllChallenges);

/**
 * @route GET /api/challenge/:id
 * @desc Get challenge by id
 * @access Private
 */
router.get("/:id", AuthMiddleware.authenticateToken, challengeController.getChallengeById);

/**
 * @route GET /api/challenge/contest/:contestId
 * @desc Get all challenges for a contest
 * @access Private
 */
router.get("/contest/:contestId", AuthMiddleware.authenticateToken, challengeController.getChallengesByContestId);

/**
 * @route POST /api/challenge/
 * @desc Create a new challenge
 * @access Private (ADMIN)
 * @body { title: string, description: string, difficulty: string, notion_doc_id: string, max_point: int }
 */
router.post("/", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challengeController.createChallenge);

/**
 * @route PATCH /api/challenge/:id
 * @desc Update an existing challenge
 * @access Private (ADMIN)
 * @body { title?: string, description?: string, difficulty?: string, notion_doc_id?: string, max_point?: int }
 */
router.patch("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challengeController.updateChallenge);

/**
 * @route DELETE /api/challenge/:id
 * @desc Delete an existing challenge
 * @access Private (ADMIN)
 */
router.delete("/:id", AuthMiddleware.authenticateToken, AuthMiddleware.authorizeRole("ADMIN"), challengeController.deleteChallenge);

/**
 * @route GET /api/challenge/:contestId/:challengeId/
 * @desc Fetches current user code file from S3
 * @access Protected (USER)
 */
router.get("/:contestId/:challengeId/", AuthMiddleware.authenticateToken, challengeController.getUserChallengeCode);
export default router;