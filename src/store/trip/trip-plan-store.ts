import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { TripPlan } from "@/types";

interface TripPlanState {
  plan: TripPlan | null;
  setPlan: (plan: TripPlan) => void;
  clearPlan: () => void;
}

// Kept in sessionStorage so a page refresh on /trip doesn't lose the results
export const useTripPlanStore = create<TripPlanState>()(
  persist(
    (set) => ({
      plan: null,
      setPlan: (plan) => set({ plan }),
      clearPlan: () => set({ plan: null }),
    }),
    {
      name: "trip-plan",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
