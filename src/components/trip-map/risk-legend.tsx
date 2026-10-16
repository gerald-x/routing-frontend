import { RISK_LEVELS, riskColor } from "@/lib/risk";

export function RiskLegend() {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border bg-background/95 p-2.5 text-xs shadow-md backdrop-blur">
      <p className="font-medium">Weather risk</p>
      <ul className="flex flex-col gap-1">
        {[...RISK_LEVELS, "Unknown" as const].map((level) => (
          <li key={level} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: riskColor(level) }} />
            {level === "Unknown" ? "No forecast" : level}
          </li>
        ))}
      </ul>
      <div className="mt-1 flex flex-col gap-1 border-t pt-1.5">
        <span className="flex items-center gap-2">
          <span className="h-1 w-4 rounded-full bg-(--route-selected)" />
          Selected route
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-4 border-t-2 border-dashed border-(--route-inactive)" />
          Other routes
        </span>
      </div>
    </div>
  );
}
