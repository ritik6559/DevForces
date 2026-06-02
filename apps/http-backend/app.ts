import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from "./src/modules/auth/route/auth.route";
import contestRoutes from "./src/modules/contest/route/contest.route";
import challengeRoutes from "./src/modules/challenge/route/challenge.route";
import leaderboardRoutes from "./src/modules/leaderboard/route/leaderboard.route";
import submissionRoutes from "./src/modules/submission/route/submission.route";
import type { Server } from 'http';
import { ErrorHandler, requestLogger } from 'error-handler';
import { startTokenCleanupJob } from './src/modules/auth/cron/token-cleanup';
import { container } from 'tsyringe';
import { LeaderBoardSubscriber } from './src/modules/leaderboard/pub-sub/leaderboard.subscriber';
import { closeRedis } from './src/libs/redis';
import { prismaClient } from 'store/client';
import { logger } from 'logger';

export class Application {
  private app: express.Application;
  private server?: Server;
  private leaderboardSubscriber?: LeaderBoardSubscriber;
  private shuttingDown = false;

  constructor() {

    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
    this.setupCronJobs();
  }

  private async initializeServices(): Promise<void> {
    this.leaderboardSubscriber = container.resolve(LeaderBoardSubscriber);
    await this.leaderboardSubscriber.subscribe();

    logger.info("Leaderboard subscriber bootstrapped");

    for (const signal of ["SIGTERM", "SIGINT"] as const) {
      process.on(signal, () => {
        logger.info(`${signal} received — shutting down gracefully`);
        void this.shutdown();
      });
    }
  }

  /**
   * Closes resources in dependency order: stop accepting requests, stop the
   * subscriber, then disconnect Redis and Prisma. Idempotent.
   */
  private async shutdown(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    try {
      await new Promise<void>((resolve) => {
        if (!this.server) return resolve();
        this.server.close(() => resolve());
      });

      await this.leaderboardSubscriber?.unsubscribe();
      await closeRedis();
      await prismaClient.$disconnect();

      logger.info("Graceful shutdown complete");
      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      process.exit(1);
    }
  }
  
  private setupMiddleware(): void {
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(requestLogger);

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
    this.app.use('/api/leaderboard', leaderboardRoutes);
    this.app.use('/api/submit', submissionRoutes);
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

  async start(port: number = 8000): Promise<void> {

    await this.initializeServices();

    this.server = this.app.listen(port, () => {
      logger.info(`http-backend app running on port ${port}`);
    });

  }
}