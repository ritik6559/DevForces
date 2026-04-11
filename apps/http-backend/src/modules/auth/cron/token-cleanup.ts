import cron from "node-cron";
import { container } from "tsyringe";
import { logger } from "logger";
import { JWTRepository } from "../repository/jwt.repository";

export const startTokenCleanupJob = () => {
  const jwtRepository = container.resolve(JWTRepository);

  // Runs every Sunday at 3 AM
  cron.schedule("0 3 * * 0", async () => {
    try {
      logger.info("Running weekly refresh token cleanup");

      await jwtRepository.deleteExpiredRefreshToken();

      logger.info("Expired refresh tokens deleted");
    } catch (error) {
      logger.error("Token cleanup job failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
};