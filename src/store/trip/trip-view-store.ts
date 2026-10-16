import { create } from "zustand";

export interface FocusedCheckpoint {
  routeId: string;
  index: number;
  // Only focus changes from the sidebar move the map; map clicks shouldn't jump it
  source: "list" | "map";
}

interface TripViewState {
  // null = fall back to the recommended route
  selectedRouteId: string | null;
  focusedCheckpoint: FocusedCheckpoint | null;
  heatmapVisible: boolean;
  heatmapHour: number;
  selectRoute: (routeId: string) => void;
  focusCheckpoint: (checkpoint: FocusedCheckpoint | null) => void;
  setHeatmapVisible: (visible: boolean) => void;
  setHeatmapHour: (hour: number) => void;
  reset: () => void;
}

const INITIAL_VIEW = {
  selectedRouteId: null,
  focusedCheckpoint: null,
  heatmapVisible: true,
  heatmapHour: 0,
};

export const useTripViewStore = create<TripViewState>()((set) => ({
  ...INITIAL_VIEW,
  selectRoute: (routeId) =>
    set((state) =>
      state.selectedRouteId === routeId
        ? state
        : { selectedRouteId: routeId, focusedCheckpoint: null },
    ),
  focusCheckpoint: (focusedCheckpoint) =>
    set(
      focusedCheckpoint
        ? { focusedCheckpoint, selectedRouteId: focusedCheckpoint.routeId }
        : { focusedCheckpoint: null },
    ),
  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),
  setHeatmapHour: (heatmapHour) => set({ heatmapHour }),
  reset: () => set(INITIAL_VIEW),
}));
