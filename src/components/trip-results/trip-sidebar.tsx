import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoute, routesByRank } from "@/lib/trip-plan";
import { useTripViewStore } from "@/store";
import type { TripPlan } from "@/types";
import { CheckpointList } from "./checkpoint-list";
import { RecommendationCard } from "./recommendation-card";
import { RouteCard } from "./route-card";
import { TripSummaryHeader } from "./trip-summary-header";

export function TripSidebar({ plan }: { plan: TripPlan }) {
  const [tab, setTab] = useState("routes");
  const selectedRouteId = useTripViewStore((state) => state.selectedRouteId);
  const selectRoute = useTripViewStore((state) => state.selectRoute);

  const selectedRoute = getRoute(plan, selectedRouteId);
  const recommended = getRoute(plan, plan.trip.recommended_route_id);

  // Clicking a checkpoint on the map opens its details in the list
  useEffect(
    () =>
      useTripViewStore.subscribe((state, prev) => {
        const focused = state.focusedCheckpoint;
        if (focused?.source === "map" && focused !== prev.focusedCheckpoint) {
          setTab("checkpoints");
        }
      }),
    [],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <TripSummaryHeader trip={plan.trip} />
      <RecommendationCard
        route={recommended}
        reason={plan.trip.recommendation_reason}
        onShow={() => {
          selectRoute(recommended.id);
          setTab("routes");
        }}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full">
          <TabsTrigger value="routes">Routes ({plan.routes.length})</TabsTrigger>
          <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
        </TabsList>
        <TabsContent value="routes" className="mt-2 flex flex-col gap-2">
          {routesByRank(plan).map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              selected={route.id === selectedRoute.id}
              onSelect={() => selectRoute(route.id)}
            />
          ))}
        </TabsContent>
        <TabsContent value="checkpoints" className="mt-2">
          <CheckpointList route={selectedRoute} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
