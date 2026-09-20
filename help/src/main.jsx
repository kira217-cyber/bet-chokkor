import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";

import "./index.css";
import { router } from "./router.jsx";
import { LangProvider } from "./LangContext.jsx";
import { HelpProvider } from "./HelpData.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LangProvider>
      <HelpProvider>
        <RouterProvider router={router} />
      </HelpProvider>
    </LangProvider>
  </StrictMode>,
);
