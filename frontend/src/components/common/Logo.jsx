import { cn } from "../../lib/utils";

export default function Logo({ inverted = false, className, showIcon = true }) {
  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0", className)}>
      {showIcon && (
        <div
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-xl shadow-xs shrink-0 transition-transform hover:scale-105",
            inverted ? "bg-white text-gray-900" : "bg-[#0F172A] text-white"
          )}
        >
          <span className="text-xs font-black tracking-tight">
            <span className="text-[#00C4A7]">S</span>C
          </span>
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#00C4A7] ring-2 ring-white" />
        </div>
      )}

      <div className="inline-flex items-center whitespace-nowrap">
        <span
          className={cn(
            "text-base sm:text-lg font-black uppercase font-sans tracking-wide",
            inverted ? "text-white" : "logo-aesthetic-text"
          )}
        >
          SPLITCIRCLE
        </span>
        <span className="text-[#00C4A7] font-black text-lg ml-0.5 leading-none">
          .
        </span>
      </div>
    </div>
  );
}
