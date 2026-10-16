import { differenceInMinutes, format, isSameDay } from "date-fns";

export function formatDateTime(iso: string) {
  return format(new Date(iso), "EEE, MMM d · h:mm a");
}

// Drops the date when it's the same day as `reference`, e.g. "3:40 PM" vs "Fri 3:40 PM"
export function formatEta(iso: string, reference: string) {
  const date = new Date(iso);
  return isSameDay(date, new Date(reference))
    ? format(date, "h:mm a")
    : format(date, "EEE h:mm a");
}

export function formatElapsed(fromIso: string, toIso: string) {
  const minutes = Math.max(0, differenceInMinutes(new Date(toIso), new Date(fromIso)));
  const hours = Math.floor(minutes / 60);
  return `+${hours}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function formatMiles(miles: number) {
  return `${miles.toLocaleString(undefined, { maximumFractionDigits: 1 })} mi`;
}

export function formatWeight(lbs: number) {
  return `${lbs.toLocaleString()} lbs`;
}
