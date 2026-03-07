import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers, Zap, Trophy, Github } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const phrases = [
  "Build Real Projects.",
  "Ship Real Code.",
  "Compete With Developers.",
];

function TypingHero() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const current = phrases[phraseIndex];

  useEffect(() => {
    const speed = deleting ? 30 : 60;
    const timeout = setTimeout(() => {
      if (!deleting && charIndex < current.length) {
        setCharIndex(charIndex + 1);
      } else if (!deleting && charIndex === current.length) {
        setTimeout(() => setDeleting(true), 1500);
      } else if (deleting && charIndex > 0) {
        setCharIndex(charIndex - 1);
      } else if (deleting && charIndex === 0) {
        setDeleting(false);
        setPhraseIndex((phraseIndex + 1) % phrases.length);
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, phraseIndex, current.length]);

  return (
    <span className="text-primary">
      {current.slice(0, charIndex)}
      <span className="border-r-2 animate-typing-cursor ml-0.5">&nbsp;</span>
    </span>
  );
}

const features = [
  {
    icon: Layers,
    title: "Real Projects",
    description: "Build actual REST APIs, auth systems, and more — not toy problems.",
  },
  {
    icon: Zap,
    title: "Instant Evaluation",
    description: "Your code runs in a sandbox and gets graded in seconds.",
  },
  {
    icon: Trophy,
    title: "Live Leaderboard",
    description: "Compete in real-time and watch your rank update live.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Simple nav */}
      <header className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <Logo />
        <Link to="/login">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero */}
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
          DevForces is where developers compete by building real backend features — not reversing linked lists.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 mt-8"
        >
          <Link to="/contests">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6">
              Join a Contest
            </Button>
          </Link>
          <Link to="/contests">
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted">
              View Challenges
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Features */}
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
              <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Logo size="small" />
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
