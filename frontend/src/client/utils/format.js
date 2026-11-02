export function formatDate(isoString) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(isoString));
}

export function formatDateTime(isoString) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(isoString),
  );
}

export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export function getFirstName(name = "") {
  return name.trim().split(/\s+/)[0] ?? "";
}
