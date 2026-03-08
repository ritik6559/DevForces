import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import { useContests } from "@/hooks/useApi";
import { Navbar } from "@/components/Navbar";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransitions";
import { ContestCardSkeleton } from "@/components/Skeletons";
import { Button } from "@/components/ui/button";
import type { Contest } from "@/data/types";

const filters = ["all", "active", "upcoming", "ended"] as const;

function StatusBadge({ status }: { status: Contest["status"] }) {
  if (status === "active")
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold font-mono uppercase text-success">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
        LIVE
      </span>
    );
  if (status === "upcoming")
    return <span className="text-xs font-semibold font-mono uppercase text-secondary">UPCOMING</span>;
  return <span className="text-xs font-semibold font-mono uppercase text-muted-foreground">ENDED</span>;
}

import { useEffect, useState } from "react";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, new Date(endTime).getTime() - now);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-mono text-sm text-secondary tabular-nums">
      {d > 0 && `${d}d `}
      {h.toString().padStart(2, "0")}:
      {m.toString().padStart(2, "0")}:
      {s.toString().padStart(2, "0")}
    </span>
  );
}

function ContestCard({ contest }: { contest: Contest }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-primary transition-colors" />
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={contest.status} />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2">{contest.title}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{contest.description}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(contest.startTime).toLocaleDateString()}
        </span>
        <span className="font-mono">{contest.challengeCount} Challenges</span>
      </div>

      {contest.status === "upcoming" && (
        <div className="mb-4">
          <span className="text-xs text-muted-foreground">Starts in </span>
          <CountdownTimer endTime={contest.startTime} />
        </div>
      )}

      <Link to={`/contests/${contest.id}`}>
        <Button
          size="sm"
          className={
            contest.status === "active"
              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
              : contest.status === "ended"
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/30"
          }
        >
          {contest.status === "active" ? "Enter Contest" : contest.status === "ended" ? "View Results" : "Set Reminder"}
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </Link>
    </motion.div>
  );
}

export default function Contests() {
  const [filter, setFilter] = useState<typeof filters[number]>("all");
  const { data: contests, isLoading } = useContests(filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-extrabold text-foreground">
              Contests
              <div className="h-0.5 w-16 bg-primary mt-2 rounded-full" />
            </h1>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 mb-8 bg-muted rounded-lg p-1 w-fit">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <ContestCardSkeleton key={i} />)}
            </div>
          ) : !contests?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No contests yet</p>
              <p className="text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contests.map(c => (
                <StaggerItem key={c.id}>
                  <ContestCard contest={c} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
