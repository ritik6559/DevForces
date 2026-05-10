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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 rounded-full bg-primary/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="rounded-2xl border border-border bg-card p-8 glow-violet-sm">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-xl font-heading font-bold text-foreground text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter your username and email to sign in or get started
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
            <input
                type="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all mb-2"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            New here? Enter your email to get started.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;