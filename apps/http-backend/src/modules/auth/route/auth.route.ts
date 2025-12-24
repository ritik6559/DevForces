import { Router } from "express";
import { container } from "tsyringe";
import { AuthController } from "../controller/auth.controller";
import { AuthMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

const authController = container.resolve(AuthController);

router.post("/send-otp", authController.sendOtp);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.post("/logout-all", authController.logoutAll);
router.get("/me", AuthMiddleware.authenticateToken, authController.getCurrentUser);


export default router;