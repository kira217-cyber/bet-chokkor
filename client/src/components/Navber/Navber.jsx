import React, { useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectSiteIdentify,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";
import { selectGameCategories } from "../../features/globalGame/globalGameSelectors";
import { selectIsAuth } from "../../features/auth/authSelectors";
import LanguageMenu from "../LanguageMenu/LanguageMenu";
import UserBar from "./UserBar";

// ডেস্কটপ হেডারে লোগোর পাশে যে দুটো কুইক-লিংক দেখানো হয়
const QUICK_LINK_KEYS = ["slot", "casino"];

/**
 * মূল সাইট থেকে মাপা:
 *   মোবাইল হেডার ৫২px (১৩.৩৩৩u), বাঁ প্যাডিং ৪.২৬৭u
 *   লোগো ৯.০৬৭u উঁচু · বাটন ২৪u × ৯.০৬৭u, --fs-larger/৭০০, radius --radius-10
 *   ভাষা ফ্ল্যাগ ৬.৪u
 *   ডেস্কটপ হেডার ১৩৬৬×৬৪, বাঁ প্যাডিং ৮px — পুরো প্রস্থ জুড়ে, সাইডবার
 *   এর নিচে শুরু হয়, তাই হ্যামবার্গারটা হেডারের ভিতরেই থাকে।
 */
const Navber = ({ setDesktopOpen }) => {
  const { t, tv } = useLanguage();

  const [langOpen, setLangOpen] = useState(false);

  const siteIdentify = useSelector(selectSiteIdentify);
  const loaded = useSelector(selectGlobalLoaded);
  const categories = useSelector(selectGameCategories);
  const isAuth = useSelector(selectIsAuth);

  const quickLinks = QUICK_LINK_KEYS.map((key) =>
    categories.find((item) => item.key === key),
  ).filter(Boolean);

  const logo = siteIdentify?.logo || "/assets/brand/header-logo.png";

  // লগইন বাটন মোবাইলে সলিড (on-surface), ডেস্কটপে আউটলাইন (tertiary) —
  // মূল সাইটে দুই জায়গায় দুই রকম
  const authButton = (to, text, variant) => (
    <Link
      to={to}
      className={`auth-btn auth-btn--${variant} flex cursor-pointer items-center justify-center transition-[filter] hover:brightness-110`}
      style={{
        height: "calc(var(--u) * 9.067)",
        minWidth: "calc(var(--u) * 24)",
        padding: "0 calc(var(--u) * 2.667)",
        borderRadius: "var(--radius-10)",
        fontSize: "var(--fs-larger)",
      }}
    >
      {text}
    </Link>
  );

  return (
    <header className="bc-header fixed left-0 right-0 top-0 z-50 flex items-center bg-[var(--header-bg)]">
      <div className="bc-header__inner flex w-full items-center justify-between">
        <div
          className="flex items-center"
          style={{ gap: "calc(var(--u) * 6)" }}
        >
          {/* ডেস্কটপে সাইডবার টগল হেডারের ভিতরেই */}
          <button
            type="button"
            onClick={() => setDesktopOpen((prev) => !prev)}
            aria-label="toggle menu"
            className="hidden h-[52px] w-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-10)] bg-[var(--neutral800)] text-[var(--primary500)] transition-colors hover:bg-[var(--neutral700)] lg:flex"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center">
            {loaded ? (
              <img
                src={logo}
                alt={siteIdentify?.siteName || "BET CHOKKOR"}
                className="w-auto object-contain"
                style={{ height: "calc(var(--u) * 9.067)" }}
                draggable="false"
              />
            ) : (
              <div
                className="animate-pulse rounded bg-[var(--neutral700)]"
                style={{
                  height: "calc(var(--u) * 9.067)",
                  width: "calc(var(--u) * 18)",
                }}
              />
            )}
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {quickLinks.map((item) => (
              <Link
                key={item.key}
                to={`/games/${item.key}`}
                className="flex items-center rounded-[10px] px-3 py-2 font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
                style={{
                  gap: "calc(var(--u) * 2.133)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                <img
                  src={item.icon}
                  alt=""
                  className="object-contain"
                  style={{
                    height: "calc(var(--u) * 6.4)",
                    width: "calc(var(--u) * 6.4)",
                  }}
                  draggable="false"
                />
                {tv(item.name)}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="flex items-center"
          style={{ gap: "calc(var(--u) * 2.133)" }}
        >
          {/* লগইন করা থাকলে লগইন/সাইন আপের বদলে ব্যালেন্স ও ডিপোজিট */}
          {isAuth ? (
            <UserBar />
          ) : (
            <>
              {authButton("/login", t("login"), "secondary")}
              {authButton("/register", t("signup"), "primary")}
            </>
          )}

          <button
            type="button"
            onClick={() => setLangOpen(true)}
            aria-label={t("currencyAndLanguage")}
            className="shrink-0 cursor-pointer overflow-hidden rounded-full"
            style={{
              height: "calc(var(--u) * 6.4)",
              width: "calc(var(--u) * 6.4)",
            }}
          >
            <img
              src="/assets/icons/flag/BD.png"
              alt="BD"
              className="h-full w-full object-cover"
              draggable="false"
            />
          </button>
        </div>
      </div>

      <LanguageMenu open={langOpen} onClose={() => setLangOpen(false)} />

      <style>{`
        .auth-btn {
          font-weight: 700;
        }

        .auth-btn--primary {
          background: var(--btn-primary-bg);
          color: var(--btn-primary-txt);
        }

        .auth-btn--secondary {
          background: var(--btn-secondary-bg);
          color: var(--btn-secondary-txt);
        }

        @media (min-width: 1024px) {
          .auth-btn {
            font-weight: 500;
          }

          .auth-btn--secondary {
            background: transparent;
            color: var(--neutral300);
            border: 1px solid var(--neutral600);
          }
        }

        .bc-header {
          height: var(--header-height);
        }

        .bc-header__inner {
          padding-inline: calc(var(--u) * 4.267);
        }

        @media (min-width: 1024px) {
          .bc-header {
            height: var(--desktop-header-height);
            /* সাইডবারের মতো একই সরু বিভাজক রেখা */
            border-bottom: 1px solid var(--neutral800);
          }

          .bc-header__inner {
            padding-inline: 8px 16px;
          }
        }
      `}</style>
    </header>
  );
};

export default Navber;
