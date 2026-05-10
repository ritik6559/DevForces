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

  const handleOnClick = async () => {
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
      whileHover={{ y: -2 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-transparent group-hover:bg-primary transition-colors" />
      <div className="flex items-start justify-between mb-3">
        <StatusBadge status={status} />
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
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : status === "ended"
              ? "bg-muted text-foreground hover:bg-muted/80"
              : "bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/30",
          isLoading && "opacity-80 cursor-not-allowed", 
        )}
        onClick={handleOnClick}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin mr-2" />
            Joining...
          </>
        ) : (
          <>
            {status === "active"
              ? "Enter Contest"
              : status === "ended"
                ? "View Results"
                : "Set Reminder"}
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default ContestCard;
