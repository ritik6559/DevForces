import { Router } from "express";
import { container } from "tsyringe";
import { KubeController } from "../controller/kube.controller";

const router = Router();

const kubeController = container.resolve(KubeController);

/**
 * @route POST /api/k8s/start
 * @desc Start Kubernetes resources for a given workDir
 * @body { userId: string, workDir: string }
 * @access PROTECTED
 * @returns { message: string }
 */
router.post("/start", kubeController.start);

export default router;