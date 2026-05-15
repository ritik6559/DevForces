# DevForces ⚔️

<div align="center">

## Distributed Competitive Coding Platform

*A cloud-native coding contest platform inspired by LeetCode & Codeforces.*

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square\&logo=typescript\&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat-square\&logo=node.js\&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square\&logo=react\&logoColor=61DAFB)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square\&logo=redis\&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square\&logo=prisma\&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square\&logo=kubernetes\&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square\&logo=docker\&logoColor=white)

> Real-time coding contests, browser IDEs, Kubernetes-powered execution environments, OTP authentication, Redis-powered leaderboards, and scalable distributed architecture.

</div>

---

# ✨ Features

## 🧠 Competitive Coding Platform

* Real-time coding contests
* Browser-based cloud IDE
* Dynamic challenge system
* Contest administration
* Multi-tech stack support
* Interactive coding workspace

---

## ⚡ Real-Time Systems

* Redis Pub/Sub leaderboard engine
* Live contest ranking updates
* WebSocket-powered terminal streaming
* Event-driven architecture

---

## 🔐 Authentication & Security

* OTP-based authentication
* JWT access & refresh tokens
* Refresh token rotation
* Secure cookie handling
* Rate limiting
* Account lock protection
* Role-based authorization

---

## ☁️ Cloud Native Infrastructure

* Kubernetes orchestration
* Dynamic pod provisioning
* Isolated execution environments
* S3-backed workspace synchronization
* Distributed runner infrastructure

---

## 🏗️ Developer Experience

* TurboRepo monorepo architecture
* Shared internal packages
* Type-safe APIs
* Prisma ORM integration
* Reusable UI components
* Modular microservices

---

# 🏗️ System Architecture

```txt
                   ┌──────────────────────┐
                   │    React Frontend    │
                   └──────────┬───────────┘
                              │
                     REST / WebSockets
                              │
          ┌───────────────────┴───────────────────┐
          │                                       │
 ┌────────▼────────┐                  ┌──────────▼─────────┐
 │   HTTP Backend  │                  │      Runner        │
 │ Express + JWT   │                  │ Terminal Execution │
 └────────┬────────┘                  └──────────┬─────────┘
          │                                       │
          │ Redis Pub/Sub                         │
          ▼                                       ▼
 ┌─────────────────┐                  ┌────────────────────┐
 │ Leaderboard Sys │                  │ Kubernetes Pods    │
 │ Contest Engine  │                  │ Code Execution     │
 └─────────────────┘                  └────────────────────┘
```

---

# 📦 Monorepo Structure

```bash
DevForces/
│
├── apps/
│   ├── web/               # React frontend
│   ├── http-backend/      # Express backend API
│   ├── orchestrator/      # Kubernetes orchestration service
│   └── runner/            # Terminal & execution engine
│
├── packages/
│   ├── common-types/
│   ├── auth-utils/
│   ├── logger/
│   ├── store/
│   ├── s3/
│   └── ui/
│
├── k8s/
│   ├── cluster-config.yaml
│   └── ingress-controller.yaml
│
├── Dockerfile.runner
├── turbo.json
└── package.json
```

---

# 🚀 Tech Stack

| Layer          | Technologies                 |
| -------------- | ---------------------------- |
| Frontend       | React, TypeScript, Vite      |
| Backend        | Node.js, Express, TypeScript |
| Database       | PostgreSQL + Prisma          |
| Caching        | Redis                        |
| Authentication | JWT + OTP                    |
| Realtime       | WebSockets + Redis Pub/Sub   |
| Infrastructure | Docker + Kubernetes          |
| Monorepo       | TurboRepo                    |

---

# 🔐 Authentication Module

DevForces implements secure OTP-based authentication with JWT token rotation.

---

## Authentication Routes

### Send OTP

```http
POST /api/auth/send-otp
```

Request Body:

```json
{
  "email": "user@example.com",
  "username": "john"
}
```

---

### Login/Register

```http
POST /api/auth/login
```

Request Body:

```json
{
  "email": "user@example.com",
  "username": "john",
  "otp": "123456"
}
```

---

### Refresh Token

```http
POST /api/auth/refresh
```

---

### Logout

```http
POST /api/auth/logout
```

---

### Logout From All Devices

```http
POST /api/auth/logout-all
```

---

### Current User

```http
GET /api/auth/me
```

---

# 🧩 Challenge Module

Challenge APIs support secure CRUD operations for coding problems.

---

## Challenge Routes

### Get All Challenges

```http
GET /api/challenge
```

Access: `ADMIN`

---

### Get Challenge By ID

```http
GET /api/challenge/:id
```

---

### Get Challenges By Contest

```http
GET /api/challenge/contest/:contestId
```

---

### Create Challenge

```http
POST /api/challenge
```

Request Body:

```json
{
  "title": "Two Sum",
  "description": "Find two numbers...",
  "difficulty": "EASY",
  "notion_doc_id": "notion-doc-id",
  "max_points": 100
}
```

---

### Update Challenge

```http
PATCH /api/challenge/:id
```

---

### Delete Challenge

```http
DELETE /api/challenge/:id
```

---

# 🏆 Contest Module

Contest management APIs for organizing coding competitions.

---

## Contest Routes

### Get All Contests

```http
GET /api/contest
```

---

### Get Contest By ID

```http
GET /api/contest/:contestId
```

---

### Create Contest

```http
POST /api/contest
```

Request Body:

```json
{
  "title": "Weekly Contest",
  "description": "Competitive coding contest",
  "start_time": "2026-05-01T10:00:00Z",
  "end_time": "2026-05-01T12:00:00Z"
}
```

---

### Join Contest

```http
POST /api/contest/:contestId/join
```

---

### Remove Challenge From Contest

```http
DELETE /api/contest/:contestId/challenge/:challengeId
```

---

### Update Contest

```http
PATCH /api/contest/:contestId
```

---

### Delete Contest

```http
DELETE /api/contest/:contestId
```

---

# 📊 Leaderboard Module

Real-time leaderboard infrastructure powered by Redis Pub/Sub.

---

## Leaderboard Routes

### Get Top Players

```http
GET /leaderboard/contests/:contestId?count=10
```

---

### Get Current User Standing

```http
GET /leaderboard/contests/:contestId/me
```

---

# ☸️ Kubernetes Runner Infrastructure

DevForces dynamically provisions isolated coding environments using Kubernetes.

---

## Runner Workflow

```txt
User Joins Contest
        │
        ▼
Workspace Requested
        │
        ▼
Orchestrator Generates Kubernetes Resources
        │
        ▼
Kubernetes Creates Runner Pod
        │
        ▼
Init Container Pulls Files From S3
        │
        ▼
Runner Starts IDE + Terminal Services
        │
        ▼
User Connects To Workspace
```

---

# 📁 kube_service.yaml

Location:

```bash
apps/orchestrator/src/modules/k8s/kube_service.yaml
```

---

## Kubernetes Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment

metadata:
  name: __SERVICE_NAME__

spec:
  replicas: 1

  selector:
    matchLabels:
      app: __SERVICE_NAME__

  template:
    metadata:
      labels:
        app: __SERVICE_NAME__

    spec:
      volumes:
        - name: workspace-volume
          emptyDir:
            sizeLimit: "5Gi"

      initContainers:
        - name: copy-s3-resources
          image: amazon/aws-cli

          command: ["/bin/sh", "-c"]

          args:
            - >
              aws s3 cp s3://devforces/contests/__CONTEST_ID__/challenges/__CHALLENGE_ID__/users/__USER_ID__ /workspace/ --recursive &&
              echo "Resources copied from S3";

          env:
            - name: AWS_ACCESS_KEY_ID
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_ACCESS_KEY

            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_SECRET_ACCESS_KEY

            - name: AWS_REGION
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_REGION

          volumeMounts:
            - name: workspace-volume
              mountPath: /workspace

      containers:
        - name: runner
          image: ritik6559/devforces-runner:v1.8

          ports:
            - containerPort: 8001
            - containerPort: 8000

          env:
            - name: AWS_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_ACCESS_KEY

            - name: AWS_SECRET_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_SECRET_ACCESS_KEY

            - name: AWS_REGION
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: AWS_REGION

            - name: S3_BUCKET_NAME
              valueFrom:
                secretKeyRef:
                  name: aws-credentials
                  key: S3_BUCKET_NAME

          volumeMounts:
            - name: workspace-volume
              mountPath: /workspace

          resources:
            requests:
              cpu: "1"
              memory: "1Gi"
              ephemeral-storage: "2Gi"

            limits:
              cpu: "1"
              memory: "1Gi"
              ephemeral-storage: "5Gi"

---
apiVersion: v1
kind: Service

metadata:
  name: __SERVICE_NAME__

spec:
  selector:
    app: __SERVICE_NAME__

  ports:
    - protocol: TCP
      name: ws
      port: 8001
      targetPort: 8001

    - protocol: TCP
      name: user
      port: 8000
      targetPort: 8000

---
apiVersion: networking.k8s.io/v1
kind: Ingress

metadata:
  name: __SERVICE_NAME__

spec:
  ingressClassName: nginx

  rules:
    - host: __SERVICE_NAME__.devforces-out.ritik.fun
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: __SERVICE_NAME__
                port:
                  number: 8001

    - host: __SERVICE_NAME__.devforces-code.ritik.fun
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: __SERVICE_NAME__
                port:
                  number: 8000
```

---

# 🛠️ Installation

## Clone Repository

```bash
git clone https://github.com/ritik6559/DevForces.git
cd DevForces
```

---

## Install Dependencies

```bash
bun install
```

---

# ⚙️ Environment Variables

Create a `.env` file in the required backend services.

```env
# JWT CONFIG
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
REFRESH_TOKEN_EXPIRY=

# OTP MAIL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_USER=
SMTP_PASS=
OTP_SALT=

# REDIS URL
REDIS_URL=

DATABASE_URL=

# AWS S3 CONFIG
AWS_REGION=
AWS_ACCESS_KEY=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET_NAME=
```

---

# 🚀 Start Development

```bash
bun run dev
```

---

# 🐳 Docker Setup

```bash
docker compose up --build
```

---

# ☸️ Kubernetes Deployment

```bash
kubectl apply -f k8s/
```

---

# 📁 Shared Packages

| Package        | Purpose               |
| -------------- | --------------------- |
| `common-types` | Shared typings        |
| `logger`       | Logging utilities     |
| `store`        | Prisma database layer |
| `ui`           | Shared UI components  |
| `s3`           | AWS S3 abstraction    |

---

# 🔒 Security Features

✅ OTP Hashing
✅ JWT Rotation
✅ Redis-Based Rate Limiting
✅ Protected Middleware
✅ Refresh Token Revocation
✅ Role-Based Access Control
✅ Isolated Kubernetes Pods

---

# 🚧 Submission Module Status

> ⚠️ The submission/judge system is currently under development.

Planned features:

* Multi-language execution
* Secure sandboxing
* Hidden/public test cases
* Runtime & memory tracking
* Verdict engine
* Submission history

---

# 📈 Future Roadmap

* AI-powered code review
* Spectator mode
* Collaborative coding
* Team contests
* Advanced analytics
* Queue-based execution engine

---

# 🤝 Contributing

```bash
fork → clone → branch → commit → PR 🚀
```

Contributions are welcome!


# ⭐ Support

If you like this project:

```txt
⭐ Star the repository
🍴 Fork the project
🚀 Build something awesome
```

---

<div align="center">

# ⚔️ Code. Compete. Conquer.

Built with ❤️ using modern distributed systems.

</div>

