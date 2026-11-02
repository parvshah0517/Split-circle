import { useState } from "react";
import { cn } from "../../lib/utils";
import { getInitials } from "../../utils/format";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
};

export default function Avatar({ name = "", src, size = "md", className }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && src !== failedSrc;

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-full object-cover", sizes[size], className)}
      />
    );
  }

  return (
    <div
      aria-label={name}
      role="img"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
        sizes[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
