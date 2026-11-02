import { cn } from "../../lib/utils";
import Spinner from "./Spinner";

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 focus-visible:ring-brand-500",
  secondary: "border border-border bg-white text-foreground shadow-sm hover:bg-muted focus-visible:ring-brand-500",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-brand-500",
  danger: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 focus-visible:ring-destructive",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  type = "button",
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
