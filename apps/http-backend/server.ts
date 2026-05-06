import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DIContainer } from "./src/container";
import { logger } from "logger"; 

DIContainer.setup();

(async () => {
  try {
    const { Application } = await import("./app");
    const app = new Application();

    const PORT = Number(process.env.PORT) || 8000;

    await app.start(PORT);

  } catch (error) {
    logger.error("Failed to start the application:", {
        error: error instanceof Error ? error.message : "Unknown error",
    });

    process.exit(1);
  }
})();