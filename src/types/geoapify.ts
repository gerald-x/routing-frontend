export interface GeoapifyAutocompleteResult {
  place_id: string;
  formatted: string;
  address_line1: string;
  address_line2: string;
  lat: number;
  lon: number;
}

export interface GeoapifyAutocompleteResponse {
  results: GeoapifyAutocompleteResult[];
}
