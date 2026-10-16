import { geoapify } from "@/client";
import type { GeoapifyAutocompleteResponse } from "@/types";

export function fetchAddressSuggestions(text: string, signal?: AbortSignal) {
  return geoapify
    .get("geocode/autocomplete", {
      searchParams: { text, format: "json", limit: 5 },
      signal,
    })
    .json<GeoapifyAutocompleteResponse>();
}
