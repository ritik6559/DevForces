import { useEffect, useState } from "react";

const CountdownTimer = ({
  endTime,
  onExpire,
}: {
  endTime: Date;
  onExpire?: () => void;
}) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, endTime.getTime() - now);

  useEffect(() => {
    if (diff === 0) onExpire?.();
  }, [diff, onExpire]);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <span className="font-mono text-sm text-secondary tabular-nums">
      {d > 0 && `${d}d `}
      {h.toString().padStart(2, "0")}:
      {m.toString().padStart(2, "0")}:
      {s.toString().padStart(2, "0")}
    </span>
  );
};

export default CountdownTimer;