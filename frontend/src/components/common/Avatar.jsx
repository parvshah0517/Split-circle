import { useState } from "react";
import { cn } from "../../lib/utils";
import { getInitials } from "../../utils/format";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const tones = [
  "bg-[#D9F99D] text-[#3F6212]", // Lime like Billie Eilish
  "bg-[#FEF08A] text-[#854D0E]", // Sunny Yellow like Taylor Swift
  "bg-[#CCFBF1] text-[#115E59]", // Soft Teal
  "bg-[#FED7AA] text-[#9A3412]", // Warm Peach
  "bg-[#E0E7FF] text-[#3730A3]", // Soft Indigo
];

function getToneForName(name) {
  if (!name) return tones[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tones[Math.abs(hash) % tones.length];
}

export default function Avatar({
  name = "",
  src,
  size = "md",
  shape = "squircle", // 'squircle' or 'circle'
  className,
}) {
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && src !== failedSrc;
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-[22px]";
  const toneClass = getToneForName(name);

  if (showImage) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 object-cover shadow-xs", shapeClass, sizes[size], className)}
      />
    );
  }

  return (
    <div
      aria-label={name}
      role="img"
      className={cn(
        "flex shrink-0 items-center justify-center font-bold tracking-tight shadow-xs",
        shapeClass,
        toneClass,
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
