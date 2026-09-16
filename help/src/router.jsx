import { createBrowserRouter } from "react-router";

import Layout from "./Layout.jsx";
import Home from "./pages/Home.jsx";
import Topic from "./pages/Topic.jsx";
import Legal from "./pages/Legal.jsx";
import NotFound from "./pages/NotFound.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: "topic/:key", element: <Topic /> },
      { path: "terms", element: <Legal kind="terms" /> },
      { path: "privacy", element: <Legal kind="privacy" /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
