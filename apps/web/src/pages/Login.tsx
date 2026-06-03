import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useSendOTP } from "@/features/auth/api/user-send-otp";

const Login = () => {
  const [email, setEmail] = useState("");
    const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { mutateAsync: sendOtp } = useSendOTP();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    try {
      await sendOtp({
        email,
        username: name
      });

      navigate("/verify", { state: { email, name } });
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="noise relative overflow-hidden rounded-3xl border border-border bg-card/90 backdrop-blur-xl p-8 glow-violet-sm shadow-2xl shadow-black/40">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-1.5 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-7 leading-relaxed">
            Enter your username and email to sign in or get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-medium text-muted-foreground">
                  Username
                </label>
                <input
                  id="name"
                  type="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-foreground text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:bg-muted focus:shadow-[0_0_0_4px_hsl(263_85%_62%/0.08)] transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted/60 border border-border text-foreground text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:bg-muted focus:shadow-[0_0_0_4px_hsl(263_85%_62%/0.08)] transition-all"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_24px_-8px_hsl(263_85%_62%/0.7)] hover:shadow-[0_0_30px_-6px_hsl(263_85%_62%/0.85)] transition-shadow"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-5">
            New here? Enter your email to get started.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;