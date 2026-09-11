import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import Games from "../pages/Games/Games";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";

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
    ],
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
