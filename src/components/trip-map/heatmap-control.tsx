import { useEffect, useState } from "react";
import { format } from "date-fns";
import { PauseIcon, PlayIcon, TruckIcon } from "lucide-react";
import { RiskBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { riskLevelFromScore } from "@/lib/risk";
import { frameTimeMs } from "@/lib/trip-plan";
import { useTripViewStore } from "@/store";
import type { Heatmap, TruckPosition } from "@/types";

const PLAY_STEP_MS = 700;
const TICKS = [0, 12, 24, 36, 48];

const TRUCK_STATUS_TEXT = {
  "not-departed": "Truck hasn't departed yet",
  "en-route": "Truck en route",
  arrived: "Truck has arrived",
};

interface HeatmapControlProps {
  heatmap: Heatmap;
  truck: TruckPosition;
}

export function HeatmapControl({ heatmap, truck }: HeatmapControlProps) {
  const hour = useTripViewStore((state) => state.heatmapHour);
  const setHour = useTripViewStore((state) => state.setHeatmapHour);
  const visible = useTripViewStore((state) => state.heatmapVisible);
  const setVisible = useTripViewStore((state) => state.setHeatmapVisible);
  const [playing, setPlaying] = useState(false);

  // Steps through the hours, stopping at the end of the forecast
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      const current = useTripViewStore.getState().heatmapHour;
      if (current >= heatmap.hours) {
        setPlaying(false);
        return;
      }
      setHour(current + 1);
    }, PLAY_STEP_MS);
    return () => clearInterval(interval);
  }, [playing, heatmap.hours, setHour]);

  function togglePlay() {
    if (!playing && hour >= heatmap.hours) setHour(0);
    setPlaying(!playing);
  }

  const scores = heatmap.frames[hour]?.risk_scores.filter((s): s is number => s !== null) ?? [];
  const peakLevel = scores.length ? riskLevelFromScore(Math.max(...scores)) : "Unknown";

  return (
    <div className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Switch id="heatmap-visible" checked={visible} onCheckedChange={setVisible} />
          <Label htmlFor="heatmap-visible">Weather heatmap</Label>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium tabular-nums">
            {format(frameTimeMs(heatmap, hour), "EEE h:mm a")}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {hour === 0 ? "Now" : `+${hour}h`}
          </span>
          <RiskBadge level={peakLevel} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          onClick={togglePlay}
          aria-label={playing ? "Pause forecast" : "Play forecast"}
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </Button>
        <div className="flex-1">
          <Slider
            min={0}
            max={heatmap.hours}
            step={1}
            value={[hour]}
            onValueChange={([next]) => {
              setPlaying(false);
              setHour(next);
            }}
            aria-label="Forecast hour"
          />
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground tabular-nums">
            {TICKS.map((tick) => (
              <span key={tick}>{tick === 0 ? "Now" : `+${tick}h`}</span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <TruckIcon className="size-3.5" />
        {TRUCK_STATUS_TEXT[truck.status]}
        {truck.status === "en-route" && ` · mile ${Math.round(truck.mile)}`}
        <span className="hidden sm:inline">· badge shows the worst risk on the corridor at this hour</span>
      </p>
    </div>
  );
}
