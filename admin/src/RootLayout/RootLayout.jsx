import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  UserCog,
  Gamepad2,
  KeyRound,
  Wrench,
  MessageSquareLock,
  Gift,
  Wallet,
  Receipt,
  Zap,
  ClipboardList,
  Layers,
  BadgeDollarSign,
  History,
  ChevronDown,
  User,
  Menu,
  X,
  LogOut,
  Eye,
} from "lucide-react";

import { navItems, roleLabels } from "../data/navigation";
import { logout } from "../features/auth/authSlice";
import { selectAdmin } from "../features/auth/authSelectors";

const ICONS = {
  LayoutDashboard,
  UserCog,
  Gamepad2,
  KeyRound,
  Wrench,
  MessageSquareLock,
  Gift,
  Wallet,
  Receipt,
  Zap,
  ClipboardList,
  Layers,
  BadgeDollarSign,
  History,
  User,
};

/** একটা মেনু লিংকের চেহারা — সাধারণ আইটেম আর ড্রপডাউনের ভিতরের লিংক দুটোতেই */
const linkClass = ({ isActive }) =>
  `flex h-11 items-center gap-3 rounded-[14px] px-4 text-[14px] transition ${
    isActive
      ? "bg-gradient-to-r from-[var(--primary400)] via-[var(--primary500)] to-[var(--primary600)] font-black text-[var(--neutral1000)] shadow-[0_10px_26px_rgba(249,185,1,0.22)]"
      : "font-medium text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--neutral100)]"
  }`;

/**
 * অ্যাডমিন শেল — ডেস্কটপে বাঁয়ে স্থায়ী সাইডবার, মোবাইলে ড্রয়ার।
 * viewer হলে উপরে একটা ব্যাজ থাকে যাতে বোঝা যায় কিছু বদলানো যাবে না।
 */
const RootLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);

  const [open, setOpen] = useState(false);

  // কোন ড্রপডাউনগুলো খোলা। এখনকার পেজ যে গ্রুপের ভিতরে, সেটা শুরুতেই খোলা
  const [openGroups, setOpenGroups] = useState(() =>
    navItems
      .filter((item) =>
        item.children?.some((child) => child.path === window.location.pathname),
      )
      .map((item) => item.key),
  );

  const toggleGroup = (key) =>
    setOpenGroups((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const role = admin?.role || "sub";
  const permissions = Array.isArray(admin?.permissions) ? admin.permissions : [];

  const canSee = (item) => {
    if (item.motherOnly) return role === "mother";
    if (role === "mother" || role === "viewer") return true;
    return !item.perm || permissions.includes(item.perm);
  };

  // ড্রপডাউনের ভিতরের লিংকগুলোও আলাদা করে বাছা হয় — নইলে sub অ্যাডমিন
  // এমন লিংক দেখতেন যেটা খুললে 403 ছাড়া কিছু নেই
  const visibleItems = navItems
    .filter(canSee)
    .map((item) =>
      item.children?.length
        ? { ...item, children: item.children.filter(canSee) }
        : item,
    )
    .filter((item) => !item.children || item.children.length > 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <>
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2.5 px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[var(--primary500)]/30 bg-white/10 shadow-[0_0_25px_rgba(249,185,1,0.20)] backdrop-blur">
          <img
            src="/assets/brand/header-logo.png"
            alt="BET CHOKKOR"
            className="h-6 w-auto object-contain"
            draggable="false"
          />
        </span>

        <span className="ad-title text-[13px] uppercase tracking-widest">
          Admin
        </span>
      </div>

      <nav className="ad-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;

          // ── ড্রপডাউন ──
          if (item.children?.length) {
            const isOpen = openGroups.includes(item.key);

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item.key)}
                  className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] px-4 text-[14px] font-medium text-[var(--text-secondary)] transition hover:bg-white/[0.06] hover:text-[var(--neutral100)]"
                >
                  <Icon size={18} className="shrink-0" />
                  {item.label}

                  <ChevronDown
                    size={16}
                    className={`ms-auto shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-1 space-y-1 border-s border-[var(--primary500)]/20 ps-3">
                    {item.children.map((child) => {
                      const ChildIcon = ICONS[child.icon] || LayoutDashboard;

                      return (
                        <NavLink
                          key={child.key}
                          to={child.path}
                          onClick={() => setOpen(false)}
                          className={linkClass}
                        >
                          <ChildIcon size={17} className="shrink-0" />
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div className="mb-3 px-2">
          <p className="truncate text-[13px] font-semibold text-[var(--neutral100)]">
            {admin?.email}
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {roleLabels[role] || role}
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="ad-btn ad-btn--ghost ad-btn--sm w-full"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="relative min-h-screen bg-[var(--neutral1000)]">
      <div className="ad-glow" aria-hidden="true" />
      {/* ── ডেস্কটপ সাইডবার ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-[var(--primary500)]/15 bg-white/[0.04] backdrop-blur-xl lg:flex">
        {sidebar}
      </aside>

      {/* ── মোবাইল ড্রয়ার ── */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 lg:hidden"
        style={{
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
        }}
      />

      <aside
        className="fixed inset-y-0 left-0 z-[51] flex w-[264px] max-w-[84vw] flex-col border-r border-[var(--primary500)]/15 bg-[var(--neutral900)]/95 backdrop-blur-xl transition-transform duration-300 lg:hidden"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-[var(--primary500)]/25 bg-white/[0.06] text-[var(--primary500)]"
        >
          <X size={18} />
        </button>

        {sidebar}
      </aside>

      <div className="relative z-10 lg:ps-[var(--sidebar-width)]">
        {/* ── টপবার ── */}
        <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] items-center gap-3 border-b border-[var(--primary500)]/15 bg-[var(--neutral1000)]/70 px-4 backdrop-blur-xl lg:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[12px] border border-[var(--primary500)]/25 bg-white/[0.06] text-[var(--primary500)] lg:hidden"
          >
            <Menu size={18} />
          </button>

          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <img
              src="/assets/brand/header-logo.png"
              alt="BET CHOKKOR"
              className="h-7 w-auto object-contain"
              draggable="false"
            />
          </Link>

          <div className="ms-auto flex items-center gap-3">
            {role === "viewer" && (
              <span className="flex items-center gap-2 rounded-full border border-[var(--primary500)]/30 bg-[var(--primary500)]/10 px-3 py-1.5 text-[12px] font-semibold text-[var(--primary500)]">
                <Eye size={14} />
                <span className="hidden sm:inline">
                  View only — no changes allowed
                </span>
                <span className="sm:hidden">View only</span>
              </span>
            )}

            {/* নিজের প্রোফাইল — সাইডবারে নয়, ডান কোণেই */}
            <NavLink
              to="/profile"
              title="My Profile"
              aria-label="My Profile"
              className={({ isActive }) =>
                `flex h-10 w-10 items-center justify-center rounded-full transition ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--primary400)] to-[var(--primary600)] text-[var(--neutral1000)] shadow-[0_8px_22px_rgba(249,185,1,0.28)]"
                    : "border border-[var(--primary500)]/30 bg-white/[0.06] text-[var(--primary500)] hover:bg-white/[0.12]"
                }`
              }
            >
              <User size={18} />
            </NavLink>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
