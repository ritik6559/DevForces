import { CheckCircle, ChevronRight, RefreshCw } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import { Challenge } from "@/data/types";
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
    navigate(`/contests/${contestId}/${ch.id}`);
  };

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <span className="font-mono text-sm text-muted-foreground w-6">
        {ch.index}
      </span>
      <DifficultyBadge d={ch.difficulty} />
      <span className="font-medium text-foreground flex-1">{ch.title}</span>
      <span className="font-mono text-sm text-primary">{ch.maxPoints} pts</span>
      {ch.userScore !== null && (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${(ch.userScore / ch.maxPoints) * 100}%` }}
            />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {ch.userScore}/{ch.maxPoints}
          </span>
        </div>
      )}
      {ch.status === "solved" && (
        <CheckCircle className="w-4 h-4 text-success" />
      )}
      {ch.status === "attempted" && (
        <RefreshCw className="w-4 h-4 text-warning" />
      )}
      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

export default ChallengeRow;
