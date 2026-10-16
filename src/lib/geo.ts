import type { LngLat } from "@/types";

const EARTH_RADIUS_MI = 3958.8;

function haversineMiles([lon1, lat1]: LngLat, [lon2, lat2]: LngLat) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
}

export function cumulativeMiles(coords: LngLat[]) {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) {
    cum.push(cum[i - 1] + haversineMiles(coords[i - 1], coords[i]));
  }
  return cum;
}

// Point at `fraction` (0–1) of the line's length, walking along the line
export function pointAlongLine(coords: LngLat[], cum: number[], fraction: number): LngLat {
  const target = Math.min(Math.max(fraction, 0), 1) * cum[cum.length - 1];
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const segment = cum[i] - cum[i - 1] || 1;
  const t = (target - cum[i - 1]) / segment;
  const [lon1, lat1] = coords[i - 1];
  const [lon2, lat2] = coords[i];
  return [lon1 + (lon2 - lon1) * t, lat1 + (lat2 - lat1) * t];
}

export function boundsOf(coords: LngLat[]): [LngLat, LngLat] {
  let [minLon, minLat] = coords[0];
  let [maxLon, maxLat] = coords[0];
  for (const [lon, lat] of coords) {
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
