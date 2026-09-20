import React from "react";

import SectionThemePage from "./SectionThemePage";

/* কী = অ্যাফিলিয়েট সাইটের আসল CSS টোকেন নাম (ThemeApplier :root এ বসায়) */
const TOKENS = [
  ["primary500", "Accent / primary", "#f9b901"],
  ["primary400", "Accent light", "#f0c64c"],
  ["primary600", "Accent deep", "#e38614"],
  ["neutral1000", "Page background", "#1c1c1a"],
  ["neutral900", "Section background", "#292926"],
  ["neutral800", "Card background", "#383835"],
  ["neutral700", "Border / divider", "#3d3d39"],
  ["neutral100", "Heading text", "#ffffff"],
  ["text-secondary", "Body text", "#cdcdcb"],
  ["text-muted", "Muted text", "#a8a8a4"],
];

const preview = (c) => (
  <div className="overflow-hidden rounded-[14px]" style={{ background: c["neutral1000"] }}>
    <div className="p-4">
      <p className="text-[11px] font-semibold" style={{ color: c["primary500"] }}>AFFILIATE</p>
      <p className="text-[15px] font-black" style={{ color: c["neutral100"] }}>Turn your circle into income</p>
      <p className="mt-1 text-[11px]" style={{ color: c["text-secondary"] }}>Earn up to 50% revenue share every month.</p>
      <div className="mt-2 flex gap-2">
        <span className="rounded-[8px] px-3 py-1.5 text-[11px] font-bold" style={{ background: c["primary500"], color: c["neutral1000"] }}>Join now</span>
        <span className="rounded-[8px] border px-3 py-1.5 text-[11px] font-bold" style={{ borderColor: c["neutral700"], color: c["text-secondary"] }}>Login</span>
      </div>
    </div>
    <div className="p-4" style={{ background: c["neutral900"] }}>
      <div className="grid grid-cols-3 gap-2">
        {["50%", "24/7", "24"].map((v, i) => (
          <div key={i} className="rounded-[8px] p-2 text-center" style={{ background: c["neutral800"] }}>
            <p className="text-[13px] font-black" style={{ color: c["primary500"] }}>{v}</p>
            <p className="text-[8px]" style={{ color: c["text-muted"] }}>label</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AffiliateHomeTheme = () => (
  <SectionThemePage
    scope="affiliate/home"
    title="Affiliate Home Theme"
    subtitle="Colors of the affiliate site (palette — home, header, footer share it)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default AffiliateHomeTheme;
