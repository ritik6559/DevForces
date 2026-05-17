import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { DIContainer } from "./src/container";
DIContainer.setup();

(async () => {
    const { Application } = await import("./app");
    const app = new Application();
    app.start(8001);
})();