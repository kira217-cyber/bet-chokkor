import React from "react";
import { Clock } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["promo-title", "Page heading text", "#ffffff"],
  ["promo-tab-active-bg", "Active tab bg", "#f9b901"],
  ["promo-tab-active-text", "Active tab text", "#4c4d48"],
  ["promo-tab-bg", "Inactive tab bg", "#383835"],
  ["promo-tab-text", "Inactive tab text", "#cdcdcb"],
  ["promo-card-bg", "Promotion card bg", "#383835"],
  ["promo-accent", "Accent (tag, read more)", "#f9b901"],
];

const preview = (c) => (
  <div className="rounded-[14px] p-4" style={{ background: "#1c1c1a" }}>
    <p className="text-[15px] font-bold" style={{ color: c["promo-title"] }}>Promotion</p>
    <div className="mt-3 flex gap-2">
      <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: c["promo-tab-active-bg"], color: c["promo-tab-active-text"] }}>Welcome</span>
      <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: c["promo-tab-bg"], color: c["promo-tab-text"] }}>Slots</span>
      <span className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: c["promo-tab-bg"], color: c["promo-tab-text"] }}>Sports</span>
    </div>
    <div className="mt-3 overflow-hidden rounded-[10px]" style={{ background: c["promo-card-bg"] }}>
      <div className="h-16 w-full" style={{ background: "linear-gradient(120deg,#3a2f10,#141413)" }} />
      <div className="p-3">
        <div className="flex gap-1.5">
          <span className="rounded px-1.5 py-0.5 text-[9px] font-bold" style={{ background: c["promo-accent"], color: c["promo-tab-active-text"] }}>FDB</span>
          <span className="rounded px-1.5 py-0.5 text-[9px]" style={{ background: "#3d3d39", color: c["promo-tab-text"] }}>Welcome</span>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[9px]" style={{ color: "#a8a8a4" }}><Clock size={9} /> 2026/01/01 ~ 2026/12/31</p>
        <p className="mt-1 text-[11px] font-bold text-white">৳20,000 Welcome Bonus</p>
        <p className="mt-1.5 text-[11px] font-semibold" style={{ color: c["promo-accent"] }}>Read more ›</p>
      </div>
    </div>
  </div>
);

const PromotionThemeSetting = () => (
  <SectionThemePage
    scope="client/promotion"
    title="Promotion Theme"
    subtitle="Colors of the /promotion page (heading, tabs, cards, accent)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default PromotionThemeSetting;
