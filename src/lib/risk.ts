import type { RiskFactor, RiskLevel, RiskLevelOrUnknown } from "@/types";

export const RISK_LEVELS: RiskLevel[] = ["Low", "Moderate", "High", "Severe", "No Travel"];

// CSS variables live in index.css with light and dark variants
export const RISK_COLOR_VARS: Record<RiskLevelOrUnknown, string> = {
  Low: "--risk-low",
  Moderate: "--risk-moderate",
  High: "--risk-high",
  Severe: "--risk-severe",
  "No Travel": "--risk-no-travel",
  Unknown: "--risk-unknown",
};

export function riskColor(level: RiskLevelOrUnknown) {
  return `var(${RISK_COLOR_VARS[level]})`;
}

export const RISK_FACTOR_LABELS: Record<RiskFactor, string> = {
  wind: "Wind",
  rain: "Rain",
  snow: "Snow",
};

export function riskLevelFromScore(score: number): RiskLevel {
  return RISK_LEVELS[Math.min(Math.max(Math.round(score), 0), RISK_LEVELS.length - 1)];
}
