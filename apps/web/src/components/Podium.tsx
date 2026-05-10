import { podiumStyles } from "@/utils";
import { TopPlayersResponse } from "common-types";
import { motion } from "framer-motion";

const Podium = ({ entries }: { entries: TopPlayersResponse }) => {
  const topPlayers = entries.players?.slice(0, 3) ?? [];

  return (
    <div className="flex items-end justify-center gap-4 mb-8">
      {topPlayers.map((entry, index) => {
        const style = podiumStyles[index];

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <span className="text-2xl mb-2">{style.label}</span>

            <div
              className={`w-12 h-12 rounded-full border-2 ${style.color} bg-muted flex items-center justify-center font-mono text-sm font-bold text-foreground mb-2`}
            >
              {entry.username.slice(0, 2).toUpperCase()}
            </div>

            <p className="text-sm font-medium text-foreground mb-1">
              {entry.username}
            </p>

            <p className="font-mono text-xs text-primary">
              {entry.score}
            </p>

            <div
              className={`${style.height} w-20 bg-card border border-border rounded-t-md mt-2`}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;