import { Contest, Challenge, LeaderboardEntry, Submission, UserProfile } from "./types";

export const mockContests: Contest[] = [
  {
    id: "c1",
    title: "Backend Blitz #12",
    description: "Build a REST API with authentication, rate limiting, and proper error handling. Test your skills against the best backend developers.",
    status: "active",
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    challengeCount: 4,
  },
  {
    id: "c2",
    title: "API Architect Challenge",
    description: "Design and implement a microservice architecture for an e-commerce platform with proper service boundaries.",
    status: "upcoming",
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
    challengeCount: 3,
  },
  {
    id: "c3",
    title: "Database Duel #8",
    description: "Optimize database queries, design schemas, and implement efficient data access patterns under time pressure.",
    status: "upcoming",
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    challengeCount: 5,
  },
  {
    id: "c4",
    title: "Auth Masters #3",
    description: "Implement OAuth2, JWT refresh tokens, and role-based access control from scratch. Security is paramount.",
    status: "ended",
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    challengeCount: 3,
  },
  {
    id: "c5",
    title: "WebSocket Warriors",
    description: "Build real-time features: chat, notifications, live updates. Master bi-directional communication patterns.",
    status: "ended",
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    challengeCount: 4,
  },
  {
    id: "c6",
    title: "Caching Crusade",
    description: "Implement multi-layer caching strategies with Redis, in-memory stores, and cache invalidation patterns.",
    status: "active",
    startTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    challengeCount: 3,
  },
];

export const mockChallenges: Challenge[] = [
  {
    id: "ch1",
    contestId: "c1",
    index: 1,
    title: "User Registration Endpoint",
    difficulty: "EASY",
    maxPoints: 100,
    userScore: 100,
    status: "solved",
    description: `# User Registration Endpoint

Build a \`POST /api/register\` endpoint that handles user registration.

## Requirements

- Accept \`email\`, \`password\`, and \`username\` in the request body
- Validate email format using a proper regex
- Password must be at least 8 characters with one uppercase, one number
- Hash passwords using bcrypt with salt rounds of 10
- Return a JWT token on successful registration
- Handle duplicate email errors gracefully

## Example Request

\`\`\`json
{
  "email": "dev@example.com",
  "password": "SecurePass1",
  "username": "devmaster"
}
\`\`\`

## Example Response

\`\`\`json
{
  "success": true,
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "email": "dev@example.com" }
}
\`\`\`
`,
    allowedPackages: ["express ^4.18", "bcrypt ^5.1", "jsonwebtoken ^9.0", "zod ^3.22"],
  },
  {
    id: "ch2",
    contestId: "c1",
    index: 2,
    title: "Rate Limiter Middleware",
    difficulty: "medium",
    maxPoints: 200,
    userScore: 145,
    status: "attempted",
    description: `# Rate Limiter Middleware

Implement a token bucket rate limiter as Express middleware.

## Requirements

- Limit each IP to 100 requests per 15-minute window
- Return 429 status with retry-after header when limit exceeded
- Use in-memory store (no Redis required)
- Include rate limit headers in every response
`,
    allowedPackages: ["express ^4.18"],
  },
  {
    id: "ch3",
    contestId: "c1",
    index: 3,
    title: "JWT Refresh Token Flow",
    difficulty: "hard",
    maxPoints: 300,
    userScore: null,
    status: "unattempted",
    description: `# JWT Refresh Token Flow

Implement a complete JWT access/refresh token system.

## Requirements

- Short-lived access tokens (15 min)
- Long-lived refresh tokens (7 days) stored in httpOnly cookies
- Token rotation on refresh
- Revocation support
`,
    allowedPackages: ["express ^4.18", "jsonwebtoken ^9.0", "cookie-parser ^1.4"],
  },
  {
    id: "ch4",
    contestId: "c1",
    index: 4,
    title: "Error Handler & Logger",
    difficulty: "easy",
    maxPoints: 100,
    userScore: null,
    status: "unattempted",
    description: `# Global Error Handler & Logger

Build centralized error handling and structured logging.`,
    allowedPackages: ["express ^4.18", "winston ^3.11"],
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "alexdev", score: 580, challengesSolved: 3, lastSubmission: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 2, username: "sarahcodes", score: 520, challengesSolved: 3, lastSubmission: new Date(Date.now() - 25 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 3, username: "byteboss", score: 445, challengesSolved: 2, lastSubmission: new Date(Date.now() - 40 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 4, username: "you_dev", score: 345, challengesSolved: 2, lastSubmission: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isCurrentUser: true },
  { rank: 5, username: "rustlord", score: 300, challengesSolved: 2, lastSubmission: new Date(Date.now() - 55 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 6, username: "goopher", score: 245, challengesSolved: 1, lastSubmission: new Date(Date.now() - 70 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 7, username: "pymaster", score: 200, challengesSolved: 1, lastSubmission: new Date(Date.now() - 90 * 60 * 1000).toISOString(), isCurrentUser: false },
  { rank: 8, username: "nodejsninja", score: 145, challengesSolved: 1, lastSubmission: new Date(Date.now() - 120 * 60 * 1000).toISOString(), isCurrentUser: false },
];

export const mockSubmissions: Submission[] = [
  { id: "s1", challengeId: "ch1", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), score: 100, status: "completed", totalTests: 12, passedTests: 12 },
  { id: "s2", challengeId: "ch2", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), score: 145, status: "completed", totalTests: 15, passedTests: 11 },
  { id: "s3", challengeId: "ch2", timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), score: 80, status: "completed", totalTests: 15, passedTests: 6 },
];

export const mockUserProfile: UserProfile = {
  username: "you_dev",
  email: "dev@example.com",
  contestsEntered: 8,
  challengesSolved: 23,
  bestRank: 2,
};

export const mockFileTree = [
  { path: "package.json", locked: true, content: '{\n  "name": "solution",\n  "dependencies": {\n    "express": "^4.18.0"\n  }\n}' },
  { path: "src/index.ts", locked: false, content: '// Your solution starts here\nimport express from "express";\n\nconst app = express();\napp.use(express.json());\n\n// TODO: Implement your endpoints\n\napp.listen(3000, () => {\n  console.log("Server running on port 3000");\n});\n' },
  { path: "src/middleware.ts", locked: false, content: '// Add your middleware here\n' },
  { path: "tests/api.test.ts", locked: true, content: '// Test suite - read only\nimport request from "supertest";\n// Tests are run by the evaluation system\n' },
];

export const mockTestResults = [
  { name: "POST /api/register - valid input returns 201", passed: true },
  { name: "POST /api/register - returns JWT token", passed: true },
  { name: "POST /api/register - hashes password with bcrypt", passed: true },
  { name: "POST /api/register - validates email format", passed: true },
  { name: "POST /api/register - rejects weak password", passed: true },
  { name: "POST /api/register - duplicate email returns 409", passed: true },
  { name: "POST /api/register - missing fields returns 400", passed: false, error: "Expected status 400, received 500. No validation error message returned." },
  { name: "POST /api/register - SQL injection prevention", passed: true },
  { name: "POST /api/register - response time under 200ms", passed: true },
  { name: "POST /api/register - proper Content-Type header", passed: false, error: "Response Content-Type is 'text/html', expected 'application/json'." },
];
