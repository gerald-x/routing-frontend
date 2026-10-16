import type { Place } from "./trip";

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe" | "No Travel";

// "Unknown" = the checkpoint's ETA is beyond the forecast window
export type RiskLevelOrUnknown = RiskLevel | "Unknown";

export type RiskFactor = "wind" | "rain" | "snow";

export type SampleInterval = 10 | 25 | 50;

export interface CheckpointWeather {
  wind_mph: number;
  rain_in_hr: number;
  snow_in_hr: number;
  temp_f: number;
  condition: string;
}

export interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: Record<RiskFactor, RiskLevel>;
  drivers: RiskFactor[];
  load_escalated: boolean;
}

export interface Checkpoint {
  index: number;
  mile: number;
  lat: number;
  lon: number;
  eta: string;
  weather: CheckpointWeather | null;
  risk: RiskAssessment | null;
  risk_level: RiskLevelOrUnknown;
}

export interface RiskSummary {
  miles_by_level: Record<RiskLevel, number>;
  unknown_miles: number;
  average_risk_score: number | null;
  peak_risk_level: RiskLevelOrUnknown;
  peak_checkpoint_mile: number | null;
}

export type LngLat = [lon: number, lat: number];

export interface PlannedRoute {
  id: string;
  label: string;
  distance_miles: number;
  duration_seconds: number;
  duration_text: string;
  departure_time: string;
  arrival_time: string;
  has_tolls: boolean;
  sample_interval_miles: SampleInterval;
  geometry: { type: "LineString"; coordinates: LngLat[] };
  checkpoints: Checkpoint[];
  risk_summary: RiskSummary;
  summary: string;
  rank: number;
  is_recommended: boolean;
}

/*
Each frame's arrays line up index-for-index with `Heatmap.points`:
    frame.risk_scores[i] → points[i]
null = no forecast for that point at that hour
*/
export interface HeatmapFrame {
  hour_offset: number;
  time: string;
  risk_scores: (number | null)[];
  wind_mph: (number | null)[];
  rain_in_hr: (number | null)[];
  snow_in_hr: (number | null)[];
}

export interface Heatmap {
  start_time: string;
  hours: number;
  max_risk_score: number;
  risk_levels: RiskLevel[];
  points: { lat: number; lon: number }[];
  frames: HeatmapFrame[];
}

export interface TripPlan {
  trip: {
    origin: Place;
    destination: Place;
    departure_time: string;
    load_weight_lbs: number;
    recommended_route_id: string;
    recommendation_reason: string;
  };
  routes: PlannedRoute[];
  heatmap: Heatmap;
}

export interface ApiErrorResponse {
  error: string;
}

export type TruckStatus = "not-departed" | "en-route" | "arrived";

export interface TruckPosition {
  lngLat: LngLat;
  mile: number;
  status: TruckStatus;
}
