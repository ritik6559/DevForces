import { Challenge } from "@/features/challenge/types";

const DifficultyBadge = ({ d }: { d: Challenge["difficulty"] }) => {
  const colors = { EASY: "text-success bg-success/10", MEDIUM: "text-warning bg-warning/10", HARD: "text-destructive bg-destructive/10" };
  return <span className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${colors[d]}`}>{d}</span>;
}

export default DifficultyBadge;