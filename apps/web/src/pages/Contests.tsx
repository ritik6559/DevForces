import { Calendar, Loader } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransitions";
import { ContestCardSkeleton } from "@/components/Skeletons";
import { useState } from "react";
import ContestCard from "@/components/ContestCard";
import { useGetAllContests } from "@/features/contest/api/use-get-all-contests";
import type { Contest } from "@/features/contest/types"

const filters = ["all", "active", "upcoming", "ended"] as const;

const Contests = () => {
  const [filter, setFilter] = useState<typeof filters[number]>("all");

  const { data: contests, isLoading } = useGetAllContests();

  if( isLoading ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold tracking-tight text-foreground">
              Contests
            </h1>
            <div className="h-1 w-16 bg-gradient-to-r from-primary to-secondary mt-3 rounded-full" />
            <p className="mt-3 text-sm text-muted-foreground">
              Build real features. Climb the leaderboard.
            </p>
          </div>

          <div className="inline-flex gap-1 mb-8 bg-muted/60 border border-border rounded-full p-1 w-fit">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all cursor-pointer ${
                  filter === f
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_0_1px_hsl(263_85%_62%/0.3)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map(i => <ContestCardSkeleton key={i} />)}
            </div>
          ) : !contests?.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl border border-dashed border-border bg-card/40">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground font-semibold">No contests yet</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon for the next arena.</p>
            </div>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contests.map((c: Contest)  => (
                <StaggerItem key={c.contest_id}>
                  <ContestCard contest={c} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

export default Contests;