import { StarIcon } from "lucide-react";
import { RiskBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { formatEta, formatMiles } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PlannedRoute } from "@/types";
import { RiskBar } from "./risk-bar";

interface RouteCardProps {
  route: PlannedRoute;
  selected: boolean;
  onSelect: () => void;
}

export function RouteCard({ route, selected, onSelect }: RouteCardProps) {
  const { risk_summary: risk } = route;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "w-full rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50",
        selected && "border-(--route-selected) ring-2 ring-(--route-selected)/25",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
            {route.rank}
          </span>
          <span className="font-medium">{route.label}</span>
          {route.is_recommended && (
            <Badge className="gap-1">
              <StarIcon className="size-3 fill-current" />
              Best
            </Badge>
          )}
          {route.has_tolls && <Badge variant="outline">Tolls</Badge>}
        </div>
        <RiskBadge level={risk.peak_risk_level} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Distance</dt>
          <dd className="font-medium tabular-nums">{formatMiles(route.distance_miles)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Drive time</dt>
          <dd className="font-medium tabular-nums">{route.duration_text}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Arrives</dt>
          <dd className="font-medium tabular-nums">
            {formatEta(route.arrival_time, route.departure_time)}
          </dd>
        </div>
      </dl>

      <RiskBar summary={risk} className="mt-3" />
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{route.summary}</p>
    </button>
  );
}
