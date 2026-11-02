import { cn } from "../../lib/utils";

const variants = {
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
};

export default function Alert({ variant = "info", className, children }) {
  return (
    <div role={variant === "error" ? "alert" : "status"} className={cn("rounded-md border px-4 py-3 text-sm", variants[variant], className)}>
      {children}
    </div>
  );
}
