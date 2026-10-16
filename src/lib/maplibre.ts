import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

/*
MapLibre v6 looks for its worker file next to its own module.
Vite moves that module when bundling, so the lookup breaks ("Worker failed to load").
Fix:
- `?worker&url` makes Vite bundle the worker with its imports
- the map is told to load the worker from that URL
*/
maplibregl.setWorkerUrl(workerUrl);

export { maplibregl };
