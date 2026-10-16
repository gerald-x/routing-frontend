import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { ExpressionSpecification } from "maplibre-gl";
import { useMapColors } from "@/hooks";
import { LAYER_IDS } from "@/lib/map";
import { checkpointFeatures, routeFeatures } from "@/lib/trip-plan";
import type { PlannedRoute } from "@/types";
import type { FocusedCheckpoint } from "@/store";

interface RouteLayersProps {
  routes: PlannedRoute[];
  selectedId: string;
  focused: FocusedCheckpoint | null;
}

const IS_SELECTED: ExpressionSpecification = ["==", ["get", "selected"], true];
const IS_INACTIVE: ExpressionSpecification = ["==", ["get", "selected"], false];

/*
Draw order (bottom → top):
- other routes (grey, dashed)
- selected route (casing + colored line)
- invisible wide line for easier clicking
- checkpoints colored by risk, selected route's on top
- ring around the focused checkpoint
*/
export function RouteLayers({ routes, selectedId, focused }: RouteLayersProps) {
  const colors = useMapColors();
  const routeData = useMemo(() => routeFeatures(routes, selectedId), [routes, selectedId]);
  const checkpointData = useMemo(
    () => checkpointFeatures(routes, selectedId),
    [routes, selectedId],
  );

  const riskColorExpression: ExpressionSpecification = [
    "match",
    ["get", "riskLevel"],
    "Low",
    colors.risk.Low,
    "Moderate",
    colors.risk.Moderate,
    "High",
    colors.risk.High,
    "Severe",
    colors.risk.Severe,
    "No Travel",
    colors.risk["No Travel"],
    colors.risk.Unknown,
  ];

  const focusFilter: ExpressionSpecification = focused
    ? [
        "all",
        ["==", ["get", "routeId"], focused.routeId],
        ["==", ["get", "index"], focused.index],
      ]
    : ["==", ["get", "index"], -1];

  return (
    <>
      <Source id="routes" type="geojson" data={routeData}>
        <Layer
          id="route-inactive"
          type="line"
          filter={IS_INACTIVE}
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{
            "line-color": colors.routeInactive,
            "line-width": 4,
            "line-opacity": 0.85,
            "line-dasharray": [2, 1.5],
          }}
        />
        <Layer
          id="route-selected-casing"
          type="line"
          filter={IS_SELECTED}
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{ "line-color": colors.routeCasing, "line-width": 9 }}
        />
        <Layer
          id="route-selected"
          type="line"
          filter={IS_SELECTED}
          layout={{ "line-join": "round", "line-cap": "round" }}
          paint={{ "line-color": colors.routeSelected, "line-width": 5 }}
        />
        <Layer
          id={LAYER_IDS.routeHit}
          type="line"
          paint={{ "line-color": "#000", "line-opacity": 0, "line-width": 18 }}
        />
      </Source>

      <Source id="checkpoints" type="geojson" data={checkpointData}>
        <Layer
          id={LAYER_IDS.checkpoints}
          type="circle"
          layout={{ "circle-sort-key": ["case", IS_SELECTED, 1, 0] }}
          paint={{
            "circle-color": riskColorExpression,
            "circle-radius": ["case", IS_SELECTED, 6, 3.5],
            "circle-stroke-color": colors.routeCasing,
            "circle-stroke-width": ["case", IS_SELECTED, 2, 1],
            "circle-opacity": ["case", IS_SELECTED, 1, 0.7],
            "circle-stroke-opacity": ["case", IS_SELECTED, 1, 0.7],
          }}
        />
        <Layer
          id="checkpoint-focus"
          type="circle"
          filter={focusFilter}
          paint={{
            "circle-radius": 11,
            "circle-color": "rgba(0,0,0,0)",
            "circle-stroke-color": colors.routeSelected,
            "circle-stroke-width": 3,
          }}
        />
      </Source>
    </>
  );
}
