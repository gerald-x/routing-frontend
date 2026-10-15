import { api } from "@/client";
import type { TripRequest } from "@/types";

// The backend only exposes `api/` so far. Update this once the trip route exists.
export const PLAN_TRIP_ENDPOINT = "api/routing/";

export function planTrip(payload: TripRequest) {
  return api.post(PLAN_TRIP_ENDPOINT, { json: payload }).json<unknown>();
}
