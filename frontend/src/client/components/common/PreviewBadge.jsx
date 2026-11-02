export default function PreviewBadge({ label = "Preview data" }) {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      {label}
    </span>
  );
}
