import { Contest } from "@/data/types";
import { motion } from "framer-motion";
import { ChevronRight, Clock } from "lucide-react";
import { Button } from "./ui/button";
import StatusBadge from "./StatusBadge";
import CountdownTimer from "./CountDownTimer";
import { useNavigate } from "react-router-dom";

const ContestCard = ({ contest }: { contest: Contest }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-primary transition-colors" />
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={contest.status} />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2">
        {contest.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {contest.description}
      </p>

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

      <Button
        size="sm"
        className={
          contest.status === "active"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
            : contest.status === "ended"
              ? "bg-muted text-foreground hover:bg-muted/80 cursor-pointer"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/30 cursor-pointer"
        }
        onClick={() => {
          navigate(`/contests/${contest.id}`);
        }}
      >
        {contest.status === "active"
          ? "Enter Contest"
          : contest.status === "ended"
            ? "View Results"
            : "Set Reminder"}
        <ChevronRight className="w-3.5 h-3.5 ml-1" />
      </Button>
    </motion.div>
  );
};

export default ContestCard;
