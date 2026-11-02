import { cn } from "../../lib/utils";

export default function Logo({ inverted = false, className }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold",
          inverted ? "bg-white text-brand-700" : "bg-brand-600 text-white",
        )}
      >
        SC
      </div>
      <span className={cn("text-base font-bold tracking-tight", inverted ? "text-white" : "text-foreground")}>
        SplitCircle
      </span>
    </div>
  );
}
