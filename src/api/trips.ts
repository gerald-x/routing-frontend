import { api } from "@/client";
import type { TripPlan, TripRequest } from "@/types";

export const PLAN_TRIP_ENDPOINT = "api/routing/trips/plan/";

// The backend calls the routing and weather APIs for every checkpoint, so allow it time
const PLAN_TRIP_TIMEOUT_MS = 90_000;

export function planTrip(payload: TripRequest) {
  return api
    .post(PLAN_TRIP_ENDPOINT, { json: payload, timeout: PLAN_TRIP_TIMEOUT_MS })
    .json<TripPlan>();
}
