/* eslint-disable react-hooks/purity */
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  PageTransition,
  StaggerContainer,
  StaggerItem,
} from "@/components/PageTransitions";
import { ChallengeRowSkeleton, Skeleton } from "@/components/Skeletons";
import ChallengeRow from "@/components/ChallengeRow";
import Podium from "@/components/Podium";
import { useGetContestById } from "@/features/contest/api/use-get-contest-id";
import { useGetChallengesByContest } from "@/features/challenge/api/use-get-challenges-by-contest";
import { Challenge } from "@/features/challenge/types";
import { useGetTopPlayers } from "@/features/leaderboard/api/use-get-top-players";
import { TopPlayersResponse } from "common-types";

const ContestDetail = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const [tab, setTab] = useState<"challenges" | "leaderboard">("challenges");
  const { data: contest, isLoading: loadingContest } = useGetContestById(
    contestId!,
  );
  const { data: challenges, isLoading: loadingChallenges } =
    useGetChallengesByContest(contestId!);

  const { data: leaderboard, isLoading: loadingLB }: { data: TopPlayersResponse | undefined; isLoading: boolean } = useGetTopPlayers(
    contestId!,
  );

  const elapsed = contest
    ? Math.min(
        100,
        Math.max(
          0,
          ((Date.now() - new Date(contest.startTime).getTime()) /
            (new Date(contest.endTime).getTime() -
              new Date(contest.startTime).getTime())) *
            100,
        ),
      )
    : 0;

  if (loadingContest) {
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
          <Link
            to="/contests"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" /> Back to Contests
          </Link>

          {loadingContest ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : (
            contest && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">
                    {contest.title}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      contest.status === "ACTIVE"
                        ? "text-success bg-success/10 border-success/30"
                        : contest.status === "UPCOMING"
                          ? "text-secondary bg-secondary/10 border-secondary/30"
                          : "text-muted-foreground bg-muted/60 border-border"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${contest.status === "ACTIVE" ? "bg-success animate-pulse-glow" : "bg-current opacity-70"}`} />
                    {contest.status}
                  </span>
                </div>
                {contest.status === "ACTIVE" && (
                  <div className="mt-4 max-w-md">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Contest progress</span>
                      <span className="font-mono text-foreground tabular-nums">{Math.round(elapsed)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${elapsed}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_12px_0_hsl(263_85%_62%/0.5)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          <div className="flex gap-1 mb-6 border-b border-border">
            {(["challenges", "leaderboard"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative px-4 py-2.5 text-sm font-medium capitalize transition-colors -mb-px ${
                  tab === t
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                {tab === t && (
                  <motion.span
                    layoutId="contest-tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full"
                  />
                )}
              </button>
            ))}
          </div>

          {tab === "challenges" && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {loadingChallenges ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <ChallengeRowSkeleton key={i} />
                ))
              ) : challenges?.length ? (
                <StaggerContainer>
                  {challenges.map((ch: Challenge) => (
                    <StaggerItem key={ch.challenge_id}>
                      <ChallengeRow ch={ch} contestId={contestId!} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No challenges yet.
                </div>
              )}
            </div>
          )}

          {tab === "leaderboard" && (
            <div>
              {loadingLB ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : leaderboard?.players?.length ? (
                <>
                  <Podium entries={leaderboard} />
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <div className="grid grid-cols-[64px_1fr_auto] gap-3 px-4 py-2.5 text-[11px] uppercase tracking-wider text-muted-foreground font-mono font-medium border-b border-border bg-muted/30">
                      <span>Rank</span>
                      <span>Username</span>
                      <span className="text-right">Score</span>
                    </div>
                    <StaggerContainer>
                      {leaderboard.players.map(
                        (e: {
                          rank: number;
                          username: string;
                          score: number;
                        }) => (
                          <StaggerItem key={e.rank}>
                            <div
                              className={`group grid grid-cols-[64px_1fr_auto] items-center gap-3 px-4 py-3 border-b border-border last:border-0 transition-colors hover:bg-muted/40`}
                            >
                              <span
                                className={`font-mono text-sm font-bold tabular-nums ${
                                  e.rank === 1
                                    ? "text-primary"
                                    : e.rank === 2
                                      ? "text-foreground"
                                      : e.rank === 3
                                        ? "text-warning"
                                        : "text-muted-foreground"
                                }`}
                              >
                                #{e.rank}
                              </span>
                              <span className="text-sm text-foreground font-medium truncate">
                                {e.username}
                              </span>
                              <span className="font-mono text-sm font-semibold text-primary tabular-nums text-right">
                                {e.score}
                                <span className="text-muted-foreground font-normal"> pts</span>
                              </span>
                            </div>
                          </StaggerItem>
                        ),
                      )}
                    </StaggerContainer>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No submissions yet.
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default ContestDetail;
