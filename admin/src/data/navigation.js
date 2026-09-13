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
    key: "game",
    label: "Game",
    icon: "Gamepad2",
    motherOnly: true,
    children: [
      {
        key: "game-api-key",
        path: "/game-api-key",
        label: "Add Game API Key",
        icon: "KeyRound",
      },
    ],
  },
];

/** CreateAdmin পেজে দেখানো পারমিশন তালিকা */
export const allPermissions = [
  { key: "dashboard", label: "Dashboard", path: "/" },
];

export const roleLabels = {
  mother: "Mother Admin",
  sub: "Sub Admin",
  viewer: "View Only Admin",
};

export default navItems;
