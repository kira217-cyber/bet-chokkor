import { createBrowserRouter } from "react-router";

import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Admins from "../pages/Admins/Admins";
import GameApiKey from "../pages/GameApiKey/GameApiKey";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

export const routes = createBrowserRouter([
  { path: "/login", element: <Login />, errorElement: <NotFoundPage /> },

  {
    path: "/",
    element: (
      <PrivateRoute>
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      {
        path: "admins",
        element: (
          <PrivateRoute motherOnly>
            <Admins />
          </PrivateRoute>
        ),
      },
      {
        path: "game-api-key",
        element: (
          <PrivateRoute motherOnly>
            <GameApiKey />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
