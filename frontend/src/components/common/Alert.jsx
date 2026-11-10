import { cn } from "../../lib/utils";

const variants = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-teal-200 bg-teal-50 text-teal-800",
};

export default function Alert({ variant = "info", className, children }) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("rounded-2xl border px-4 py-3 text-xs font-medium", variants[variant], className)}>
      {children}
    </div>
  );
}
