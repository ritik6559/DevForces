/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useLoginUser } from "@/features/auth/api/use-login-user";

const Verify = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const {email, name} = (location.state as any) || { email: "your@email.com", name: "Your Name" };
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(272); // 4:32
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const { mutateAsync: login } = useLoginUser();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleChange = useCallback(
  async (index: number, value: string) => {

    if (!/^\d*$/.test(value)) return;

    const next = [...otp];
    next[index] = value.slice(-1);

    setOtp(next);
    setError(false);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (next.every((v) => v) && next.join("").length === 6) {
      try {
        await login({ email, username: name, otp: next.join("") });
        setSuccess(true);
        navigate("/contests");
      } catch (error) {
        console.log(error)
        setError(true);
        setOtp(Array(6).fill(""));
        inputsRef.current[0]?.focus();
      }
    }
  },
  [otp, navigate, email, name, login]
);

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (data.length === 6) {
      setOtp(data.split(""));
      inputsRef.current[5]?.focus();
    }
  };

  const mins = Math.floor(countdown / 60);
  const secs = countdown % 60;

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

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center py-4"
            >
              <CheckCircle className="w-12 h-12 text-success mb-3" />
              <p className="text-foreground font-medium">Verified!</p>
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </motion.div>
          ) : (
            <>
              <h1 className="text-xl font-heading font-bold text-foreground text-center mb-1">Check your email</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                We sent a 6-digit code to <span className="text-foreground font-mono text-xs">{email}</span>
              </p>

              <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={el => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    animate={error ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`w-11 h-13 text-center text-lg font-mono rounded-lg border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${
                      error ? "border-destructive" : "border-border"
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-xs text-destructive text-center mb-3">Invalid code. Try again.</p>}

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    Resend in {mins}:{secs.toString().padStart(2, "0")}
                  </p>
                ) : (
                  <Button variant="ghost" size="sm" className="text-primary text-xs" onClick={() => setCountdown(272)}>
                    Resend OTP
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Hint: use <span className="font-mono text-foreground">123456</span> for demo
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Verify;