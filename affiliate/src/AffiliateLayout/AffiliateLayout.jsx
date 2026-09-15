import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  BanknoteArrowDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Percent,
  Receipt,
  User,
  Users,
  X,
} from "lucide-react";

import { useLanguage } from "../Context/LanguageProvider";
import { logout } from "../features/auth/authSlice";
import { selectUser } from "../features/auth/authSelectors";

const NAV = [
  { to: "/dashboard", end: true, label: "navDashboard", Icon: LayoutDashboard },
  { to: "/dashboard/my-users", label: "navMyUsers", Icon: Users },
  { to: "/dashboard/commission", label: "navCommissionStatus", Icon: Percent },
  { to: "/dashboard/withdraw", label: "navWithdraw", Icon: BanknoteArrowDown },
  { to: "/dashboard/withdraw-history", label: "navWithdrawHistory", Icon: Receipt },
  { to: "/dashboard/profile", label: "navProfile", Icon: User },
];

const linkClass = ({ isActive }) =>
  `flex h-11 shrink-0 items-center gap-3 rounded-[12px] px-4 text-[14px] transition ${
    isActive
      ? "bg-[var(--primary500)] font-bold text-[var(--neutral1000)]"
      : "font-medium text-[var(--text-secondary)] hover:bg-white/[0.06] hover:text-[var(--text-primary)]"
  }`;

/**
 * লগইন করা অ্যাফিলিয়েটের খোলস — ডেস্কটপে বাঁয়ে স্থায়ী সাইডবার,
 * মোবাইলে ড্রয়ার।
 *
 * লিংকগুলোয় `shrink-0`, নইলে ছোট পর্দায় flex সেগুলোকে চেপে ছোট করে
 * ফেলত (অ্যাডমিনে ঠিক এই ভুলটাই হয়েছিল)।
 */
const AffiliateLayout = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const signOut = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

  const sidebar = (
    <>
      <div className="flex h-[64px] shrink-0 items-center gap-3 px-5">
        <img
          src="/assets/brand/header-logo.png"
          alt="BET CHOKKOR"
          className="h-7 w-auto object-contain"
          draggable="false"
        />
        <span className="text-[13px] font-bold uppercase tracking-widest text-[var(--primary500)]">
          {t("affiliatePanel")}
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
        {NAV.map((item) => {
          const ItemIcon = item.Icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <ItemIcon size={17} className="shrink-0" />
              {t(item.label)}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/[0.07] p-3">
        <div className="mb-3 px-2">
          <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
            {user?.userId}
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            {t("affiliateRole")}
          </p>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[var(--neutral600)] text-[14px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
        >
          <LogOut size={15} />
          {t("logout")}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--content-bg)]">
      {/* ডেস্কটপ সাইডবার */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[250px] flex-col border-r border-white/[0.07] bg-[var(--neutral900)] lg:flex">
        {sidebar}
      </aside>

      {/* মোবাইল ড্রয়ার */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 lg:hidden"
        style={{
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      <aside
        className="fixed inset-y-0 left-0 z-[51] flex w-[260px] max-w-[84vw] flex-col border-r border-white/[0.07] bg-[var(--neutral900)] transition-transform duration-300 lg:hidden"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("close")}
          className="absolute right-3 top-4 cursor-pointer text-[var(--text-muted)]"
        >
          <X size={20} />
        </button>

        {sidebar}
      </aside>

      <div className="lg:ps-[250px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center gap-3 border-b border-white/[0.07] bg-[var(--neutral900)]/90 px-4 backdrop-blur lg:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("menu")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[12px] bg-[var(--neutral800)] text-[var(--primary500)] lg:hidden"
          >
            <Menu size={19} />
          </button>

          <span className="text-[15px] font-bold text-[var(--text-primary)]">
            {t("affiliatePanel")}
          </span>

          <span className="ms-auto text-[14px] font-bold text-[var(--primary500)]">
            {user?.userId}
          </span>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AffiliateLayout;
