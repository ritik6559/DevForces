import {ChevronRight } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import { Challenge } from "@/features/challenge/types";
import { useNavigate } from "react-router-dom";

const ChallengeRow = ({
  ch,
  contestId,
}: {
  ch: Challenge;
  contestId: string;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/contests/${contestId}/${ch.challenge_id}`);
  };

  return (
    <div
      className="group relative flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0 transition-colors cursor-pointer hover:bg-muted/40"
      onClick={handleClick}
    >
      <span className="absolute left-0 top-0 bottom-0 w-[3px] origin-top scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />
      {/* <span className="font-mono text-sm text-muted-foreground w-6">
        {ch.index}
      </span> */}
      <DifficultyBadge d={ch.difficulty} />
      <span className="font-medium text-foreground flex-1 transition-colors group-hover:text-primary">
        {ch.title}
      </span>
      <span className="font-mono text-sm font-semibold text-primary tabular-nums">
        {ch.max_points} <span className="text-muted-foreground font-normal">pts</span>
      </span>
      {/* {ch.userScore !== null && (
        <div className="flex items-center gap-2">
          {/* <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            {/* <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(ch.userScore / ch.max_points) * 100}%` }}
            /> 
          </div> 
          {/* <span className="font-mono text-xs text-muted-foreground">
            {ch.userScore}/{ch.maxPoints}
          </span> 
        </div>
      )} */}
      {/* {ch.status === "solved" && (
        <CheckCircle className="w-4 h-4 text-success" />
      )}
      {ch.status === "attempted" && (
        <RefreshCw className="w-4 h-4 text-warning" />
      )} */}
      <ChevronRight className="w-4 h-4 text-primary -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
    </div>
  );
};

export default ChallengeRow;
