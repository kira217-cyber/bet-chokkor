import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  LayoutDashboard,
  UserCog,
  User,
  Menu,
  X,
  LogOut,
  Eye,
} from "lucide-react";

import { navItems, roleLabels } from "../data/navigation";
import { logout } from "../features/auth/authSlice";
import { selectAdmin } from "../features/auth/authSelectors";

const ICONS = { LayoutDashboard, UserCog, User };

/**
 * অ্যাডমিন শেল — ডেস্কটপে বাঁয়ে স্থায়ী সাইডবার, মোবাইলে ড্রয়ার।
 * viewer হলে উপরে একটা ব্যাজ থাকে যাতে বোঝা যায় কিছু বদলানো যাবে না।
 */
const RootLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector(selectAdmin);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const role = admin?.role || "sub";
  const permissions = Array.isArray(admin?.permissions) ? admin.permissions : [];

  const visibleItems = navItems.filter((item) => {
    if (item.motherOnly) return role === "mother";
    if (role === "mother" || role === "viewer") return true;
    return !item.perm || permissions.includes(item.perm);
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const sidebar = (
    <>
      <div className="flex h-[var(--topbar-height)] shrink-0 items-center gap-2 px-5">
        <img
          src="/assets/brand/header-logo.png"
          alt="BET CHOKKOR"
          className="h-8 w-auto object-contain"
          draggable="false"
        />
        <span className="text-[12px] font-bold uppercase tracking-widest text-[var(--primary500)]">
          Admin
        </span>
      </div>

      <nav className="ad-scroll flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {visibleItems.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;

          return (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-[12px] px-4 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--primary500)] text-[var(--neutral600)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--neutral800)] hover:text-[var(--neutral100)]"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-[var(--neutral800)] p-3">
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
    <div className="min-h-screen bg-[var(--neutral1000)]">
      {/* ── ডেস্কটপ সাইডবার ── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col border-r border-[var(--neutral800)] bg-[var(--neutral900)] lg:flex">
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
        className="fixed inset-y-0 left-0 z-[51] flex w-[264px] max-w-[84vw] flex-col bg-[var(--neutral900)] transition-transform duration-300 lg:hidden"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] bg-[var(--neutral800)] text-[var(--primary500)]"
        >
          <X size={18} />
        </button>

        {sidebar}
      </aside>

      <div className="lg:ps-[var(--sidebar-width)]">
        {/* ── টপবার ── */}
        <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] items-center gap-3 border-b border-[var(--neutral800)] bg-[var(--neutral900)] px-4 lg:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] bg-[var(--neutral800)] text-[var(--text-primary)] lg:hidden"
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

          {role === "viewer" && (
            <span className="ms-auto flex items-center gap-2 rounded-full bg-[var(--neutral800)] px-3 py-1.5 text-[12px] font-semibold text-[var(--primary500)]">
              <Eye size={14} />
              <span className="hidden sm:inline">View only — no changes allowed</span>
              <span className="sm:hidden">View only</span>
            </span>
          )}
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
