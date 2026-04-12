import express from "express";

import kubeRouter from "./src/modules/k8s/route/kube.route";
import { ErrorHandler } from "error-handler";

export class Application {

    private app: express.Application;

    constructor() {

        this.app = express();

        this.setupRoutes();
        this.setUpMiddleware();
        this.setupErrorHandling();
    }

    private setUpMiddleware(): void {
        this.app.use(express.json());
        this.app.use()
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