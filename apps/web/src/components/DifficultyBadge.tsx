import { Challenge } from "@/features/challenge/types";
import { colors } from "@/utils";

const DifficultyBadge = ({ d }: { d: Challenge["difficulty"] }) => {

  return (
    <span
      className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${colors[d]}`}
    >
      {d}
    </span>
  );
};

export default DifficultyBadge;
