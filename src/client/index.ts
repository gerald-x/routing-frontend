import ky from "ky";
import { env } from "@/lib/env";

export const api = ky.create({
  baseUrl: env.backendUrl,
  timeout: 30_000,
});

/*
Geoapify is billed per request, so:
- no retries (a failed lookup just shows an error)
- the API key is attached here once instead of at every call site
*/
export const geoapify = ky.create({
  baseUrl: "https://api.geoapify.com/v1/",
  retry: 0,
  searchParams: { apiKey: env.geoapifyApiKey },
});
