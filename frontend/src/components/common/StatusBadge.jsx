
import { cn } from "../../lib/utils";

const styles = {
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING_APPROVAL: {
    label: "Pending approval",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export default function StatusBadge({ status, className }) {
  const style = styles[status] ?? {
    label: status || "Unknown",
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  );
}
