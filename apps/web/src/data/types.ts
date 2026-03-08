export interface Contest {
  id: string;
  title: string;
  description: string;
  status: "active" | "upcoming" | "ended";
  startTime: string;
  endTime: string;
  challengeCount: number;
}

export interface Challenge {
  id: string;
  contestId: string;
  index: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  maxPoints: number;
  userScore: number | null;
  status: "solved" | "attempted" | "unattempted";
  description: string;
  allowedPackages: string[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  challengesSolved: number;
  lastSubmission: string;
  isCurrentUser: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  timestamp: string;
  score: number;
  status: "pending" | "running" | "completed" | "failed";
  totalTests: number;
  passedTests: number;
}

export interface UserProfile {
  username: string;
  email: string;
  contestsEntered: number;
  challengesSolved: number;
  bestRank: number;
}

export interface FileNode {
  path: string;
  locked: boolean;
  content: string;
}

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}
