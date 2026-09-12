/**
 * সাইডবারের মেনু।
 *
 * `perm` হলো sub অ্যাডমিনের পারমিশন কী — mother ও viewer সব পেজেই
 * ঢুকতে পারে, তাই তাদের জন্য এই তালিকা মেলানো হয় না।
 * `motherOnly` পেজ শুধু mother দেখবে।
 */
export const navItems = [
  { key: "dashboard", path: "/", label: "Dashboard", icon: "LayoutDashboard", perm: "dashboard" },
  { key: "admins", path: "/admins", label: "Admin Accounts", icon: "UserCog", motherOnly: true },
  { key: "profile", path: "/profile", label: "My Profile", icon: "User", perm: "profile" },
];

/** CreateAdmin পেজে দেখানো পারমিশন তালিকা */
export const allPermissions = [
  { key: "dashboard", label: "Dashboard", path: "/" },
  { key: "profile", label: "My Profile", path: "/profile" },
];

export const roleLabels = {
  mother: "Mother Admin",
  sub: "Sub Admin",
  viewer: "View Only Admin",
};

export default navItems;
