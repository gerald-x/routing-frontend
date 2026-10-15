import { useMutation } from "@tanstack/react-query";
import { planTrip } from "@/api";

export function usePlanTrip() {
  return useMutation({ mutationFn: planTrip });
}
