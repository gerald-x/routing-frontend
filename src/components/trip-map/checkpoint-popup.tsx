import { Popup } from "react-map-gl/maplibre";
import { AlertTriangleIcon } from "lucide-react";
import { RiskBadge, WeatherReadings } from "@/components/shared";
import { formatDateTime, formatElapsed } from "@/lib/format";
import { RISK_FACTOR_LABELS } from "@/lib/risk";
import type { Checkpoint, PlannedRoute } from "@/types";

interface CheckpointPopupProps {
  route: PlannedRoute;
  checkpoint: Checkpoint;
  onClose: () => void;
}

export function CheckpointPopup({ route, checkpoint, onClose }: CheckpointPopupProps) {
  const { weather, risk } = checkpoint;

  return (
    <Popup
      longitude={checkpoint.lon}
      latitude={checkpoint.lat}
      anchor="bottom"
      offset={14}
      closeOnClick={false}
      onClose={onClose}
      maxWidth="280px"
    >
      <div className="flex flex-col gap-2 pr-4">
        <div>
          <p className="text-xs text-muted-foreground">
            {route.label} · mile {checkpoint.mile}
          </p>
          <p className="text-sm font-medium">{formatDateTime(checkpoint.eta)}</p>
          <p className="text-xs text-muted-foreground">
            {formatElapsed(route.departure_time, checkpoint.eta)} after departure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge level={checkpoint.risk_level} />
          {weather && <span className="truncate text-xs">{weather.condition}</span>}
        </div>

        {weather ? (
          <WeatherReadings weather={weather} risk={risk} />
        ) : (
          <p className="text-xs text-muted-foreground">
            The truck arrives here after the end of the forecast window.
          </p>
        )}

        {risk && risk.drivers.length > 0 && (
          <p className="text-xs">
            Driven by {risk.drivers.map((d) => RISK_FACTOR_LABELS[d].toLowerCase()).join(" and ")}
          </p>
        )}
        {risk?.load_escalated && (
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <AlertTriangleIcon className="mt-px size-3.5 shrink-0" />
            Wind risk raised because of the load weight.
          </p>
        )}
      </div>
    </Popup>
  );
}
