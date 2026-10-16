import { riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";
import type { RiskLevelOrUnknown } from "@/types";

interface RiskBadgeProps {
  level: RiskLevelOrUnknown;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  const color = riskColor(level);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground",
        className,
      )}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)` }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {level === "Unknown" ? "No forecast" : level}
    </span>
  );
}
