import { useQuery } from "@tanstack/react-query";
import { fetchAddressSuggestions } from "@/api";
import { useDebouncedValue } from "./use-debounced-value";

const DEBOUNCE_MS = 400;
export const MIN_QUERY_LENGTH = 3;

/*
Saving Geoapify requests:
- wait until the user pauses typing (debounce)
- skip very short queries
- cache results forever, so retyping a query never refetches
- `enabled: false` while an address is already selected
*/
export function useAddressSuggestions(text: string, enabled: boolean) {
  const debouncedText = useDebouncedValue(text.trim(), DEBOUNCE_MS);
  const canSearch = enabled && debouncedText.length >= MIN_QUERY_LENGTH;

  const query = useQuery({
    queryKey: ["address-suggestions", debouncedText.toLowerCase()],
    queryFn: ({ signal }) => fetchAddressSuggestions(debouncedText, signal),
    select: (data) => data.results,
    enabled: canSearch,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    // True while the user is still typing, before the debounced request fires
    isDebouncing: enabled && text.trim() !== debouncedText,
    canSearch,
  };
}
