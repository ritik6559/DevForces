import { Calendar } from "lucide-react";
import { useContests } from "@/hooks/useApi";
import Navbar from "@/components/Navbar";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/PageTransitions";
import { ContestCardSkeleton } from "@/components/Skeletons";
import { useState } from "react";
import ContestCard from "@/components/ContestCard";

const filters = ["all", "active", "upcoming", "ended"] as const;

const Contests = () => {
  const [filter, setFilter] = useState<typeof filters[number]>("all");
  const { data: contests, isLoading } = useContests(filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-extrabold text-foreground">
              Contests
              <div className="h-0.5 w-16 bg-primary mt-2 rounded-full" />
            </h1>
          </div>

          <div className="flex gap-1 mb-8 bg-muted rounded-lg p-1 w-fit">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium">No contests yet</p>
              <p className="text-sm text-muted-foreground">Check back soon.</p>
            </div>
          ) : (
            <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {contests.map(c => (
                <StaggerItem key={c.id}>
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