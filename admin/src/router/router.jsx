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
import ReferralContent from "../pages/Referral/ReferralContent";
import GameApiKey from "../pages/GameApiKey/GameApiKey";
import GameLaunchKey from "../pages/GameLaunchKey/GameLaunchKey";
import GameHistory from "../pages/GameHistory/GameHistory";
import Maintenance from "../pages/Maintenance/Maintenance";
import ContactLinks from "../pages/ContactLinks/ContactLinks";
import AppDownload from "../pages/AppDownload/AppDownload";
import Notifications from "../pages/Notifications/Notifications";
import Sliders from "../pages/Sliders/Sliders";
import SiteNotice from "../pages/SiteNotice/SiteNotice";
import HomeEvents from "../pages/HomeEvents/HomeEvents";
import Promotions from "../pages/Promotions/Promotions";
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
import VipSettings from "../pages/Vip/VipSettings";
import VipLevels from "../pages/Vip/VipLevels";
import VipHistory from "../pages/Vip/VipHistory";
import IdentityPage from "../pages/SiteSettings/SiteIdentity";
import FooterPage from "../pages/SiteSettings/FooterSetting";
import ClientTheme from "../pages/Theme/ClientTheme";
import NavbarSetting from "../pages/Theme/NavbarSetting";
import SidebarSetting from "../pages/Theme/SidebarSetting";
import BottomNavSetting from "../pages/Theme/BottomNavSetting";
import HomeContentSetting from "../pages/Theme/HomeContentSetting";
import MatchOddsSetting from "../pages/Theme/MatchOddsSetting";
import ModalSetting from "../pages/Theme/ModalSetting";
import AuthSetting from "../pages/Theme/AuthSetting";
import MemberSetting from "../pages/Theme/MemberSetting";
import FooterThemeSetting from "../pages/Theme/FooterThemeSetting";
import AppDownloadThemeSetting from "../pages/Theme/AppDownloadThemeSetting";
import PromotionThemeSetting from "../pages/Theme/PromotionThemeSetting";
import AppDownloadContent from "../pages/AppDownload/AppDownloadContent";
import AffiliateHomeContent from "../pages/Affiliate/AffiliateHomeContent";
import AffiliateHomeTheme from "../pages/Theme/AffiliateHomeTheme";
import AffiliateAuthPage from "../pages/Affiliate/AffiliateAuthPage";
import HelpContentPage from "../pages/Help/HelpContent";
import HelpTheme from "../pages/Theme/HelpTheme";
import { Image, PanelBottom, UserRoundCheck, Handshake } from "lucide-react";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";

const CLIENT_FOOTER_FIELDS = [
  { key: "subtitle", label: "Brand subtitle" },
  { key: "copyright", label: "Copyright" },
  { key: "license", label: "License text", textarea: true, rows: 4 },
];

const AFF_FOOTER_FIELDS = [
  { key: "description", label: "Description / CTA", textarea: true, rows: 3 },
  { key: "copyright", label: "Copyright" },
  { key: "ageNotice", label: "Age notice" },
];

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
        path: "notifications",
        element: (
          <PrivateRoute motherOnly>
            <Notifications />
          </PrivateRoute>
        ),
      },
      {
        path: "sliders",
        element: (
          <PrivateRoute motherOnly>
            <Sliders />
          </PrivateRoute>
        ),
      },
      {
        path: "site-notice",
        element: (
          <PrivateRoute motherOnly>
            <SiteNotice />
          </PrivateRoute>
        ),
      },
      {
        path: "home-events",
        element: (
          <PrivateRoute motherOnly>
            <HomeEvents />
          </PrivateRoute>
        ),
      },
      {
        path: "promotions",
        element: (
          <PrivateRoute motherOnly>
            <Promotions />
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
      {
        path: "referral-content",
        element: (
          <PrivateRoute motherOnly>
            <ReferralContent />
          </PrivateRoute>
        ),
      },
      { path: "turnover-history", element: <TurnoverHistory /> },
      {
        path: "vip-settings",
        element: (
          <PrivateRoute motherOnly>
            <VipSettings />
          </PrivateRoute>
        ),
      },
      {
        path: "vip-levels",
        element: (
          <PrivateRoute motherOnly>
            <VipLevels />
          </PrivateRoute>
        ),
      },
      { path: "vip-history", element: <VipHistory /> },
      {
        path: "site-identity",
        element: (
          <PrivateRoute motherOnly>
            <IdentityPage
              title="Site Identity"
              subtitle="Client site logo, favicon and browser title."
              endpoint="client-identify"
              Icon={Image}
            />
          </PrivateRoute>
        ),
      },
      {
        path: "footer-setting",
        element: (
          <PrivateRoute motherOnly>
            <FooterPage
              title="Footer Setting"
              subtitle="Client footer brand, copyright and license text."
              endpoint="client-footer"
              logoKey="brandLogo"
              fields={CLIENT_FOOTER_FIELDS}
              Icon={PanelBottom}
            />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-identity",
        element: (
          <PrivateRoute motherOnly>
            <IdentityPage
              title="Affiliate Identity"
              subtitle="Affiliate site logo, favicon and browser title."
              endpoint="aff-identify"
              Icon={UserRoundCheck}
            />
          </PrivateRoute>
        ),
      },
      {
        path: "aff-footer",
        element: (
          <PrivateRoute motherOnly>
            <FooterPage
              title="Affiliate Footer"
              subtitle="Affiliate footer logo, description and copyright."
              endpoint="aff-footer"
              logoKey="logo"
              fields={AFF_FOOTER_FIELDS}
              Icon={Handshake}
            />
          </PrivateRoute>
        ),
      },
      {
        path: "client-theme",
        element: (
          <PrivateRoute motherOnly>
            <ClientTheme />
          </PrivateRoute>
        ),
      },
      {
        path: "navbar-theme",
        element: (
          <PrivateRoute motherOnly>
            <NavbarSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "sidebar-theme",
        element: (
          <PrivateRoute motherOnly>
            <SidebarSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "bottom-nav-theme",
        element: (
          <PrivateRoute motherOnly>
            <BottomNavSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "home-content-theme",
        element: (
          <PrivateRoute motherOnly>
            <HomeContentSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "match-odds-theme",
        element: (
          <PrivateRoute motherOnly>
            <MatchOddsSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "modal-theme",
        element: (
          <PrivateRoute motherOnly>
            <ModalSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "auth-theme",
        element: (
          <PrivateRoute motherOnly>
            <AuthSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "member-theme",
        element: (
          <PrivateRoute motherOnly>
            <MemberSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "footer-theme",
        element: (
          <PrivateRoute motherOnly>
            <FooterThemeSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "app-download-theme",
        element: (
          <PrivateRoute motherOnly>
            <AppDownloadThemeSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "promotion-theme",
        element: (
          <PrivateRoute motherOnly>
            <PromotionThemeSetting />
          </PrivateRoute>
        ),
      },
      {
        path: "app-download-content",
        element: (
          <PrivateRoute motherOnly>
            <AppDownloadContent />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-home-content",
        element: (
          <PrivateRoute motherOnly>
            <AffiliateHomeContent />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-home-theme",
        element: (
          <PrivateRoute motherOnly>
            <AffiliateHomeTheme />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-login-page",
        element: (
          <PrivateRoute motherOnly>
            <AffiliateAuthPage page="login" prefix="affl" title="Affiliate Login Page" />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-register-page",
        element: (
          <PrivateRoute motherOnly>
            <AffiliateAuthPage page="register" prefix="affr" title="Affiliate Register Page" />
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-forgot-page",
        element: (
          <PrivateRoute motherOnly>
            <AffiliateAuthPage page="forgot" prefix="afff" title="Affiliate Forgot Password Page" />
          </PrivateRoute>
        ),
      },
      {
        path: "help-content",
        element: (
          <PrivateRoute motherOnly>
            <HelpContentPage />
          </PrivateRoute>
        ),
      },
      {
        path: "help-theme",
        element: (
          <PrivateRoute motherOnly>
            <HelpTheme />
          </PrivateRoute>
        ),
      },
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
], { basename: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
