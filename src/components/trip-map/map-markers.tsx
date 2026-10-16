import { Marker } from "react-map-gl/maplibre";
import { StarIcon, TruckIcon } from "lucide-react";
import { riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";
import type { LngLat, PlannedRoute, TruckPosition } from "@/types";

interface EndpointMarkerProps {
  lngLat: LngLat;
  kind: "origin" | "destination";
  address: string;
}

export function EndpointMarker({ lngLat, kind, address }: EndpointMarkerProps) {
  return (
    <Marker longitude={lngLat[0]} latitude={lngLat[1]} anchor="center">
      <div
        title={address}
        className={cn(
          "flex size-7 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-white shadow-md",
          kind === "origin" ? "bg-emerald-600" : "bg-foreground text-background",
        )}
      >
        {kind === "origin" ? "A" : "B"}
      </div>
    </Marker>
  );
}

interface RouteLabelMarkerProps {
  route: PlannedRoute;
  lngLat: LngLat;
  selected: boolean;
  onSelect: () => void;
}

export function RouteLabelMarker({ route, lngLat, selected, onSelect }: RouteLabelMarkerProps) {
  return (
    <Marker longitude={lngLat[0]} latitude={lngLat[1]} anchor="bottom" style={{ zIndex: selected ? 2 : 1 }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        className={cn(
          "mb-2 flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-medium whitespace-nowrap shadow-md transition-colors",
          selected ? "border-(--route-selected) ring-2 ring-(--route-selected)/30" : "opacity-90 hover:opacity-100",
        )}
      >
        {route.is_recommended && (
          <StarIcon className="size-3 fill-amber-400 text-amber-400" />
        )}
        <span>{route.label}</span>
        <span className="text-muted-foreground">{route.duration_text}</span>
        <span
          title={`Peak risk: ${route.risk_summary.peak_risk_level}`}
          className="size-2 rounded-full"
          style={{ backgroundColor: riskColor(route.risk_summary.peak_risk_level) }}
        />
      </button>
    </Marker>
  );
}

const TRUCK_STATUS_TEXT = {
  "not-departed": "Not departed yet",
  "en-route": "En route",
  arrived: "Arrived",
};

export function TruckMarker({ position }: { position: TruckPosition }) {
  return (
    <Marker longitude={position.lngLat[0]} latitude={position.lngLat[1]} anchor="center" style={{ zIndex: 3 }}>
      <div
        title={`${TRUCK_STATUS_TEXT[position.status]} · mile ${Math.round(position.mile)}`}
        className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-(--route-selected) text-white shadow-lg"
      >
        <TruckIcon className="size-4" />
      </div>
    </Marker>
  );
}
