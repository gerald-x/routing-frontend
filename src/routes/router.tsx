import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/index.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/trip",
    // Lazy so MapLibre (~1 MB) isn't downloaded with the form page
    lazy: async () => ({ Component: (await import("../pages/trip")).default }),
  },
]);

export default router;
