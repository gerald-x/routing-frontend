import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatWeight } from "@/lib/format";
import type { TripPlan } from "@/types";

export function TripSummaryHeader({ trip }: { trip: TripPlan["trip"] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Trip plan</h1>
        <Button asChild variant="outline" size="sm">
          <Link to="/">
            <ArrowLeftIcon />
            New trip
          </Link>
        </Button>
      </div>

      <ol className="flex flex-col gap-1.5 text-sm">
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
            A
          </span>
          <span className="line-clamp-2">{trip.origin.address}</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background">
            B
          </span>
          <span className="line-clamp-2">{trip.destination.address}</span>
        </li>
      </ol>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Departs</dt>
          <dd className="font-medium">{formatDateTime(trip.departure_time)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Load</dt>
          <dd className="font-medium">{formatWeight(trip.load_weight_lbs)}</dd>
        </div>
      </dl>
    </div>
  );
}
