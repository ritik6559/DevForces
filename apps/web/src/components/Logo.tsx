import { Link } from "react-router-dom";

export function Logo({ size = "default" }: { size?: "default" | "small" }) {
  const textClass = size === "small" ? "text-lg" : "text-xl";
  return (
    <Link to="/" className={`font-heading font-extrabold ${textClass} tracking-tight flex items-center gap-0`}>
      <span className="text-foreground">Dev</span>
      <span className="text-primary">Forces</span>
    </Link>
  );
}
