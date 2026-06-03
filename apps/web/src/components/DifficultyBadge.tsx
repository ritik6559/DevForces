import { Challenge } from "@/features/challenge/types";
import { colors } from "@/utils";

const DifficultyBadge = ({ d }: { d: Challenge["difficulty"] }) => {

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-wider ${colors[d]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {d}
    </span>
  );
};

export default DifficultyBadge;
