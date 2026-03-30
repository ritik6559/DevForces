/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLeaderboard } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransitions";
import { ChallengeRowSkeleton, Skeleton } from "@/components/Skeletons";
import ChallengeRow from "@/components/ChallengeRow";
import Podium from "@/components/Podium";
import { relativeTime } from "@/utils";
import { useGetContestById } from "@/features/contest/api/use-get-contest-id";
import { useGetChallengesByContest } from "@/features/challenge/api/use-get-challenges-by-contest";
import { Challenge } from "@/features/challenge/types";

const ContestDetail = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [tab, setTab] = useState<"challenges" | "leaderboard">("challenges");
  const { data: contest, isLoading: loadingContest } = useGetContestById(contestId!);
  const { data: challenges, isLoading: loadingChallenges } = useGetChallengesByContest(contestId!);
  const { data: leaderboard, isLoading: loadingLB } = useLeaderboard(contestId!);

  const elapsed = contest ? Math.min(100, Math.max(0, ((Date.now() - new Date(contest.startTime).getTime()) / (new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime())) * 100)) : 0;

  if( loadingContest ) {
      return (
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/contests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Contests
          </Link>

          {loadingContest ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : contest && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-heading font-extrabold text-foreground">{contest.title}</h1>
                <span className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                  contest.status === "ACTIVE" ? "text-success bg-success/10" : contest.status === "UPCOMING" ? "text-secondary bg-secondary/10" : "text-muted-foreground bg-muted"
                }`}>{contest.status}</span>
              </div>
              {contest.status === "ACTIVE" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span className="font-mono">{Math.round(elapsed)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${elapsed}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-1 mb-6 border-b border-border">
            {(["challenges", "leaderboard"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  tab === t ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "challenges" && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {loadingChallenges ? (
                Array.from({ length: 4 }).map((_, i) => <ChallengeRowSkeleton key={i} />)
              ) : challenges?.length ? (
                <StaggerContainer>
                  {challenges.map((ch: Challenge) => (
                    <StaggerItem key={ch.challenge_id}>
                      <ChallengeRow ch={ch} contestId={contestId!} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No challenges yet.</div>
              )}
            </div>
          )}

          {tab === "leaderboard" && (
            <div>
              {loadingLB ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : leaderboard?.length ? (
                <>
                  <Podium entries={leaderboard} />
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-[60px_1fr_80px_100px_100px] gap-2 px-4 py-2 text-xs text-muted-foreground font-medium border-b border-border">
                      <span>Rank</span><span>Username</span><span>Score</span><span>Solved</span><span>Last Sub</span>
                    </div>
                    <StaggerContainer>
                      {leaderboard.map(e => (
                        <StaggerItem key={e.rank}>
                          <div className={`grid grid-cols-[60px_1fr_80px_100px_100px] gap-2 px-4 py-3 border-b border-border last:border-0 ${e.isCurrentUser ? "bg-primary/5" : ""}`}>
                            <span className="font-mono text-sm text-foreground">#{e.rank}</span>
                            <span className="text-sm text-foreground font-medium">{e.username}</span>
                            <span className="font-mono text-sm text-primary">{e.score}</span>
                            <span className="font-mono text-sm text-muted-foreground">{e.challengesSolved}</span>
                            <span className="text-xs text-muted-foreground" title={new Date(e.lastSubmission).toLocaleString()}>{relativeTime(e.lastSubmission)}</span>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">No submissions yet.</div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

export default ContestDetail;