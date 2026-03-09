import { Challenge } from "@/data/types";

const DifficultyBadge = ({ d }: { d: Challenge["difficulty"] }) => {
  const colors = { easy: "text-success bg-success/10", medium: "text-warning bg-warning/10", hard: "text-destructive bg-destructive/10" };
  return <span className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${colors[d]}`}>{d}</span>;
}

export default DifficultyBadge;