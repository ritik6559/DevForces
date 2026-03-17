import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Loader } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useGetCurrentUser } from "@/features/auth/api/use-get-current-user";
import { features } from "@/data";
import TypingHero from "@/components/TypingHero";

const Landing = () => {
  const navigate = useNavigate();

  const { data: user, isLoading } = useGetCurrentUser();

  if (user) {
    navigate("/contests");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <Logo />
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => {
              navigate("/login")
            }}
          >
            Sign In
          </Button>
      </header>

      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-32">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold tracking-tight leading-tight max-w-3xl"
        >
          <TypingHero />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl"
        >
          DevForces is where developers compete by building real backend
          features — not reversing linked lists.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 mt-8"
        >
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 cursor-pointer"
              onClick={() => {
                navigate("/contests")
              }}
            >
              Join a Contest
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
              onClick={() => {
                navigate("/contests")
              }}
            >
              View Challenges
            </Button>
        </motion.div>
      </section>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
              className="group rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/30 transition-all hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Logo size="small" />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
