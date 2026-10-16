import { useMemo } from "react";
import { RISK_COLOR_VARS } from "@/lib/risk";
import type { RiskLevelOrUnknown } from "@/types";
import { useIsDark } from "./use-is-dark";

/*
MapLibre paints on a canvas and can't resolve `var(--x)`,
so the CSS variables are read into plain values here.
Re-read whenever the theme flips.
*/
export function useMapColors() {
  const isDark = useIsDark();

  return useMemo(() => {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string) => style.getPropertyValue(name).trim();

    const risk = Object.fromEntries(
      Object.entries(RISK_COLOR_VARS).map(([level, cssVar]) => [level, read(cssVar)]),
    ) as Record<RiskLevelOrUnknown, string>;

    return {
      isDark,
      risk,
      routeSelected: read("--route-selected"),
      routeInactive: read("--route-inactive"),
      routeCasing: read("--route-casing"),
    };
  }, [isDark]);
}
