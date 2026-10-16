import { useEffect, useRef } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { RiskBadge, WeatherReadings } from "@/components/shared";
import { formatElapsed, formatEta } from "@/lib/format";
import { riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";
import { useTripViewStore } from "@/store";
import type { PlannedRoute } from "@/types";

export function CheckpointList({ route }: { route: PlannedRoute }) {
  const focused = useTripViewStore((state) => state.focusedCheckpoint);
  const focusCheckpoint = useTripViewStore((state) => state.focusCheckpoint);
  const listRef = useRef<HTMLOListElement>(null);

  const focusedIndex = focused?.routeId === route.id ? focused.index : null;

  // Bring a checkpoint clicked on the map into view in the list
  useEffect(() => {
    if (focusedIndex === null || focused?.source !== "map") return;
    listRef.current
      ?.querySelector(`[data-index="${focusedIndex}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [focusedIndex, focused]);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {route.checkpoints.length} checkpoints every {route.sample_interval_miles} mi on{" "}
        <span className="font-medium text-foreground">{route.label}</span>. Weather is the
        forecast for when the truck reaches each one.
      </p>

      <ol ref={listRef} className="flex flex-col">
        {route.checkpoints.map((cp, i) => {
          const isLast = i === route.checkpoints.length - 1;
          const isFocused = cp.index === focusedIndex;
          return (
            <li key={cp.index} data-index={cp.index} className="relative flex gap-3">
              {/* Timeline rail */}
              <div className="flex w-3 flex-col items-center pt-4">
                <span
                  className="z-10 size-3 shrink-0 rounded-full border-2 border-background"
                  style={{ backgroundColor: riskColor(cp.risk_level) }}
                />
                {!isLast && <span className="-mb-4 w-px flex-1 bg-border" />}
              </div>

              <button
                type="button"
                onClick={() =>
                  focusCheckpoint({ routeId: route.id, index: cp.index, source: "list" })
                }
                className={cn(
                  "mb-1 flex flex-1 flex-col gap-1.5 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/60",
                  isFocused && "bg-muted",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium tabular-nums">
                      {i === 0 ? "Origin" : isLast ? "Destination" : `Mile ${cp.mile}`}
                      <span className="ml-2 font-normal text-muted-foreground">
                        {formatEta(cp.eta, route.departure_time)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {formatElapsed(route.departure_time, cp.eta)}
                      {cp.weather && ` · ${cp.weather.condition}`}
                    </p>
                  </div>
                  <RiskBadge level={cp.risk_level} />
                </div>

                {cp.weather ? (
                  <WeatherReadings
                    weather={cp.weather}
                    risk={cp.risk}
                    className="grid-cols-4"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">Beyond the forecast window</p>
                )}

                {cp.risk?.load_escalated && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <AlertTriangleIcon className="size-3.5" />
                    Wind risk raised for this load weight
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
