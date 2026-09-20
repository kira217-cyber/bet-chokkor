import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { UserRound, Wallet } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectBottomNavItems } from "../../features/global/globalSelectors";
import { selectIsAuth } from "../../features/auth/authSelectors";
import { bottomNavItemsAuth } from "../../data/siteData";

// ডিপোজিট ও প্রোফাইলের ছবি-আইকন নেই, তাই lucide দিয়ে আঁকা হয়
const LUCIDE = { Wallet, UserRound };

/**
 * মোবাইলের নিচের ফিক্সড বার।
 *
 * লগআউট অবস্থায়: মেনু · ক্যাসিনো · স্লট · প্রমোশন
 * লগইনের পর: প্রমোশনের জায়গায় ডিপোজিট ও প্রোফাইল — মূল সাইটের মতোই,
 * তাতে মোবাইলে টাকা জমা দেওয়ার পথটা হাতের নাগালে থাকে।
 *
 * "মেনু" রুট নয়, সাইডবার ড্রয়ার খোলে।
 */
const BottomNavbar = ({ setSidebarOpen }) => {
  const { tv } = useLanguage();
  const { pathname } = useLocation();

  const guestItems = useSelector(selectBottomNavItems);
  const isAuth = useSelector(selectIsAuth);

  const items = isAuth ? bottomNavItemsAuth : guestItems;

  const content = (item, isActive) => {
    const Icon = item.lucide ? LUCIDE[item.lucide] : null;

    const color = isActive
      ? "var(--bnav-active, var(--primary500))"
      : "var(--bnav-inactive, var(--text-secondary))";

    return (
      <>
        {Icon ? (
          <Icon
            size={20}
            style={{ color }}
            className="shrink-0"
            strokeWidth={1.8}
          />
        ) : (
          <img
            src={item.icon}
            alt=""
            className="object-contain"
            style={{
              height: "calc(var(--u) * 5.333)",
              width: "calc(var(--u) * 5.333)",
            }}
            draggable="false"
          />
        )}

        <span
          className="leading-none"
          style={{ fontSize: "var(--fs-normal)", color }}
        >
          {tv(item.name)}
        </span>
      </>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 rounded-t-[var(--radius-10)] lg:hidden"
      style={{ height: "var(--bottom-bar-height)", background: "var(--bnav-bg, var(--neutral800))" }}
    >
      <div className="flex h-full items-stretch">
        {items.map((item) => {
          // ডিপোজিটের মতো ভিতরের পাতাতেও বাটনটা সক্রিয় দেখাবে
          const isActive =
            pathname === item.path ||
            (item.path !== "/" && pathname.startsWith(`${item.path}/`));

          const className =
            "flex flex-1 cursor-pointer flex-col items-center justify-center gap-1";

          if (item.key === "menu") {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSidebarOpen(true)}
                className={className}
              >
                {content(item, false)}
              </button>
            );
          }

          return (
            <Link key={item.key} to={item.path} className={className}>
              {content(item, isActive)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
