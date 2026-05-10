import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import kubeRouter from "./src/modules/k8s/route/kube.route";
import { ErrorHandler } from "error-handler";

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
    }

    private setupRoutes(): void {

        this.app.get('/orchestrator/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        this.app.use("/api/k8s", kubeRouter);

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

        this.app.listen(port, () => {
            console.log(`Orchestrator app is running on PORT: ${port}`);
        });

    }
}