const Skeleton = ({ className = "" }: { className?: string }) => {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
};

const ContestCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-muted" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

const ChallengeRowSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-14 ml-auto rounded-md" />
    </div>
  );
};

export { ChallengeRowSkeleton, ContestCardSkeleton, Skeleton };
