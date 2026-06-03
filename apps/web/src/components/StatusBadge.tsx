const StatusBadge = ({ status }: { status: string }) => {

  if (status === "active")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 pl-1.5 pr-2.5 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-wider text-success">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-neon-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        Live
      </span>
    );

  if (status === "upcoming")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-wider text-secondary">
        <span className="h-2 w-2 rounded-full bg-secondary/70" />
        Upcoming
      </span>
    );

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold font-mono uppercase tracking-wider text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
      Ended
    </span>
  );
};

export default StatusBadge;
