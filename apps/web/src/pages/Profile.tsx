import Navbar from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransitions";
import { Skeleton } from "@/components/Skeletons";
import { Trophy, Code, Award } from "lucide-react";
import { useGetCurrentUser } from "@/features/auth/api/use-get-current-user";

const Profile = () => {
  const { data: profile, isLoading } = useGetCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageTransition>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
              </div>
            </div>
          ) : profile && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-mono text-xl font-bold">
                    {profile.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-heading font-extrabold text-foreground">{profile.username}</h1>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Trophy, label: "Contests", value: profile.contestsEntered },
                  { icon: Code, label: "Solved", value: profile.challengesSolved },
                  { icon: Award, label: "Best Rank", value: `#${profile.bestRank}` },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
                    <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="font-mono text-2xl font-bold text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-heading font-bold text-foreground mb-4">Recent Submissions</h2>
              {/* <div className="rounded-xl border border-border bg-card overflow-hidden">
                {mockSubmissions.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground" title={new Date(s.timestamp).toLocaleString()}>
                      {relativeTime(s.timestamp)}
                    </span>
                    <span className="font-mono text-sm text-primary">{s.score} pts</span>
                    <span className={`text-xs font-mono uppercase ${s.status === "completed" ? "text-success" : "text-muted-foreground"}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
              </div> */}
            </>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

export default Profile;