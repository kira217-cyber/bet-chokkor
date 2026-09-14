import { createBrowserRouter } from "react-router";

import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Admins from "../pages/Admins/Admins";
import GameApiKey from "../pages/GameApiKey/GameApiKey";
import Maintenance from "../pages/Maintenance/Maintenance";
import OtpSetting from "../pages/OtpSetting/OtpSetting";
import Users from "../pages/Users/Users";
import Affiliates from "../pages/Users/Affiliates";
import BulkAdjustment from "../pages/BulkAdjustment/BulkAdjustment";
import RegisterBonus from "../pages/RegisterBonus/RegisterBonus";
import DepositMethods from "../pages/DepositMethods/DepositMethods";
import DepositField from "../pages/DepositField/DepositField";
import DepositBonusTurnover from "../pages/DepositBonusTurnover/DepositBonusTurnover";
import ManualDeposit from "../pages/ManualDeposit/ManualDeposit";
import DepositRequests from "../pages/DepositRequests/DepositRequests";
import AutoDeposit from "../pages/AutoDeposit/AutoDeposit";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import TurnoverHistory from "../pages/TurnoverHistory/TurnoverHistory";
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
        path: "maintenance",
        element: (
          <PrivateRoute motherOnly>
            <Maintenance />
          </PrivateRoute>
        ),
      },
      { path: "users", element: <Users /> },
      { path: "affiliates", element: <Affiliates /> },
      {
        path: "bulk-adjustment",
        element: (
          <PrivateRoute motherOnly>
            <BulkAdjustment />
          </PrivateRoute>
        ),
      },
      {
        path: "otp-setting",
        element: (
          <PrivateRoute motherOnly>
            <OtpSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "register-bonus",
        element: (
          <PrivateRoute motherOnly>
            <RegisterBonus />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-methods",
        element: (
          <PrivateRoute motherOnly>
            <DepositMethods />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-field",
        element: (
          <PrivateRoute motherOnly>
            <DepositField />
          </PrivateRoute>
        ),
      },
      {
        path: "deposit-bonus-turnover",
        element: (
          <PrivateRoute motherOnly>
            <DepositBonusTurnover />
          </PrivateRoute>
        ),
      },
      { path: "manual-deposit", element: <ManualDeposit /> },
      { path: "deposit-requests", element: <DepositRequests /> },
      {
        path: "auto-deposit",
        element: (
          <PrivateRoute motherOnly>
            <AutoDeposit />
          </PrivateRoute>
        ),
      },
      { path: "auto-deposit-history", element: <AutoDepositHistory /> },
      { path: "turnover-history", element: <TurnoverHistory /> },
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
