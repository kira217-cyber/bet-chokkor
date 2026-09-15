import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import Games from "../pages/Games/Games";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Deposit from "../pages/Deposit/Deposit";
import ManualDeposit from "../pages/Deposit/ManualDeposit";
import AutoDeposit from "../pages/Deposit/AutoDeposit";
import Withdraw from "../pages/Withdraw/Withdraw";
import Profile from "../pages/Member/Profile";
import History from "../pages/Member/History";
import Verification from "../pages/Member/Verification";
import PlayGame from "../pages/PlayGame/PlayGame";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // যেকোনো ক্যাটাগরি বা প্রোভাইডারে ক্লিক করলে আপাতত এই এক পেজেই আসে
      {
        path: "games/:category",
        element: <Games />,
      },

      // লগইন ছাড়া member পেজে ঢোকা যায় না — PrivateRoute হোমে ফেরত পাঠায়
      {
        path: "member/wallet/deposit",
        element: (
          <PrivateRoute>
            <Deposit />
          </PrivateRoute>
        ),
      },
      {
        path: "member/wallet/withdraw",
        element: (
          <PrivateRoute>
            <Withdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "member/profile",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "member/verification",
        element: (
          <PrivateRoute>
            <Verification />
          </PrivateRoute>
        ),
      },
      // পাঁচটা ট্যাবই এক পাতায়; URL এ কোনটা খোলা থাকবে সেটা বলা থাকে
      {
        path: "member/history/:tab",
        element: (
          <PrivateRoute>
            <History />
          </PrivateRoute>
        ),
      },
      {
        path: "member/wallet/deposit/manual",
        element: (
          <PrivateRoute>
            <ManualDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "member/wallet/deposit/auto",
        element: (
          <PrivateRoute>
            <AutoDeposit />
          </PrivateRoute>
        ),
      },
    ],
  },

  // গেম পুরো পর্দা নেয় — হেডার, সাইডবার বা বটম বার কিছুই থাকে না,
  // তাই এটাও RootLayout এর বাইরে
  {
    path: "/play/:gameUId",
    element: (
      <PrivateRoute>
        <PlayGame />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
  },

  // লগইন/রেজিস্টার/ফরগেট পাসওয়ার্ড পেজে সাইডবার-ফুটার-বটমবার নেই,
  // তাই RootLayout এর বাইরে
  {
    path: "/login",
    element: <Login />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <NotFoundPage />,
  },
]);
