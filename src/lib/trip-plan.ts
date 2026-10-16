import type { FeatureCollection, LineString, Point } from "geojson";
import type { Heatmap, LngLat, PlannedRoute, TripPlan, TruckPosition } from "@/types";
import { boundsOf, cumulativeMiles, pointAlongLine } from "./geo";

export function getRoute(plan: TripPlan, routeId: string | null) {
  return (
    plan.routes.find((route) => route.id === routeId) ??
    plan.routes.find((route) => route.id === plan.trip.recommended_route_id) ??
    plan.routes[0]
  );
}

export function routesByRank(plan: TripPlan) {
  return [...plan.routes].sort((a, b) => a.rank - b.rank);
}

export function allRoutesBounds(plan: TripPlan) {
  return boundsOf(plan.routes.flatMap((route) => route.geometry.coordinates));
}

export function routeFeatures(
  routes: PlannedRoute[],
  selectedId: string,
): FeatureCollection<LineString> {
  return {
    type: "FeatureCollection",
    features: routes.map((route) => ({
      type: "Feature",
      id: route.id,
      properties: { routeId: route.id, selected: route.id === selectedId },
      geometry: route.geometry,
    })),
  };
}

export function checkpointFeatures(
  routes: PlannedRoute[],
  selectedId: string,
): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: routes.flatMap((route) =>
      route.checkpoints.map((cp) => ({
        type: "Feature" as const,
        properties: {
          routeId: route.id,
          index: cp.index,
          riskLevel: cp.risk_level,
          selected: route.id === selectedId,
        },
        geometry: { type: "Point" as const, coordinates: [cp.lon, cp.lat] },
      })),
    ),
  };
}

// Points with no forecast for this hour are left out instead of drawn as Low
export function heatmapFeatures(heatmap: Heatmap, hour: number): FeatureCollection<Point> {
  const frame = heatmap.frames[hour];
  return {
    type: "FeatureCollection",
    features: heatmap.points.flatMap((point, i) => {
      const score = frame?.risk_scores[i];
      if (score == null) return [];
      return [
        {
          type: "Feature" as const,
          properties: { score },
          geometry: { type: "Point" as const, coordinates: [point.lon, point.lat] },
        },
      ];
    }),
  };
}

export function frameTimeMs(heatmap: Heatmap, hour: number) {
  return new Date(heatmap.start_time).getTime() + hour * 3_600_000;
}

/*
Where the truck is at a given time on a route:

Checkpoint ETAs give (time, mile) pairs
    ↓
Interpolate the mile reached at `timeMs`
    ↓
Walk that far along the route line to get a point
*/
export function truckPositionAt(route: PlannedRoute, timeMs: number): TruckPosition {
  const coords = route.geometry.coordinates;
  const checkpoints = route.checkpoints;
  const first = new Date(checkpoints[0].eta).getTime();
  const last = new Date(checkpoints[checkpoints.length - 1].eta).getTime();

  if (timeMs <= first) return { lngLat: coords[0], mile: 0, status: "not-departed" };
  if (timeMs >= last) {
    return {
      lngLat: coords[coords.length - 1],
      mile: route.distance_miles,
      status: "arrived",
    };
  }

  let mile = 0;
  for (let i = 1; i < checkpoints.length; i++) {
    const t1 = new Date(checkpoints[i].eta).getTime();
    if (t1 < timeMs) continue;
    const t0 = new Date(checkpoints[i - 1].eta).getTime();
    const ratio = t1 === t0 ? 1 : (timeMs - t0) / (t1 - t0);
    mile = checkpoints[i - 1].mile + (checkpoints[i].mile - checkpoints[i - 1].mile) * ratio;
    break;
  }

  const lngLat = pointAlongLine(coords, cumulativeMiles(coords), mile / route.distance_miles);
  return { lngLat, mile, status: "en-route" };
}

// Spread label positions out so labels of overlapping routes don't stack
export function routeLabelPosition(route: PlannedRoute, order: number): LngLat {
  const coords = route.geometry.coordinates;
  const fraction = 0.3 + ((order * 0.2) % 0.5);
  return pointAlongLine(coords, cumulativeMiles(coords), fraction);
}
