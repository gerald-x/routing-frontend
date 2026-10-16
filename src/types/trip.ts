import type { z } from "zod";
import type { tripFormSchema } from "@/schemas/trip";

export interface Place {
  address: string;
  lat: number;
  lon: number;
}

export type TripFormValues = z.infer<typeof tripFormSchema>;

/*
Raw form state before validation:
every field can still be empty while the user fills it in.
*/
export interface TripFormDraft {
  origin: Place | null;
  destination: Place | null;
  departureAt: Date | null;
  loadWeightLbs: string;
}

export type TripFormErrors = Partial<Record<keyof TripFormDraft, string>>;

export interface TripRequest {
  origin: Place;
  destination: Place;
  departure_time: string;
  load_weight_lbs: number;
}
