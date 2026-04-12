import express from "express";
import { createServer } from "http";
import cors from "cors";

import { WebSocketService } from "./src/modules/web-socket";
import { container } from "tsyringe";

export class Application {

    private app: express.Application;
    private webSocketService: WebSocketService;

    constructor() {

        this.webSocketService = container.resolve(WebSocketService);
        this.app = express();
        this.setupMiddleware();

    }

    setupMiddleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use(

            cors({
                origin: "http://localhost:5173",
                credentials: true,
                methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
                allowedHeaders: ["Content-Type", "Authorization"],
            })

        );
    }

    getApp(): express.Application {
        return this.app;
    }

    start(port: number = 8001): void {

        const server = createServer(this.app);

        this.webSocketService.init(server);

        server.listen(port, () => {
            console.log(`Runner service is running on port ${port}`);
        });

    }


}