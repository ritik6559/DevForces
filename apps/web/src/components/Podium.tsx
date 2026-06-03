import { podiumStyles } from "@/utils";
import { cn } from "@/lib/utils";
import { TopPlayersResponse } from "common-types";
import { motion } from "framer-motion";

const Podium = ({ entries }: { entries: TopPlayersResponse }) => {
  const topPlayers = entries.players?.slice(0, 3) ?? [];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 mb-10">
      {topPlayers.map((entry, index) => {
        const style = podiumStyles[index];

        return (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.12,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="flex flex-col items-center"
          >
            <span className="text-2xl mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              {style.label}
            </span>

            <div
              className={cn(
                "rounded-full p-[2px] mb-2.5",
                style.ring,
                index === 0
                  ? "ring-gradient"
                  : index === 1
                    ? "bg-muted-foreground/45"
                    : "bg-warning/55",
              )}
            >
              <div className="w-12 h-12 rounded-full bg-surface grid place-items-center font-mono text-sm font-bold text-foreground">
                {entry.username.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <p className="text-sm font-semibold text-foreground mb-0.5 max-w-[6rem] truncate">
              {entry.username}
            </p>

            <p className="font-mono text-xs font-semibold text-primary tabular-nums mb-2">
              {entry.score}
              <span className="text-muted-foreground font-normal"> pts</span>
            </p>

            <div
              className={cn(
                "relative w-20 sm:w-24 overflow-hidden rounded-t-lg border-t border-x",
                style.height,
                style.gradient,
                style.color,
                style.glow,
              )}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-2 text-center font-mono text-xl font-extrabold text-foreground/85">
                {index + 1}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default Podium;
