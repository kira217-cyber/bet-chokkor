import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { store } from "./app/store";
import { routes } from "./router/router";
import { LanguageProvider } from "./Context/LanguageProvider";
import { rehydrateAuth } from "./features/auth/authSlice";
import ThemeApplier from "./components/ThemeApplier/ThemeApplier";

const queryClient = new QueryClient();

const BootstrapAuth = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(rehydrateAuth());
  }, [dispatch]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <BootstrapAuth>
            <ThemeApplier />
            <RouterProvider router={routes} />

            <ToastContainer
              position="top-center"
              autoClose={2200}
              newestOnTop
              closeOnClick
              pauseOnHover
              draggable
              theme="dark"
              style={{ zIndex: 999999 }}
            />
          </BootstrapAuth>
        </LanguageProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);
