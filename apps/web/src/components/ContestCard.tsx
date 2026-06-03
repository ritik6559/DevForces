import { Contest } from "@/features/contest/types";
import { motion } from "framer-motion";
import { ChevronRight, Clock, Loader } from "lucide-react";
import { Button } from "./ui/button";
import CountdownTimer from "./CountDownTimer";
import { useNavigate } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { useJoinContest } from "@/features/contest/api/use-join-contest";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ContestCard = ({ contest }: { contest: Contest }) => {
  const navigate = useNavigate();
  const { mutateAsync: join, isPending: isLoading } = useJoinContest(
    contest.contest_id,
  );

  console.log(contest);

  const now = new Date();
  const startTime = new Date(contest.start_time);
  const endTime = new Date(contest.end_time);

  const status =
    now < startTime ? "upcoming" : now <= endTime ? "active" : "ended";

  const onClick = async () => {
    if (status === "active") {
      try {
        await join();
        navigate(`/contests/${contest.contest_id}`);

        toast.success("Successfully joined the contest!");
      } catch (error) {
        const errorMessage = "Failed to join contest. Please try again.";
        console.error("Join Contest Error:", error);
        toast.error(errorMessage);
      }
    } else if (status === "ended") {
      navigate(`/contests/${contest.contest_id}/results`);
    } else {
      toast.info("Reminder set! We'll notify you when the contest starts.");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(
        "group shine-card relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-surface p-5 transition-[box-shadow,border-color] duration-300",
        status === "active"
          ? "hover:border-success/40 hover:shadow-[0_0_0_1px_hsl(var(--success)/0.35),0_14px_40px_-14px_hsl(var(--success)/0.28)]"
          : status === "upcoming"
            ? "hover:border-secondary/40 hover:shadow-[0_0_0_1px_hsl(var(--secondary)/0.35),0_14px_40px_-14px_hsl(var(--secondary)/0.28)]"
            : "hover:border-border hover:shadow-[0_14px_40px_-16px_hsl(0_0%_0%/0.6)]",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          status === "active"
            ? "bg-success animate-rail-glow"
            : status === "upcoming"
              ? "bg-secondary"
              : "bg-muted-foreground/40",
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={status} />
      </div>
      <h3 className="font-heading font-bold text-lg text-foreground mb-2 transition-colors group-hover:text-primary">
        {contest.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
        {contest.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(contest.start_time).toLocaleDateString()}
        </span>
        {/* <span className="font-mono">{contest.challengeCount} Challenges</span> */}
      </div>

      {status === "upcoming" && (
        <div className="mb-4">
          <span className="text-xs text-muted-foreground">Starts in </span>
          <CountdownTimer endTime={new Date(contest.start_time)} />
        </div>
      )}

      <Button
        size="sm"
        disabled={isLoading}
        className={cn(
          "cursor-pointer transition-all",
          status === "active"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_-6px_hsl(263_85%_62%/0.6)] hover:shadow-[0_0_26px_-4px_hsl(263_85%_62%/0.75)]"
            : status === "ended"
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/30",
          isLoading && "opacity-80 cursor-not-allowed",
        )}
        onClick={onClick}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
          </>
        ) : (
          <>
            {status === "active"
              ? "Enter Contest"
              : status === "ended"
                ? "View Results"
                : "Set Reminder"}
            <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ContestCard;
