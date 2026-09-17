import { createBrowserRouter } from "react-router";

import RootLayout from "../RootLayout/RootLayout";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Profile from "../pages/Profile/Profile";
import Admins from "../pages/Admins/Admins";
import Verification from "../pages/Verification/Verification";
import AffiliateVerification from "../pages/Verification/AffiliateVerification";
import Referral from "../pages/Referral/Referral";
import GameApiKey from "../pages/GameApiKey/GameApiKey";
import GameLaunchKey from "../pages/GameLaunchKey/GameLaunchKey";
import GameHistory from "../pages/GameHistory/GameHistory";
import Maintenance from "../pages/Maintenance/Maintenance";
import ContactLinks from "../pages/ContactLinks/ContactLinks";
import AppDownload from "../pages/AppDownload/AppDownload";
import OtpSetting from "../pages/OtpSetting/OtpSetting";
import Users from "../pages/Users/Users";
import Affiliates from "../pages/Users/Affiliates";
import UserDetails from "../pages/Users/UserDetails";
import BulkAdjustment from "../pages/BulkAdjustment/BulkAdjustment";
import RegisterBonus from "../pages/RegisterBonus/RegisterBonus";
import DepositMethods from "../pages/DepositMethods/DepositMethods";
import DepositField from "../pages/DepositField/DepositField";
import DepositBonusTurnover from "../pages/DepositBonusTurnover/DepositBonusTurnover";
import ManualDeposit from "../pages/ManualDeposit/ManualDeposit";
import DepositRequests from "../pages/DepositRequests/DepositRequests";
import AutoDeposit from "../pages/AutoDeposit/AutoDeposit";
import AutoDepositHistory from "../pages/AutoDepositHistory/AutoDepositHistory";
import WithdrawMethods from "../pages/WithdrawMethods/WithdrawMethods";
import WithdrawRequests from "../pages/WithdrawRequests/WithdrawRequests";
import AutoWithdraw from "../pages/AutoWithdraw/AutoWithdraw";
import AutoWithdrawHistory from "../pages/AutoWithdrawHistory/AutoWithdrawHistory";
import AffWithdrawMethods from "../pages/AffWithdrawMethods/AffWithdrawMethods";
import AffWithdrawRequests from "../pages/AffWithdrawRequests/AffWithdrawRequests";
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
        path: "contact-links",
        element: (
          <PrivateRoute motherOnly>
            <ContactLinks />
          </PrivateRoute>
        ),
      },
      {
        path: "app-download",
        element: (
          <PrivateRoute motherOnly>
            <AppDownload />
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
      { path: "users/:id", element: <UserDetails kind="users" /> },
      { path: "affiliates", element: <Affiliates /> },
      { path: "affiliates/:id", element: <UserDetails kind="affiliates" /> },
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
      {
        path: "withdraw-methods",
        element: (
          <PrivateRoute motherOnly>
            <WithdrawMethods />
          </PrivateRoute>
        ),
      },
      { path: "withdraw-requests", element: <WithdrawRequests /> },
      {
        path: "auto-withdraw",
        element: (
          <PrivateRoute motherOnly>
            <AutoWithdraw />
          </PrivateRoute>
        ),
      },
      { path: "auto-withdraw-history", element: <AutoWithdrawHistory /> },
      { path: "aff-withdraw-requests", element: <AffWithdrawRequests /> },
      {
        path: "aff-withdraw-methods",
        element: (
          <PrivateRoute motherOnly>
            <AffWithdrawMethods />
          </PrivateRoute>
        ),
      },
      { path: "verification", element: <Verification /> },
      {
        path: "affiliate-verification",
        element: <AffiliateVerification />,
      },
      {
        path: "referral",
        element: (
          <PrivateRoute motherOnly>
            <Referral />
          </PrivateRoute>
        ),
      },
      { path: "turnover-history", element: <TurnoverHistory /> },
      { path: "game-history", element: <GameHistory /> },
      {
        path: "game-api-key",
        element: (
          <PrivateRoute motherOnly>
            <GameApiKey />
          </PrivateRoute>
        ),
      },
      {
        path: "game-launch-key",
        element: (
          <PrivateRoute motherOnly>
            <GameLaunchKey />
          </PrivateRoute>
        ),
      },
    ],
  },
]);
