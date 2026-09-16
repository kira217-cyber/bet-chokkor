/**
 * সাইডবারের মেনু।
 *
 * `perm` হলো sub অ্যাডমিনের পারমিশন কী — mother ও viewer সব পেজেই
 * ঢুকতে পারে, তাই তাদের জন্য এই তালিকা মেলানো হয় না।
 * `motherOnly` পেজ শুধু mother দেখবে।
 *
 * `children` থাকলে আইটেমটা ড্রপডাউন হয়ে যায় — নিজের কোনো পেজ নেই,
 * ভিতরের লিংকগুলোই পেজ।
 *
 * নিজের প্রোফাইল এখানে নেই — সেটা হেডারের ডান কোণের আইকন থেকে খোলে
 * এবং প্রত্যেক অ্যাডমিনেরই নিজের পেজ, তাই আলাদা পারমিশন লাগে না।
 */
export const navItems = [
  { key: "dashboard", path: "/", label: "Dashboard", icon: "LayoutDashboard", perm: "dashboard" },
  { key: "admins", path: "/admins", label: "Admin Accounts", icon: "UserCog", motherOnly: true },

  {
    key: "user",
    label: "User",
    icon: "Users",
    children: [
      {
        key: "users",
        path: "/users",
        label: "Users",
        icon: "Users",
        perm: "users",
      },
      {
        key: "affiliates",
        path: "/affiliates",
        label: "Affiliates",
        icon: "UserRoundCheck",
        perm: "affiliates",
      },
      {
        key: "bulk-adjustment",
        path: "/bulk-adjustment",
        label: "Bulk Adjustment",
        icon: "Scale",
        motherOnly: true,
      },
    ],
  },

  { key: "contact-links", path: "/contact-links", label: "Contact Links", icon: "Phone", motherOnly: true },
  { key: "app-download", path: "/app-download", label: "App Download", icon: "Smartphone", motherOnly: true },
  { key: "maintenance", path: "/maintenance", label: "Site Maintenance", icon: "Wrench", motherOnly: true },

  { key: "otp-setting", path: "/otp-setting", label: "OTP Setting", icon: "MessageSquareLock", motherOnly: true },

  { key: "register-bonus", path: "/register-bonus", label: "Register Bonus", icon: "Gift", motherOnly: true },

  {
    key: "deposit",
    label: "Deposit",
    icon: "Wallet",
    children: [
      {
        key: "deposit-methods",
        path: "/deposit-methods",
        label: "Add Deposit Method",
        icon: "Wallet",
        motherOnly: true,
      },
      {
        key: "deposit-field",
        path: "/deposit-field",
        label: "Deposit Field",
        icon: "ClipboardList",
        motherOnly: true,
      },
      {
        key: "deposit-bonus-turnover",
        path: "/deposit-bonus-turnover",
        label: "Bonus & Turnover",
        icon: "Layers",
        motherOnly: true,
      },
      {
        key: "manual-deposit",
        path: "/manual-deposit",
        label: "Manual Deposit",
        icon: "BadgeDollarSign",
        perm: "manual-deposit",
      },
      {
        key: "deposit-requests",
        path: "/deposit-requests",
        label: "Deposit Requests",
        icon: "Receipt",
        perm: "deposit-requests",
      },
      {
        key: "auto-deposit",
        path: "/auto-deposit",
        label: "Auto Deposit",
        icon: "Zap",
        motherOnly: true,
      },
      {
        key: "auto-deposit-history",
        path: "/auto-deposit-history",
        label: "Auto Deposit History",
        icon: "Receipt",
        perm: "auto-deposit-history",
      },
      {
        key: "turnover-history",
        path: "/turnover-history",
        label: "All Turnover History",
        icon: "History",
        perm: "turnover-history",
      },
    ],
  },

  {
    key: "withdraw",
    label: "Withdraw",
    icon: "Banknote",
    children: [
      {
        key: "withdraw-requests",
        path: "/withdraw-requests",
        label: "Withdraw Requests",
        icon: "Receipt",
        perm: "withdraw-requests",
      },
      {
        key: "withdraw-methods",
        path: "/withdraw-methods",
        label: "Add Withdraw Method",
        icon: "Banknote",
        motherOnly: true,
      },
      {
        key: "aff-withdraw-requests",
        path: "/aff-withdraw-requests",
        label: "Affiliate Withdraws",
        icon: "Handshake",
        perm: "aff-withdraw-requests",
      },
      {
        key: "aff-withdraw-methods",
        path: "/aff-withdraw-methods",
        label: "Affiliate Withdraw Method",
        icon: "Landmark",
        motherOnly: true,
      },
    ],
  },

  {
    key: "referral",
    path: "/referral",
    label: "Referral Program",
    icon: "Gift",
    motherOnly: true,
  },

  {
    key: "verification",
    path: "/verification",
    label: "Verification",
    icon: "ShieldCheck",
    perm: "verification",
  },

  {
    key: "affiliate-verification",
    path: "/affiliate-verification",
    label: "Affiliate Verification",
    icon: "UserRoundCheck",
    perm: "affiliate-verification",
  },

  {
    key: "game",
    label: "Game",
    icon: "Gamepad2",
    children: [
      {
        key: "game-history",
        path: "/game-history",
        label: "Game History",
        icon: "Dices",
        perm: "game-history",
      },
      {
        key: "game-api-key",
        path: "/game-api-key",
        label: "Add Game API Key",
        icon: "KeyRound",
        motherOnly: true,
      },
      {
        key: "game-launch-key",
        path: "/game-launch-key",
        label: "Add Game Launch Key",
        icon: "Play",
        motherOnly: true,
      },
    ],
  },
];

/** CreateAdmin পেজে দেখানো পারমিশন তালিকা */
export const allPermissions = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "users", label: "Users", path: "/users" },
  { key: "game-history", label: "Game History", path: "/game-history" },
  { key: "verification", label: "Verification", path: "/verification" },
  {
    key: "affiliate-verification",
    label: "Affiliate Verification",
    path: "/affiliate-verification",
  },
  {
    key: "withdraw-requests",
    label: "Withdraw Requests",
    path: "/withdraw-requests",
  },
  { key: "affiliates", label: "Affiliates", path: "/affiliates" },
  { key: "manual-deposit", label: "Manual Deposit", path: "/manual-deposit" },
  { key: "deposit-requests", label: "Deposit Requests", path: "/deposit-requests" },
  {
    key: "auto-deposit-history",
    label: "Auto Deposit History",
    path: "/auto-deposit-history",
  },
  {
    key: "turnover-history",
    label: "All Turnover History",
    path: "/turnover-history",
  },
  {
    key: "aff-withdraw-requests",
    label: "Affiliate Withdraws",
    path: "/aff-withdraw-requests",
  },
];

export const roleLabels = {
  mother: "Mother Admin",
  sub: "Sub Admin",
  viewer: "View Only Admin",
};

export default navItems;
