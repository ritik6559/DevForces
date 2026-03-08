// file to be deleted
import { useQuery, useMutation } from "@tanstack/react-query";
import { mockContests, mockChallenges, mockLeaderboard, mockSubmissions, mockUserProfile } from "@/data/mockData";

// Simulate API delay
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export function useContests(filter?: string) {
  return useQuery({
    queryKey: ["contests", filter],
    queryFn: async () => {
      await delay(600);
      if (!filter || filter === "all") return mockContests;
      return mockContests.filter(c => c.status === filter);
    },
  });
}

export function useContest(contestId: string) {
  return useQuery({
    queryKey: ["contest", contestId],
    queryFn: async () => {
      await delay(400);
      return mockContests.find(c => c.id === contestId) ?? null;
    },
  });
}

export function useChallenges(contestId: string) {
  return useQuery({
    queryKey: ["challenges", contestId],
    queryFn: async () => {
      await delay(500);
      return mockChallenges.filter(c => c.contestId === contestId);
    },
  });
}

export function useChallenge(contestId: string, challengeId: string) {
  return useQuery({
    queryKey: ["challenge", contestId, challengeId],
    queryFn: async () => {
      await delay(400);
      return mockChallenges.find(c => c.id === challengeId && c.contestId === contestId) ?? null;
    },
  });
}

export function useLeaderboard(contestId: string) {
  return useQuery({
    queryKey: ["leaderboard", contestId],
    queryFn: async () => {
      await delay(500);
      return mockLeaderboard;
    },
    refetchInterval: 30000,
  });
}

export function useUserSubmissions(challengeId: string) {
  return useQuery({
    queryKey: ["submissions", challengeId],
    queryFn: async () => {
      await delay(400);
      return mockSubmissions.filter(s => s.challengeId === challengeId);
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      await delay(400);
      return mockUserProfile;
    },
  });
}

export function useSubmitCode() {
  return useMutation({
    mutationFn: async () => {
      await delay(1500);
      return { jobId: "job-" + Date.now() };
    },
  });
}
