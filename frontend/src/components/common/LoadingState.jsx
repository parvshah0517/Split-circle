import { cn } from "../../lib/utils";
import Spinner from "./Spinner";

export default function LoadingState({ label = "Loading...", className }) {
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-3 p-10 text-sm text-muted-foreground", className)}
    >
      <Spinner className="h-6 w-6 text-brand-600" />
      <span>{label}</span>
    </div>
  );
}
