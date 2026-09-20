import React from "react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["auth-page-bg", "Page background", "#1c1c1a"],
  ["auth-header-bg", "Header background", "#292926"],
  ["auth-hero-beam", "Hero light beam", "#e38614"],
  ["auth-hero-overlay", "Hero gold overlay", "#f9b901"],
  ["auth-tab-active", "Active tab text", "#ffffff"],
  ["auth-tab-inactive", "Inactive tab text", "#cdcdcb"],
  ["auth-tab-underline", "Active tab underline", "#f9b901"],
  ["auth-input-bg", "Input box bg", "#383835"],
  ["auth-link", "Link (forgot password)", "#f9b901"],
  ["auth-btn-bg", "Submit button bg", "#f9b901"],
  ["auth-btn-text", "Submit button text", "#4c4d48"],
];

const preview = (c) => (
  <div className="mx-auto max-w-[320px] overflow-hidden rounded-[14px]" style={{ background: c["auth-page-bg"] }}>
    {/* header */}
    <div className="flex h-9 items-center justify-between px-3" style={{ background: c["auth-header-bg"] }}>
      <span className="text-[12px] font-extrabold" style={{ color: c["auth-hero-overlay"] }}>BET CHOKKOR</span>
      <span className="h-5 w-5 rounded-[6px]" style={{ background: "#383835" }} />
    </div>

    {/* hero band */}
    <div className="relative h-16 overflow-hidden" style={{ background: c["auth-page-bg"] }}>
      <div className="absolute inset-0" style={{ background: c["auth-hero-beam"], opacity: 0.55, clipPath: "polygon(0 0, 60% 0, 40% 100%, 0 100%)" }} />
      <div className="absolute inset-0" style={{ background: c["auth-hero-overlay"], opacity: 0.12 }} />
    </div>

    {/* tabs */}
    <div className="flex">
      <div className="relative flex-1 py-2 text-center text-[12px] font-semibold" style={{ color: c["auth-tab-active"] }}>
        Login
        <span className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: c["auth-tab-underline"] }} />
      </div>
      <div className="relative flex-1 py-2 text-center text-[12px] font-semibold" style={{ color: c["auth-tab-inactive"] }}>
        Sign Up
        <span className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: "#3d3d39" }} />
      </div>
    </div>

    {/* form */}
    <div className="flex flex-col gap-2.5 p-4">
      <div className="h-9 rounded-[10px]" style={{ background: c["auth-input-bg"] }} />
      <div className="h-9 rounded-[10px]" style={{ background: c["auth-input-bg"] }} />
      <div className="text-right text-[11px] underline" style={{ color: c["auth-link"] }}>Forgot password?</div>
      <div className="flex h-9 items-center justify-center rounded-[10px] text-[12px] font-bold" style={{ background: c["auth-btn-bg"], color: c["auth-btn-text"] }}>
        Login
      </div>
    </div>
  </div>
);

const AuthSetting = () => (
  <SectionThemePage
    scope="client/auth"
    title="Auth Theme"
    subtitle="Colors of login, register and forgot-password pages."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default AuthSetting;
