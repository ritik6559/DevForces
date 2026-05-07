const StatusBadge = ({ status }: { status: string }) => {
  
  if (status === "active")
    return (
      <span className="flex items-center gap-1.5 text-xs font-semibold font-mono uppercase text-success">
        <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
        LIVE
      </span>
    );

  if (status === "upcoming")
    return (
      <span className="text-xs font-semibold font-mono uppercase text-secondary">
        UPCOMING
      </span>
    );
  return (
    <span className="text-xs font-semibold font-mono uppercase text-muted-foreground">
      ENDED
    </span>
  );
};

export default StatusBadge;
