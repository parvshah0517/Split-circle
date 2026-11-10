import { cn } from "../../lib/utils";
import Spinner from "./Spinner";

const variants = {
  primary: "bg-[#00C4A7] text-white shadow-md shadow-teal-500/20 hover:bg-[#00b096] focus-visible:ring-teal-500",
  mint: "bg-[#00C4A7] text-white shadow-md shadow-teal-500/20 hover:bg-[#00b096] focus-visible:ring-teal-500",
  dark: "bg-[#18191E] text-white hover:bg-black shadow-sm focus-visible:ring-gray-900",
  secondary: "border border-gray-200 bg-white text-gray-800 shadow-xs hover:bg-gray-50 focus-visible:ring-teal-500",
  outline: "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-teal-500",
  ghost: "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900 focus-visible:ring-gray-400",
  danger: "bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 focus-visible:ring-destructive",
};

const sizes = {
  sm: "h-9 px-3.5 text-xs rounded-xl",
  md: "h-11 px-5 text-sm rounded-2xl",
  lg: "h-13 px-6 text-base rounded-2xl",
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
