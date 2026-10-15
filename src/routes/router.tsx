import { createBrowserRouter } from "react-router";
import { HomePage } from "../pages/index.ts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
]);

export default router;
