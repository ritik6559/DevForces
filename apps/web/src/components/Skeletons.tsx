const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} />
  );
}

const ContestCardSkeleton = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

const ChallengeRowSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      <Skeleton className="h-5 w-6" />
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-16 ml-auto" />
    </div>
  );
}

export {
  ChallengeRowSkeleton,
  ContestCardSkeleton,
  Skeleton
}