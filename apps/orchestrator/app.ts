import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import { container } from "tsyringe";
import { logger } from "logger";
import kubeRouter from "./src/modules/k8s/route/kube.route";
import judgeRouter from "./src/modules/judge/route/judge.route";
import activityRouter from "./src/modules/activity/route/activity.route";
import { InactivityWatcher } from "./src/modules/cleanup/inactivity.watcher";
import { closeRedis } from "./src/libs/redis";
import { ErrorHandler, requestLogger } from "error-handler";

export class Application {

    private app: express.Application;

    constructor() {

        this.app = express();
        this.setUpMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setUpMiddleware(): void {
        this.app.use(express.json());
        this.app.use(

            cors({
                origin: "http://localhost:5173",
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })

        );
        this.app.use(cookieParser());
        this.app.use(requestLogger);
    }

    private setupRoutes(): void {

        this.app.get('/orchestrator/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        this.app.use("/api/k8s", kubeRouter);
        this.app.use("/api/judge", judgeRouter);
        this.app.use("/api", activityRouter);

    }

    private setupErrorHandling(): void {

        this.app.use((req, res) => {
            res.status(404).json({
                status: 'error',
                message: 'Route not found'
            });
        });

        this.app.use(ErrorHandler.handle);
    }

    start(port: number = 8002): void {

        const server = this.app.listen(port, () => {
            logger.info(`Orchestrator app is running on PORT: ${port}`);
        });

        // Start the background workspace reaper once the server is up.
        const watcher = container.resolve(InactivityWatcher);
        watcher.start();

        for (const signal of ["SIGTERM", "SIGINT"] as const) {
            process.on(signal, () => {
                logger.info(`${signal} received — shutting down orchestrator`);
                watcher.stop();
                server.close(() => {
                    void closeRedis().finally(() => process.exit(0));
                });
            });
        }
    }
}