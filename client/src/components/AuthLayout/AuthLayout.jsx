import React from "react";
import { Link, useNavigate } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * লগইন ও রেজিস্টার পেজের শেল — হিরো ব্যানার + লগইন/সাইন আপ ট্যাব।
 *
 * মূল সাইট থেকে মাপা:
 *   মোবাইল — হিরো ব্যানার ৪৮u উঁচু উপরে, নিচে ট্যাব ও ফর্ম (প্যাডিং ৪.২৬৭u)
 *   ডেস্কটপ — হিরো পুরো পেজের ব্যাকগ্রাউন্ড; ফর্ম ব্লক ৫০০px, ১২০০px
 *   কেন্দ্রীভূত কলামের ডান প্রান্তে (তাই বড় স্ক্রিনেও ডান কিনারায় চলে যায় না)
 *   ট্যাব সারি ১১.৭৩u, লেখা --fs-larger/৬০০, অ্যাক্টিভ আন্ডারলাইন ০.৮u গোল্ড
 *   হেডার ৬৪px (ডেস্কটপ) / ১৩.৩৩u (মোবাইল), বাঁয়ে লোগো, ডানে হোম বাটন
 */
const AuthLayout = ({ active, children }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const tabs = [
    { key: "login", path: "/login", label: t("login") },
    { key: "register", path: "/register", label: t("signup") },
  ];

  return (
    <div className="auth-page min-h-screen bg-[var(--auth-page-bg)]">
      {/* ── হেডার ── */}
      <header className="auth-header fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-[var(--auth-header-bg)]">
        <Link to="/">
          <img
            src="/assets/brand/header-logo.png"
            alt="BET CHOKKOR"
            className="w-auto object-contain"
            style={{ height: "calc(var(--u) * 9.067)" }}
            draggable="false"
          />
        </Link>

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="home"
          className="flex cursor-pointer items-center justify-center bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
          style={{
            height: "calc(var(--u) * 9.067)",
            width: "calc(var(--u) * 9.067)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <img
            src="/assets/icons/utility/icon-home.svg"
            alt=""
            className="h-5 w-5"
            draggable="false"
          />
        </button>
      </header>

      <div className="auth-body">
        {/* ── হিরো ──
            মূল সাইটের লেয়ারগুলো হুবহু: ডার্ক বেস → bg-light.png কে mask
            করে কমলা আলোর বিম (opacity .7) → একই ছবি hard-light টেক্সচার
            হিসেবে → কাঁচের অবজেক্ট → গোল্ড overlay (.07) → ব্র্যান্ড লোগো। */}
        <div className="auth-hero">
          <span className="auth-hero__beam-color" />

          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/assets/auth/rwd-login-welcome-bg-light.png"
            />
            <img
              src="/assets/auth/mobile-login-welcome-bg-light.png"
              alt=""
              className="auth-hero__beam-texture"
              draggable="false"
            />
          </picture>

          <picture>
            <source
              media="(min-width: 1024px)"
              srcSet="/assets/auth/rwd-login-welcome-icon-category.png"
            />
            <img
              src="/assets/auth/mobile-login-welcome-icon-category.png"
              alt=""
              className="auth-hero__layer"
              draggable="false"
            />
          </picture>

          <span className="auth-hero__overlay" />

          <img
            src="/assets/brand/logo.png"
            alt="BET CHOKKOR"
            className="auth-hero__logo"
            draggable="false"
          />
        </div>

        {/* ── ট্যাব + ফর্ম ── */}
        <div className="auth-panel">
          <div className="flex">
            {tabs.map((tab) => {
              const isActive = tab.key === active;

              return (
                <Link
                  key={tab.key}
                  to={tab.path}
                  className="relative flex flex-1 items-center justify-center font-semibold transition-colors"
                  style={{
                    height: "calc(var(--u) * 11.73)",
                    fontSize: "var(--fs-larger)",
                    color: isActive
                      ? "var(--auth-tab-active)"
                      : "var(--auth-tab-inactive)",
                  }}
                >
                  {tab.label}

                  <span
                    className="absolute bottom-0 left-0 right-0 transition-colors"
                    style={{
                      height: "calc(var(--u) * 0.8)",
                      background: isActive
                        ? "var(--auth-tab-underline)"
                        : "var(--neutral700)",
                    }}
                  />
                </Link>
              );
            })}
          </div>

          <div style={{ padding: "calc(var(--u) * 4.267)" }}>{children}</div>
        </div>
      </div>

      <style>{`
        .auth-header {
          height: var(--header-height);
          padding-inline: calc(var(--u) * 4.267);
        }

        .auth-body {
          padding-top: var(--header-height);
        }

        .auth-hero {
          position: relative;
          width: 100%;
          height: calc(var(--u) * 48);
          overflow: hidden;
          background: var(--auth-page-bg);
        }

        .auth-hero > *,
        .auth-hero picture {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .auth-hero__beam-texture,
        .auth-hero__layer {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .auth-hero__beam-color {
          background: var(--auth-hero-beam);
          opacity: 0.7;
          -webkit-mask: url("/assets/auth/mobile-login-welcome-bg-light.png")
            center / cover no-repeat;
          mask: url("/assets/auth/mobile-login-welcome-bg-light.png") center /
            cover no-repeat;
        }

        .auth-hero__beam-texture {
          mix-blend-mode: hard-light;
          opacity: 0.7;
        }

        .auth-hero__overlay {
          background: var(--auth-hero-overlay);
          mix-blend-mode: overlay;
          opacity: 0.07;
        }

        /* কাঁচের ফ্রেমের ঠিক ভিতরে বসে — অবস্থান ছবির অনুপাতে */
        .auth-hero__logo {
          position: absolute;
          inset: auto;
          height: auto;
          left: 48.4%;
          top: 38.5%;
          width: 24.4%;
          transform: translate(-50%, -50%);
          object-fit: contain;
        }

        .auth-panel {
          width: 100%;
        }

        @media (min-width: 1024px) {
          .auth-header {
            height: var(--desktop-header-height);
            padding-inline: 16px;
          }

          .auth-body {
            position: relative;
            padding-top: var(--desktop-header-height);
            min-height: 100vh;
          }

          /* ডেস্কটপে হিরো পুরো পেজের ব্যাকগ্রাউন্ড, ফর্ম তার উপরে ভাসে */
          .auth-hero {
            position: absolute;
            inset: var(--desktop-header-height) 0 0 0;
            height: auto;
          }

          .auth-hero__beam-color {
            -webkit-mask-image: url("/assets/auth/rwd-login-welcome-bg-light.png");
            mask-image: url("/assets/auth/rwd-login-welcome-bg-light.png");
          }

          .auth-hero__logo {
            left: 20.3%;
            top: 43%;
            width: 15%;
          }

          .auth-panel {
            position: relative;
            width: 500px;
            /* ১২০০px কলামের ডান প্রান্ত = ভিউপোর্টের মাঝ থেকে ৬০০px ডানে */
            margin-inline-start: auto;
            margin-inline-end: max(16px, calc(50% - 600px));
            padding-top: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
