import { Router } from "express";
import { container } from "tsyringe";
import { KubeController } from "../controller/kube.controller";
import { AuthUtils } from "../../../middleware/auth.middleware";

const router = Router();

const kubeController = container.resolve(KubeController);

/**
 * @route POST /api/k8s/start
 * @desc Start Kubernetes resources for a given workDir
 * @access PROTECTED
 * @body { contestId: string, challengeId: string, userId: string }
 */
router.post("/start", AuthUtils.authenticateToken, kubeController.start);

export default router;