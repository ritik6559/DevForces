import Navbar from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransitions";
import { Skeleton } from "@/components/Skeletons";
import { Trophy, Code, Award, Inbox } from "lucide-react";
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
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            </div>
          ) : profile && (
            <>
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <div className="ring-gradient rounded-full p-[2.5px] shadow-[0_0_30px_-8px_hsl(263_85%_62%/0.6)]">
                    <div className="w-16 h-16 rounded-full bg-surface grid place-items-center text-foreground font-mono text-xl font-bold">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-foreground">{profile.username}</h1>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { icon: Trophy, label: "Contests", value: profile.contestsEntered, bar: "from-primary to-primary/40", iconColor: "text-primary", glow: "hover:shadow-[0_12px_36px_-16px_hsl(263_85%_62%/0.5)]" },
                  { icon: Code, label: "Solved", value: profile.challengesSolved, bar: "from-secondary to-secondary/40", iconColor: "text-secondary", glow: "hover:shadow-[0_12px_36px_-16px_hsl(187_96%_45%/0.5)]" },
                  { icon: Award, label: "Best Rank", value: `#${profile.bestRank}`, bar: "from-warning to-warning/40", iconColor: "text-warning", glow: "hover:shadow-[0_12px_36px_-16px_hsl(38_95%_56%/0.5)]" },
                ].map(s => (
                  <div key={s.label} className={`group relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card to-surface p-5 text-center transition-all duration-300 hover:-translate-y-1 ${s.glow}`}>
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${s.bar}`} />
                    <s.icon className={`w-5 h-5 mx-auto mb-2.5 transition-transform duration-300 group-hover:scale-110 ${s.iconColor}`} />
                    <p className="font-mono text-2xl font-bold text-foreground tabular-nums">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-heading font-bold text-foreground mb-4">Recent Submissions</h2>
              <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl border border-dashed border-border bg-card/40">
                <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-3">
                  <Inbox className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-foreground font-medium text-sm">No submissions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Solve a challenge to see your history here.</p>
              </div>
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
