import { CloudRainIcon, SnowflakeIcon, ThermometerIcon, WindIcon } from "lucide-react";
import { riskColor } from "@/lib/risk";
import { cn } from "@/lib/utils";
import type { CheckpointWeather, RiskAssessment } from "@/types";

const READINGS = [
  {
    label: "Temperature",
    factor: null,
    icon: ThermometerIcon,
    format: (w: CheckpointWeather) => `${Math.round(w.temp_f)}°F`,
  },
  {
    label: "Wind",
    factor: "wind",
    icon: WindIcon,
    format: (w: CheckpointWeather) => `${Math.round(w.wind_mph)} mph`,
  },
  {
    label: "Rain",
    factor: "rain",
    icon: CloudRainIcon,
    format: (w: CheckpointWeather) => `${w.rain_in_hr.toFixed(2)} in/h`,
  },
  {
    label: "Snow",
    factor: "snow",
    icon: SnowflakeIcon,
    format: (w: CheckpointWeather) => `${w.snow_in_hr.toFixed(1)} in/h`,
  },
] as const;

interface WeatherReadingsProps {
  weather: CheckpointWeather;
  risk: RiskAssessment | null;
  className?: string;
}

// Readings that drive the risk level are bold and tinted with that level's color
export function WeatherReadings({ weather, risk, className }: WeatherReadingsProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground",
        className,
      )}
    >
      {READINGS.map(({ label, factor, icon: Icon, format }) => {
        const isDriver = !!factor && !!risk?.drivers.includes(factor);
        return (
          <span
            key={label}
            title={label}
            className={cn(
              "flex items-center gap-1 whitespace-nowrap",
              isDriver && "font-semibold text-foreground",
            )}
          >
            <Icon
              className="size-3.5"
              style={isDriver && risk ? { color: riskColor(risk.level) } : undefined}
            />
            {format(weather)}
          </span>
        );
      })}
    </div>
  );
}
