import { LeaderboardEntry } from "@/data/types";
import { motion } from "framer-motion";

const Podium = ({ entries }: { entries: LeaderboardEntry[] }) => {
  const top3 = entries.slice(0, 3);
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ["h-20", "h-28", "h-16"];
  const labels = ["🥈", "🥇", "🥉"];
  const colors = [
    "border-muted-foreground/40",
    "border-primary",
    "border-warning/60",
  ];

  return (
    <div className="flex items-end justify-center gap-4 mb-8">
      {order.map((idx, i) => {
        const entry = top3[idx];
        if (!entry) return null;
        return (
          <motion.div
            key={entry.username}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <span className="text-2xl mb-2">{labels[i]}</span>
            <div
              className={`w-12 h-12 rounded-full border-2 ${colors[i]} bg-muted flex items-center justify-center font-mono text-sm font-bold text-foreground mb-2`}
            >
              {entry.username.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              {entry.username}
            </p>
            <p className="font-mono text-xs text-primary">{entry.score}</p>
            <div
              className={`${heights[i]} w-20 bg-card border border-border rounded-t-md mt-2`}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
