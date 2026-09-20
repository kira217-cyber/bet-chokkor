import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { ChevronDown, Menu, X } from "lucide-react";

import { useLang } from "./LangContext.jsx";
import { useHelp } from "./HelpData.jsx";

const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "https://betchokkor.com";

/**
 * পুরো Help-VIP সাইটের খোলস — উপরে হেডার, নিচে ফুটার, মাঝে পাতা।
 *
 * help-cazvip.com থেকে মেপে: কালো হেডার, বাঁয়ে লোগো, মাঝে নেভ, ডানে
 * সোনালি লগইন ও ভাষা। ফুটারে লোগো+বর্ণনা, কুইক লিংক, তথ্য, কপিরাইট।
 */
const LangMenu = () => {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);

  const label = lang === "bn" ? "বাংলা" : "Eng";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[15px] font-semibold text-white"
      >
        <span className="text-lg leading-none">🌐</span>
        {label}
        <ChevronDown size={14} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-32 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--panel)]"
          onMouseLeave={() => setOpen(false)}
        >
          {[
            ["en", "English"],
            ["bn", "বাংলা"],
          ].map(([code, name]) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setLang(code);
                setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-white/[0.06] ${
                lang === code ? "text-[var(--gold)]" : "text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const Layout = () => {
  const { t } = useLang();
  const { UI, FOOTER_QUICK, FOOTER_INFO, identity } = useHelp();
  const { pathname } = useLocation();
  const [drawer, setDrawer] = useState(false);

  const logoSrc = identity?.logo || `${import.meta.env.BASE_URL}assets/brand/header-logo.png`;
  const footerBg = identity?.footerBg || `${import.meta.env.BASE_URL}assets/footer-bg-scaled.webp`;

  const nav = [
    { label: UI.navHome, to: "/" },
    { label: UI.navTerms, to: "/terms" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      {/* ── হেডার ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
        <div className="hv-container flex h-[68px] items-center gap-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src={logoSrc}
              alt="BET CHOKKOR"
              className="h-7 w-auto object-contain"
              draggable="false"
            />
            <span className="text-[15px] font-black tracking-wide text-[var(--gold)]">
              {t(UI.brand)}
            </span>
          </Link>

          <nav className="ms-6 hidden items-center gap-6 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-[14px] transition-colors hover:text-white ${
                  pathname === item.to ? "text-white" : "text-[var(--text-soft)]"
                }`}
              >
                {t(item.label)}
              </Link>
            ))}
            <a
              href={CLIENT_URL}
              className="text-[14px] text-[var(--text-soft)] transition-colors hover:text-white"
            >
              {t(UI.navMain)}
            </a>
          </nav>

          <div className="ms-auto flex items-center gap-4">
            <a
              href={CLIENT_URL}
              className="hidden rounded-full border border-[var(--gold)] px-5 py-2 text-[14px] font-bold text-[var(--gold)] transition-colors hover:bg-[var(--gold)] hover:text-black sm:block"
            >
              {t(UI.login)}
            </a>

            <LangMenu />

            <button
              type="button"
              onClick={() => setDrawer(true)}
              aria-label="menu"
              className="text-white lg:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* ── মোবাইল ড্রয়ার ── */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="close"
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute right-0 top-0 flex h-full w-[260px] max-w-[80vw] flex-col gap-2 border-l border-[var(--line)] bg-[var(--panel)] p-5">
            <button
              type="button"
              onClick={() => setDrawer(false)}
              aria-label="close"
              className="mb-2 self-end text-[var(--text-mute)]"
            >
              <X size={20} />
            </button>

            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setDrawer(false)}
                className="rounded-lg px-3 py-3 text-[15px] text-white transition-colors hover:bg-white/[0.06]"
              >
                {t(item.label)}
              </Link>
            ))}
            <a
              href={CLIENT_URL}
              className="rounded-lg px-3 py-3 text-[15px] text-white transition-colors hover:bg-white/[0.06]"
            >
              {t(UI.navMain)}
            </a>
            <a
              href={CLIENT_URL}
              className="mt-2 rounded-full border border-[var(--gold)] px-5 py-2.5 text-center text-[14px] font-bold text-[var(--gold)]"
            >
              {t(UI.login)}
            </a>
          </div>
        </div>
      ) : null}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── ফুটার ── */}
      <footer
        className="border-t border-[var(--line)] bg-cover bg-center"
        style={{ backgroundImage: `url(${footerBg})` }}
      >
        <div className="hv-container grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-[320px]">
            <div className="flex items-center gap-2">
              <img
                src={logoSrc}
                alt="BET CHOKKOR"
                className="h-7 w-auto object-contain"
                draggable="false"
              />
              <span className="text-[15px] font-black text-[var(--gold)]">
                {t(UI.brand)}
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[var(--text-soft)]">
              {t(UI.footerAbout)}
            </p>
          </div>

          <div>
            <p className="mb-4 text-[14px] font-semibold text-white">
              {t(UI.quickLinks)}
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_QUICK.map((item) => (
                <li key={item.to + item.en}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-[var(--text-mute)] transition-colors hover:text-[var(--gold)]"
                  >
                    {t(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-[14px] font-semibold text-white">
              {t(UI.information)}
            </p>
            <ul className="flex flex-col gap-2.5">
              {FOOTER_INFO.map((item) => (
                <li key={item.to + item.en}>
                  <Link
                    to={item.to}
                    className="text-[14px] text-[var(--text-mute)] transition-colors hover:text-[var(--gold)]"
                  >
                    {t(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <a
              href={CLIENT_URL}
              className="inline-block rounded-full bg-[var(--gold)] px-6 py-2.5 text-[14px] font-bold text-black transition-[filter] hover:brightness-105"
            >
              {t(UI.navMain)}
            </a>
          </div>
        </div>

        <div className="border-t border-white/[0.06]">
          <div className="hv-container flex flex-wrap items-center justify-center gap-2 py-5 text-center text-[13px] text-white">
            <span>© {new Date().getFullYear()}</span>
            <b>BET CHOKKOR</b>
            <span>· {t(UI.copyright)}</span>
            <span className="text-white/30">|</span>
            <Link to="/privacy" className="text-[var(--gold)]">
              {t(UI.privacy)}
            </Link>
            <span className="text-white/30">|</span>
            <Link to="/terms" className="text-[var(--gold)]">
              {t(UI.terms)}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
