import { Link } from "react-router-dom";

const Logo = ({ size = "default" }: { size?: "default" | "small" }) => {
  const textClass = size === "small" ? "text-lg" : "text-xl";
  const markClass = size === "small" ? "h-6 w-6 text-[13px]" : "h-7 w-7 text-sm";

  return (
    <Link
      to="/"
      className={`group font-heading font-extrabold ${textClass} tracking-tight flex items-center gap-2`}
    >
      <span
        className={`${markClass} grid place-items-center rounded-md bg-primary/15 border border-primary/30 font-mono text-primary shadow-[inset_0_1px_0_hsl(0_0%_100%/0.08)] transition-all duration-300 group-hover:bg-primary/25 group-hover:border-primary/50 group-hover:shadow-[0_0_18px_-2px_hsl(263_85%_62%/0.55)]`}
      >
        {"<>"}
      </span>
      <span className="flex items-center">
        <span className="text-foreground">Dev</span>
        <span className="text-gradient-violet">Forces</span>
      </span>
    </Link>
  );
};

export default Logo;
