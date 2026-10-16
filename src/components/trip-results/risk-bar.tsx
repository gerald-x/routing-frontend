import { formatMiles } from "@/lib/format";
import { RISK_LEVELS, riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";
import type { RiskSummary } from "@/types";

interface RiskBarProps {
  summary: RiskSummary;
  className?: string;
}

// Share of the route's miles at each risk level, left to right from Low to No Travel
export function RiskBar({ summary, className }: RiskBarProps) {
  const segments = [
    ...RISK_LEVELS.map((level) => ({ level, miles: summary.miles_by_level[level] })),
    { level: "Unknown" as const, miles: summary.unknown_miles },
  ].filter((segment) => segment.miles > 0);
  const total = segments.reduce((sum, segment) => sum + segment.miles, 0) || 1;

  return (
    <div
      className={cn("flex h-2 w-full gap-px overflow-hidden rounded-full bg-muted", className)}
      role="img"
      aria-label={segments.map((s) => `${s.level}: ${formatMiles(s.miles)}`).join(", ")}
    >
      {segments.map(({ level, miles }) => (
        <div
          key={level}
          title={`${level === "Unknown" ? "No forecast" : level}: ${formatMiles(miles)}`}
          style={{ width: `${(miles / total) * 100}%`, backgroundColor: riskColor(level) }}
        />
      ))}
    </div>
  );
}
