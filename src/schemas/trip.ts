import { z } from "zod";

export const MAX_LOAD_WEIGHT_LBS = 80_000;

const placeSchema = z.object(
  {
    address: z.string(),
    lat: z.number(),
    lon: z.number(),
  },
  { error: "Select an address from the suggestions" },
);

export const tripFormSchema = z.object({
  origin: placeSchema,
  destination: placeSchema,
  departureAt: z
    .date({ error: "Pick a departure date and time" })
    .refine((date) => date.getTime() > Date.now(), {
      error: "Departure must be in the future",
    }),
  loadWeightLbs: z
    .number({ error: "Enter the load weight" })
    .positive({ error: "Load weight must be greater than 0" })
    .max(MAX_LOAD_WEIGHT_LBS, {
      error: `Load weight can't exceed ${MAX_LOAD_WEIGHT_LBS.toLocaleString()} lbs`,
    }),
});
