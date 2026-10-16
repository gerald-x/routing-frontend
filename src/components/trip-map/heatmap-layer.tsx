import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import { useMapColors } from "@/hooks";
import { heatmapFeatures } from "@/lib/trip-plan";
import type { Heatmap } from "@/types";

interface HeatmapLayerProps {
  heatmap: Heatmap;
  hour: number;
  visible: boolean;
}

/*
Why blurred circles instead of MapLibre's `heatmap` layer:
- A `heatmap` layer adds up overlapping points
- Checkpoints are dense along the corridor, so many Low points would add up to look "hot"
- Here, color always equals the forecast risk at that spot; higher risk draws on top
*/
export function HeatmapLayer({ heatmap, hour, visible }: HeatmapLayerProps) {
  const { risk } = useMapColors();
  const data = useMemo(() => heatmapFeatures(heatmap, hour), [heatmap, hour]);

  return (
    <Source id="weather-heatmap" type="geojson" data={data}>
      <Layer
        id="weather-heatmap"
        type="circle"
        layout={{
          visibility: visible ? "visible" : "none",
          "circle-sort-key": ["get", "score"],
        }}
        paint={{
          "circle-color": [
            "step",
            ["get", "score"],
            risk.Low,
            1,
            risk.Moderate,
            2,
            risk.High,
            3,
            risk.Severe,
            4,
            risk["No Travel"],
          ],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 10, 6, 24, 10, 60],
          "circle-blur": 0.9,
          // Low stays faint so the risky stretches stand out
          "circle-opacity": ["interpolate", ["linear"], ["get", "score"], 0, 0.3, 4, 0.65],
        }}
      />
    </Source>
  );
}
