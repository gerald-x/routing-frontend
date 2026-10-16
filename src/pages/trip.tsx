import { Link, Navigate } from "react-router";
import { TripMap } from "@/components/trip-map";
import { TripSidebar } from "@/components/trip-results";
import { Button } from "@/components/ui/button";
import { useTripPlanStore } from "@/store";

export default function Trip() {
  const plan = useTripPlanStore((state) => state.plan);

  // Reached directly without planning a trip first
  if (!plan) return <Navigate to="/" replace />;

  if (plan.routes.length === 0) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-muted-foreground">No routes were found for this trip.</p>
        <Button asChild variant="outline">
          <Link to="/">Try another trip</Link>
        </Button>
      </main>
    );
  }

  return (
    <div className="flex min-h-svh flex-col bg-background md:h-svh md:flex-row">
      <main className="relative h-[65svh] md:order-2 md:h-auto md:flex-1">
        <TripMap plan={plan} />
      </main>
      <aside className="md:order-1 md:w-[400px] md:shrink-0 md:overflow-y-auto md:border-r">
        <TripSidebar plan={plan} />
      </aside>
    </div>
  );
}
