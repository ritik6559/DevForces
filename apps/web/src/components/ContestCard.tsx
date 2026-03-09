import { Contest } from "@/data/types";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Link } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

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

const ContestCard = ({ contest }: { contest: Contest }) => {
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

export default ContestCard;