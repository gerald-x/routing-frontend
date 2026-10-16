# routing-frontend

Frontend for a truck routing app that scores routes by weather risk.

The user enters an origin, a destination, a departure time and a load weight. The backend returns up to three truck routes with the weather forecast at each checkpoint, timed to when the truck should get there. This app shows those results on a map:

- the **recommended route** and the reason it was chosen
- **every route**, with its distance, drive time, arrival time, risk breakdown and summary
- **checkpoints** along each route (every 10, 25 or 50 miles, depending on route length) with their ETA, weather and risk level
- a **weather heatmap** along the trip corridor, with a 0–48 hour forecast slider that also shows where the truck is at that hour

This repo is frontend only. The API lives in the companion Django project.

## Tech stack

| Concern        | Library                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| Build / dev    | [Vite](https://vite.dev) + React 19 + TypeScript                                                 |
| Routing        | [React Router](https://reactrouter.com)                                                          |
| UI components  | [shadcn/ui](https://ui.shadcn.com) (Radix) + [Tailwind CSS v4](https://tailwindcss.com)          |
| Map            | [MapLibre GL JS](https://maplibre.org) via [react-map-gl](https://visgl.github.io/react-map-gl/) |
| Map tiles      | [OpenFreeMap](https://openfreemap.org) (free, no key)                                            |
| Address search | [Geoapify Autocomplete API](https://www.geoapify.com/address-autocomplete/)                      |
| Server state   | [TanStack Query](https://tanstack.com/query)                                                     |
| Client state   | [Zustand](https://zustand.docs.pmnd.rs)                                                          |
| HTTP client    | [Ky](https://github.com/sindresorhus/ky)                                                         |
| Validation     | [Zod](https://zod.dev)                                                                           |
| Dates          | [date-fns](https://date-fns.org)                                                                 |
| Toasts         | [Sonner](https://sonner.emilkowal.ski)                                                           |

## Getting started

### Prerequisites

- **Node.js 20.19+** (or 22.12+), which Vite requires
- The **backend** (`routing`) running locally, by default on `http://127.0.0.1:8000`
- A **Geoapify API key** for address autocomplete. The free plan is enough: sign up at [myprojects.geoapify.com](https://myprojects.geoapify.com) and create a project to get one.

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your key:

```bash
cp .env.example .env
```

| Variable                | Required | Description                                                      |
| ----------------------- | -------- | ---------------------------------------------------------------- |
| `VITE_GEOAPIFY_API_KEY` | Yes      | Geoapify key used for origin and destination autocomplete        |
| `VITE_BACKEND_URL_DEV`  | Yes      | Backend base URL in development, e.g. `http://127.0.0.1:8000/`   |
| `VITE_BACKEND_URL_PROD` | For prod | Backend base URL used when `VITE_ENVIRONMENT=production`         |
| `VITE_ENVIRONMENT`      | Yes      | `development` or `production`; selects which backend URL is used |

> Vite only exposes variables prefixed with `VITE_` to the browser. Anything in `.env` ends up in the built JS, so only put browser-safe keys here. In the Geoapify dashboard, you can restrict the key to your domain.

The routing and weather API keys (Geoapify Routing, WeatherAPI) belong to the **backend**, not this app.

### 3. Run

```bash
npm run dev
```

Open **http://127.0.0.1:5173**.

> You may also use `localhost`. The backend's CORS allows both

### Other scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run build`   | Type-check and build to `dist/`    |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint                         |

## How it works

```
Home page (/)                         Trip page (/trip)
──────────────                        ─────────────────
Fill in the form
    ↓ origin/destination use debounced Geoapify autocomplete
Validate with Zod
    ↓
POST api/routing/trips/plan/  ──→  Response saved in the Zustand store
                                       ↓
                                   Map + sidebar read from the store
                                   Selection, slider hour and focused checkpoint
                                   live in a separate view store, so the map and
                                   sidebar stay in sync
```

The plan is kept in `sessionStorage`, so refreshing `/trip` doesn't lose it. Opening `/trip` with no plan redirects to the form.

## Project structure

```
src/
├── api/            Request functions (Geoapify autocomplete, plan trip)
├── client/         Shared Ky instances: backend `api` and `geoapify`
├── components/
│   ├── ui/           shadcn/ui primitives only (generated, don't put custom components here)
│   ├── shared/       Reused across features: RiskBadge, WeatherReadings
│   ├── trip-form/    Home page form, address autocomplete, date/time picker
│   ├── trip-map/     MapLibre map, route/checkpoint/heatmap layers, markers, slider, legend
│   └── trip-results/ Sidebar: trip summary, recommendation, route cards, checkpoint timeline
├── hooks/          Address suggestions, debounce, plan-trip mutation, theme-aware map colors
├── lib/            Pure helpers: formatting, geo math, risk levels, GeoJSON builders, env
├── pages/          Route-level pages (home, trip)
├── routes/         React Router config
├── schemas/        Zod schemas for form validation
├── store/trip/     Zustand stores: trip plan (persisted) and map/sidebar view state
├── types/          Shared types: API request/response, domain models
└── index.css       Tailwind + theme tokens (light and dark), including risk and route colors
```

Each component folder exposes its public members through an `index.ts`.

## Architecture and library decisions

- **TanStack Query for anything async.** It handles caching, cancelling and loading state for the autocomplete, and the trip request runs as a mutation.
- **Zustand for state shared across pages.** The plan has to outlive the form page, and the map and sidebar both read and change the selected route, slider hour and focused checkpoint. Small, separate stores avoid passing props through every layer.
- **Ky over fetch or axios.** It's small, built on fetch, and has typed errors, timeouts and per-instance defaults. The Geoapify instance sets `retry: 0` and attaches the key once.
- **Plain React state + Zod for the form.** The form only has a few fields. Validation runs on submit, then live once the user has tried to submit.
- **MapLibre + OpenFreeMap.** Open-source vector maps with free tiles and no key, so browsing the map doesn't use Geoapify credits.
- **Heatmap drawn as blurred risk-coloured circles, not a density heatmap.** A density heatmap adds overlapping points together, and checkpoints are dense along the corridor, so many Low points would look "hot". Here the colour always equals the forecast risk at that spot.
- **Theme tokens as CSS variables.** Risk and route colours are defined in `index.css` for light and dark. MapLibre draws on a canvas and can't read `var(--x)`, so `useMapColors` reads the values at runtime and re-reads them when the theme changes.
- **Results page is lazy-loaded.** MapLibre is about 1 MB, so it only downloads when you reach `/trip`.

### MapLibre + Vite note

MapLibre v6 loads its web worker from a file next to its own module, and Vite's bundling breaks that path. `src/lib/maplibre.ts` imports the worker with `?worker&url`, so Vite bundles it, then passes that URL to `setWorkerUrl`. `vite.config.ts` also pre-bundles `maplibre-gl` to avoid an "Outdated Optimize Dep" error on the first dev load.
