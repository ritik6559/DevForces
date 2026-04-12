import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from "./src/modules/auth/route/auth.route";
import contestRoutes from "./src/modules/contest/route/contest.route";
import challengeRoutes from "./src/modules/challenge/route/challenge.route";
import { ErrorHandler } from 'error-handler';
import { startTokenCleanupJob } from './src/modules/auth/cron/token-cleanup';

export class Application {
  private app: express.Application;

  constructor() {

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupCronJobs();
  }

  private setupMiddleware(): void {
    this.app.use(cookieParser());
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

  private setupRoutes(): void {

    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/contest', contestRoutes);
    this.app.use('/api/challenge', challengeRoutes);
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

  private setupCronJobs(): void {
    startTokenCleanupJob()
  }

  getApp(): express.Application {
    return this.app;
  }

  start(port: number = 8000): void {

    this.app.listen(port, () => {
      console.log(`http-backend app running on port ${port}`);
    });

  }
}