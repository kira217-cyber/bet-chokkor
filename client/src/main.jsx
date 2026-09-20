import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./index.css";

import { store } from "./app/store";
import { routes } from "./router/router";
import { LanguageProvider } from "./Context/LanguageProvider";
import AlertProvider from "./Context/AlertProvider";
import ThemeApplier from "./components/ThemeApplier/ThemeApplier";

const queryClient = new QueryClient();

// authSlice এর initialState নিজেই localStorage পড়ে, তাই আলাদা করে
// rehydrate করার দরকার নেই

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          {/* সাইটের সব বার্তা মডালে — টোস্ট ব্যবহার করা হয় না */}
          <AlertProvider>
            <ThemeApplier />
            <RouterProvider router={routes} />
          </AlertProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
