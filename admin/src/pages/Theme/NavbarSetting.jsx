import React from "react";
import { Coins, Eye, RefreshCw } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["nav-header-bg", "Header background", "#292926"],
  ["nav-card-bg", "Balance / VP card bg", "#383835"],
  ["nav-card-text", "Balance / VP text", "#ffffff"],
  ["nav-circle-bg", "Eye / refresh circle bg", "#1c1c1a"],
  ["nav-icon", "Eye / refresh icon", "#7e7e77"],
  ["nav-deposit-bg", "Deposit button bg", "#f9b901"],
  ["nav-deposit-text", "Deposit text", "#4c4d48"],
  ["nav-withdraw-bg", "Withdraw button bg", "#3d3d39"],
  ["nav-withdraw-text", "Withdraw text", "#ebebea"],
  ["nav-login-bg", "Login button bg", "#3d3d39"],
  ["nav-login-text", "Login text", "#ebebea"],
  ["nav-signup-bg", "Sign up button bg", "#f9b901"],
  ["nav-signup-text", "Sign up text", "#4c4d48"],
];

const chip = (bg, text, label) => (
  <span className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold" style={{ background: bg, color: text }}>
    {label}
  </span>
);

const preview = (c) => (
  <>
    <div className="flex items-center gap-2 overflow-x-auto rounded-[12px] p-3" style={{ background: c["nav-header-bg"] }}>
      <span className="flex shrink-0 items-center gap-1 rounded-[10px] px-2.5 py-1.5" style={{ background: c["nav-card-bg"] }}>
        <Coins size={13} style={{ color: "#f9b901" }} />
        <b style={{ color: c["nav-card-text"], fontSize: 12 }}>8000</b>
      </span>
      <span className="flex shrink-0 items-center rounded-[10px] px-2.5 py-1.5" style={{ background: c["nav-card-bg"] }}>
        <b style={{ color: c["nav-card-text"], fontSize: 12 }}>৳ 1,250</b>
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: c["nav-circle-bg"], color: c["nav-icon"] }}>
        <Eye size={13} />
      </span>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: c["nav-circle-bg"], color: c["nav-icon"] }}>
        <RefreshCw size={13} />
      </span>
      {chip(c["nav-withdraw-bg"], c["nav-withdraw-text"], "Withdraw")}
      {chip(c["nav-deposit-bg"], c["nav-deposit-text"], "Deposit")}
    </div>

    <div className="mt-3 flex items-center justify-between gap-2 rounded-[12px] p-3" style={{ background: c["nav-header-bg"] }}>
      <span className="text-[16px] font-black" style={{ color: "#f9b901" }}>BC</span>
      <div className="flex gap-2">
        {chip(c["nav-login-bg"], c["nav-login-text"], "Login")}
        {chip(c["nav-signup-bg"], c["nav-signup-text"], "Sign Up")}
      </div>
    </div>
  </>
);

const NavbarSetting = () => (
  <SectionThemePage
    scope="client/navbar"
    title="Navbar Theme"
    subtitle="Colors of the client header — cards, buttons, icons."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default NavbarSetting;
