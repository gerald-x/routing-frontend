import { useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Loader2Icon, MapPinIcon, XIcon } from "lucide-react";
import { CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { MIN_QUERY_LENGTH, useAddressSuggestions } from "@/hooks";
import { cn } from "@/lib/utils";
import type { Place } from "@/types";

interface AddressAutocompleteProps {
  id: string;
  value: Place | null;
  onChange: (place: Place | null) => void;
  placeholder?: string;
  invalid?: boolean;
}

/*
Flow:
User types
    ↓
Any previous selection is cleared (value → null)
    ↓
Debounced Geoapify lookup shows suggestions
    ↓
User picks one → value is set, lookups stop until they type again
*/
export function AddressAutocomplete({
  id,
  value,
  onChange,
  placeholder,
  invalid,
}: AddressAutocompleteProps) {
  const [text, setText] = useState(value?.address ?? "");
  const [open, setOpen] = useState(false);

  const {
    data: suggestions = [],
    isFetching,
    isError,
    isDebouncing,
  } = useAddressSuggestions(text, value === null);

  const isLoading = isDebouncing || isFetching;
  const showList =
    open && value === null && text.trim().length >= MIN_QUERY_LENGTH;

  function handleTextChange(next: string) {
    setText(next);
    setOpen(true);
    if (value) onChange(null);
  }

  function handleSelect(place: Place) {
    onChange(place);
    setText(place.address);
    setOpen(false);
  }

  function handleClear() {
    handleTextChange("");
    document.getElementById(id)?.focus();
  }

  return (
    // cmdk filtering is off: Geoapify already returns matching results
    <CommandPrimitive shouldFilter={false} className="relative">
      <div className="relative">
        <MapPinIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <CommandPrimitive.Input
          id={id}
          value={text}
          onValueChange={handleTextChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={invalid || undefined}
          className={cn(
            "h-9 w-full min-w-0 rounded-lg border border-input bg-transparent pr-8 pl-8 text-base transition-colors outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          )}
        />
        {text && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear address"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      {showList && (
        <CommandList
          // Keeps input focus on click so onBlur doesn't close the list before onSelect fires
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isLoading ? (
            <ListMessage>
              <Loader2Icon className="size-4 animate-spin" />
              Searching…
            </ListMessage>
          ) : isError ? (
            <ListMessage>Couldn't load suggestions. Keep typing to retry.</ListMessage>
          ) : suggestions.length === 0 ? (
            <ListMessage>No matching addresses</ListMessage>
          ) : (
            <CommandGroup>
              {suggestions.map((result) => (
                <CommandItem
                  key={result.place_id}
                  value={result.place_id}
                  onSelect={() =>
                    handleSelect({
                      address: result.formatted,
                      lat: result.lat,
                      lon: result.lon,
                    })
                  }
                  className="flex-col items-start gap-0"
                >
                  <span>{result.address_line1}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.address_line2}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      )}
    </CommandPrimitive>
  );
}

function ListMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
