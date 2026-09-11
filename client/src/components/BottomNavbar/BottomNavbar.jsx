import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectBottomNavItems } from "../../features/global/globalSelectors";

/**
 * মোবাইলের নিচের ফিক্সড বার — মেনু / ক্যাসিনো / স্লট / প্রমোশন।
 * "মেনু" রুট নয়, সাইডবার ড্রয়ার খোলে।
 */
const BottomNavbar = ({ setSidebarOpen }) => {
  const { tv } = useLanguage();
  const { pathname } = useLocation();

  const items = useSelector(selectBottomNavItems);

  const content = (item, isActive) => (
    <>
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

      <span
        className="leading-none"
        style={{
          fontSize: "var(--fs-normal)",
          color: isActive ? "var(--primary500)" : "var(--text-secondary)",
        }}
      >
        {tv(item.name)}
      </span>
    </>
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 rounded-t-[var(--radius-10)] bg-[var(--neutral800)] lg:hidden"
      style={{ height: "var(--bottom-bar-height)" }}
    >
      <div className="flex h-full items-stretch">
        {items.map((item) => {
          const isActive = pathname === item.path;

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
