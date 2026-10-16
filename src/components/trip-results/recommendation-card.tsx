import { StarIcon } from "lucide-react";
import type { PlannedRoute } from "@/types";

interface RecommendationCardProps {
  route: PlannedRoute;
  reason: string;
  onShow: () => void;
}

export function RecommendationCard({ route, reason, onShow }: RecommendationCardProps) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <StarIcon className="size-3.5 fill-amber-400 text-amber-400" />
        Recommended route
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="text-lg font-semibold">{route.label}</p>
        <button
          type="button"
          onClick={onShow}
          className="text-xs font-medium underline-offset-4 hover:underline"
        >
          Show on map
        </button>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{reason}</p>
    </div>
  );
}
