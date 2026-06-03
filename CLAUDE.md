# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DevForces is a competitive programming platform where users join contests, solve coding challenges in a browser-based IDE, and submit solutions for evaluation. Code execution happens in ephemeral Kubernetes pods provisioned on demand.

## Commands

All commands use **Bun** as the package manager and runtime. TurboRepo orchestrates cross-workspace tasks.

```bash
# Root-level (all workspaces)
bun run dev            # Start all services in watch mode
bun run build          # Build all apps and packages
bun run lint           # ESLint across all workspaces
bun run format         # Prettier (.ts, .tsx, .md)
bun run check-types    # TypeScript type-check all workspaces

# Individual services (run from app directory)
bun run dev            # Start with hot reload
bun start              # Production start

# Database (from packages/store)
bunx prisma migrate dev     # Apply migrations
bunx prisma generate        # Regenerate Prisma client
bunx prisma studio          # Open DB browser UI
```

No test suite is configured in the codebase.

## Architecture

### Monorepo Structure

```
apps/
  web/            React 19 SPA (Vite, TailwindCSS 4, Monaco Editor, XTerm)
  http-backend/   Express 5 REST API — auth, contests, challenges, leaderboard
  runner/         WebSocket service — PTY/terminal streaming to browser
  orchestrator/   Kubernetes pod provisioner — talks to K8s API

packages/
  store/          Prisma client (PostgreSQL)
  common-types/   Shared Zod schemas and TypeScript interfaces
  auth-utils/     JWT + OTP helpers
  s3/             AWS S3 client wrapper
  logger/         Winston logger
  error-handler/  Express error middleware
  ui/             Shared React components (Radix UI / Shadcn)
```

### Request Flow

1. **User joins a contest** → `http-backend` validates and calls `orchestrator`
2. **Orchestrator** provisions a Kubernetes pod via K8s API using `kube_service.yaml` template
3. **Init container** in the pod pulls contest files from S3 using AWS CLI
4. **Runner container** starts (`ritik6559/devforces-runner:v2.6`) exposing ports 8000 (IDE) and 8001 (WebSocket). Image bundles Bun (service) + Node/npx + global jest, supertest & express (judge), with `NODE_PATH` set so they resolve from the workspace
5. **Browser** connects to runner's WebSocket; Monaco Editor + XTerm render the IDE
6. **Code execution** streams terminal output back via PTY
7. **Leaderboard** updates propagate through Redis Pub/Sub to all contest participants

### Key Design Patterns

- **Dependency Injection** — Tsyringe IoC container used in backend services
- **Repository + Service Layer** — data access separated from business logic
- **Redis Pub/Sub** — real-time leaderboard broadcast (ioredis)
- **Multi-stage Docker** — `Dockerfile.runner` prunes → installs → runtime (includes Python, Make, G++)
- **Kubernetes Init Containers** — workspace setup before runner starts

### Database (PostgreSQL via Prisma)

Core models: `User`, `Contest`, `Challenge`, `ContestToChallengeMapping`, `UserChallengeProgress`, `Submission`, `EvaluationResult`, `LeaderBoard`, `RefreshToken`

Enums: `Role` (ADMIN/USER), `ContestStatus`, `ChallengeStatus`, `SubmissionStatus`, `TechStack` (NODEJS/PYTHON), `ChallengeDifficulty`

### Authentication

OTP-based flow (email via Nodemailer SMTP) → JWT access + refresh tokens. Refresh tokens are stored in DB with rotation and revocation. A cron job cleans up expired tokens.

### Infrastructure

- **AWS EKS** — `devforces-cluster` in `ap-south-1`, 3× t3.medium nodes, K8s v1.31
- **Kubernetes service naming** — generated dynamically per user/contest in the orchestrator
- **Ingress** — Nginx ingress controller with LoadBalancer service

## Environment Variables

Per-service `.env.example` templates live at `apps/<service>/.env.example`. Copy each to `.env`.

```env
# Auth (http-backend; ACCESS_TOKEN_SECRET also needed by orchestrator + runner)
ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, OTP_SALT

# Email/OTP (http-backend)
SMTP_HOST, SMTP_PORT, SMTP_SERVICE, SMTP_USER, SMTP_PASS

# Infrastructure
DATABASE_URL, REDIS_URL, AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME

# Service-to-service (submission/judge + inactivity cleanup)
ORCHESTRATOR_URL    # http-backend → orchestrator base URL (default http://localhost:8002)
INTERNAL_API_KEY    # shared secret guarding orchestrator POST /api/judge — must match on
                    # http-backend AND orchestrator (empty = unauthenticated, dev only)
REDIS_URL           # MUST be the same Redis for http-backend + orchestrator (>= 6.2 for ZADD GT);
                    # the orchestrator watcher reads the activity:* / submitting:* keys

# Runner (in-pod; usually injected by kube_service.yaml)
WORKSPACE_ROOT, CLIENT_URL, RUNNER_WS_AUTH
```

## Development Ports

| Service      | Port |
|--------------|------|
| Web (Vite)   | 5173 |
| http-backend | 8000 |
| runner       | 8001 |
| orchestrator | 8002 |
