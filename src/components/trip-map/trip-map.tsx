import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapColors } from "@/hooks";
import { boundsOf } from "@/lib/geo";
import { LAYER_IDS, MAP_STYLES } from "@/lib/map";
import { maplibregl } from "@/lib/maplibre";
import {
  allRoutesBounds,
  frameTimeMs,
  getRoute,
  routeLabelPosition,
  truckPositionAt,
} from "@/lib/trip-plan";
import { useTripViewStore } from "@/store";
import type { TripPlan } from "@/types";
import { CheckpointPopup } from "./checkpoint-popup";
import { HeatmapControl } from "./heatmap-control";
import { HeatmapLayer } from "./heatmap-layer";
import { EndpointMarker, RouteLabelMarker, TruckMarker } from "./map-markers";
import { RiskLegend } from "./risk-legend";
import { RouteLayers } from "./route-layers";

// Extra bottom padding keeps routes clear of the heatmap slider card
const FIT_PADDING = { top: 60, bottom: 170, left: 60, right: 60 };

export function TripMap({ plan }: { plan: TripPlan }) {
  const mapRef = useRef<MapRef>(null);
  const { isDark } = useMapColors();
  const [cursor, setCursor] = useState("");

  const selectedRouteId = useTripViewStore((state) => state.selectedRouteId);
  const focused = useTripViewStore((state) => state.focusedCheckpoint);
  const heatmapHour = useTripViewStore((state) => state.heatmapHour);
  const heatmapVisible = useTripViewStore((state) => state.heatmapVisible);
  const selectRoute = useTripViewStore((state) => state.selectRoute);
  const focusCheckpoint = useTripViewStore((state) => state.focusCheckpoint);

  const selectedRoute = getRoute(plan, selectedRouteId);
  const initialBounds = useMemo(() => allRoutesBounds(plan), [plan]);
  const truck = truckPositionAt(selectedRoute, frameTimeMs(plan.heatmap, heatmapHour));

  const focusedRoute = focused
    ? plan.routes.find((r) => r.id === focused.routeId)
    : undefined;
  const focusedCheckpoint = focused ? focusedRoute?.checkpoints[focused.index] : undefined;

  // Frame a newly selected route. The first render keeps the view of every route.
  const framedRouteId = useRef(selectedRoute.id);
  useEffect(() => {
    if (framedRouteId.current === selectedRoute.id) return;
    framedRouteId.current = selectedRoute.id;
    mapRef.current?.fitBounds(boundsOf(selectedRoute.geometry.coordinates), {
      padding: FIT_PADDING,
      duration: 800,
    });
  }, [selectedRoute]);

  useEffect(() => {
    if (focused?.source !== "list" || !focusedCheckpoint) return;
    const map = mapRef.current;
    map?.flyTo({
      center: [focusedCheckpoint.lon, focusedCheckpoint.lat],
      zoom: Math.max(map.getZoom(), 8),
      duration: 800,
    });
  }, [focused, focusedCheckpoint]);

  // Checkpoints win over routes when both are under the cursor
  function handleClick(e: MapMouseEvent) {
    const features = e.features ?? [];
    const checkpoint = features.find((f) => f.layer.id === LAYER_IDS.checkpoints);
    const route = features.find((f) => f.layer.id === LAYER_IDS.routeHit);

    if (checkpoint) {
      focusCheckpoint({
        routeId: checkpoint.properties.routeId,
        index: checkpoint.properties.index,
        source: "map",
      });
    } else if (route) {
      selectRoute(route.properties.routeId);
    } else {
      focusCheckpoint(null);
    }
  }

  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      mapStyle={isDark ? MAP_STYLES.dark : MAP_STYLES.light}
      initialViewState={{ bounds: initialBounds, fitBoundsOptions: { padding: FIT_PADDING } }}
      interactiveLayerIds={[LAYER_IDS.checkpoints, LAYER_IDS.routeHit]}
      cursor={cursor}
      onMouseEnter={() => setCursor("pointer")}
      onMouseLeave={() => setCursor("")}
      onClick={handleClick}
      attributionControl={{ compact: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <ScaleControl position="top-right" unit="imperial" />

      {/* Rendered first so it sits beneath the routes */}
      <HeatmapLayer heatmap={plan.heatmap} hour={heatmapHour} visible={heatmapVisible} />
      <RouteLayers routes={plan.routes} selectedId={selectedRoute.id} focused={focused} />

      {plan.routes.map((route, order) => (
        <RouteLabelMarker
          key={route.id}
          route={route}
          lngLat={routeLabelPosition(route, order)}
          selected={route.id === selectedRoute.id}
          onSelect={() => selectRoute(route.id)}
        />
      ))}
      <EndpointMarker
        kind="origin"
        lngLat={[plan.trip.origin.lon, plan.trip.origin.lat]}
        address={plan.trip.origin.address}
      />
      <EndpointMarker
        kind="destination"
        lngLat={[plan.trip.destination.lon, plan.trip.destination.lat]}
        address={plan.trip.destination.address}
      />
      <TruckMarker position={truck} />

      {focusedRoute && focusedCheckpoint && (
        <CheckpointPopup
          route={focusedRoute}
          checkpoint={focusedCheckpoint}
          onClose={() => focusCheckpoint(null)}
        />
      )}

      {/* z-10 keeps overlays above markers that pass beneath them */}
      <div className="absolute top-3 left-3 z-10 hidden sm:block">
        <RiskLegend />
      </div>
      <div className="absolute inset-x-3 bottom-8 z-10 sm:left-1/2 sm:w-[min(560px,calc(100%-24px))] sm:-translate-x-1/2">
        <HeatmapControl heatmap={plan.heatmap} truck={truck} />
      </div>
    </Map>
  );
}
