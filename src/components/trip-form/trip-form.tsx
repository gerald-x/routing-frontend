import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePlanTrip } from "@/hooks";
import { tripFormSchema } from "@/schemas/trip";
import type { TripFormDraft, TripFormErrors } from "@/types";
import { AddressAutocomplete } from "./address-autocomplete";
import { DeparturePicker } from "./departure-picker";

const EMPTY_DRAFT: TripFormDraft = {
  origin: null,
  destination: null,
  departureAt: null,
  loadWeightLbs: "",
};

function validate(draft: TripFormDraft) {
  const result = tripFormSchema.safeParse({
    origin: draft.origin ?? undefined,
    destination: draft.destination ?? undefined,
    departureAt: draft.departureAt ?? undefined,
    loadWeightLbs:
      draft.loadWeightLbs.trim() === ""
        ? undefined
        : Number(draft.loadWeightLbs),
  });

  if (result.success) return { values: result.data, errors: {} };

  const errors: TripFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof TripFormDraft;
    errors[field] ??= issue.message;
  }
  return { values: null, errors };
}

/*
Validation timing:
- Nothing is flagged while the user fills the form for the first time
- After the first submit attempt, errors update live as fields change
*/
export function TripForm() {
  const [draft, setDraft] = useState<TripFormDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<TripFormErrors>({});
  const [attempted, setAttempted] = useState(false);
  const planTrip = usePlanTrip();

  function update<K extends keyof TripFormDraft>(
    key: K,
    value: TripFormDraft[K],
  ) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    if (attempted) setErrors(validate(next).errors);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAttempted(true);

    const { values, errors } = validate(draft);
    setErrors(errors);
    if (!values) return;

    planTrip.mutate(
      {
        origin: values.origin,
        destination: values.destination,
        departure_time: values.departureAt.toISOString(),
        load_weight_lbs: values.loadWeightLbs,
      },
      {
        onSuccess: () => toast.success("Trip submitted"),
        onError: (error) =>
          toast.error("Couldn't plan the trip", { description: error.message }),
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.origin || undefined}>
          <FieldLabel htmlFor="origin">Origin</FieldLabel>
          <AddressAutocomplete
            id="origin"
            value={draft.origin}
            onChange={(place) => update("origin", place)}
            placeholder="Where is the load picked up?"
            invalid={!!errors.origin}
          />
          <FieldError>{errors.origin}</FieldError>
        </Field>

        <Field data-invalid={!!errors.destination || undefined}>
          <FieldLabel htmlFor="destination">Destination</FieldLabel>
          <AddressAutocomplete
            id="destination"
            value={draft.destination}
            onChange={(place) => update("destination", place)}
            placeholder="Where is it going?"
            invalid={!!errors.destination}
          />
          <FieldError>{errors.destination}</FieldError>
        </Field>

        <Field data-invalid={!!errors.departureAt || undefined}>
          <FieldLabel htmlFor="departure">Departure</FieldLabel>
          <DeparturePicker
            id="departure"
            value={draft.departureAt}
            onChange={(date) => update("departureAt", date)}
            invalid={!!errors.departureAt}
          />
          <FieldError>{errors.departureAt}</FieldError>
        </Field>

        <Field data-invalid={!!errors.loadWeightLbs || undefined}>
          <FieldLabel htmlFor="load-weight">Load weight</FieldLabel>
          <div className="relative">
            <Input
              id="load-weight"
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="e.g. 42000"
              value={draft.loadWeightLbs}
              onChange={(e) => update("loadWeightLbs", e.target.value)}
              aria-invalid={!!errors.loadWeightLbs || undefined}
              className="h-9 pr-10"
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
              lbs
            </span>
          </div>
          {errors.loadWeightLbs ? (
            <FieldError>{errors.loadWeightLbs}</FieldError>
          ) : (
            <FieldDescription>Weight of the cargo in pounds.</FieldDescription>
          )}
        </Field>

        <Button type="submit" size="lg" disabled={planTrip.isPending}>
          {planTrip.isPending && <Loader2Icon className="animate-spin" />}
          Plan route
        </Button>
      </FieldGroup>
    </form>
  );
}
