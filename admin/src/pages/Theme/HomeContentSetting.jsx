import React from "react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["home-title", "Section title text", "#ffffff"],
  ["home-title-bar", "Title accent bar", "#f9b901"],
  ["home-card-bg", "Card background", "#383835"],
  ["home-card-hover", "Card hover", "#3d3d39"],
  ["home-card-text", "Card text", "#cdcdcb"],
  ["home-cat-active-bg", "Active category bg", "#f9b901"],
  ["home-cat-active-text", "Active category text", "#4c4d48"],
];

const preview = (c) => (
  <div className="rounded-[14px] p-3" style={{ background: "#1c1c1a" }}>
    {/* section title */}
    <div className="mb-3 flex items-center gap-2">
      <span style={{ width: 4, height: 20, background: c["home-title-bar"] }} />
      <span className="text-[15px] font-bold" style={{ color: c["home-title"] }}>Providers</span>
    </div>

    {/* category chips */}
    <div className="mb-3 flex gap-2">
      <span className="rounded-[10px] px-3 py-2 text-[12px] font-bold" style={{ background: c["home-cat-active-bg"], color: c["home-cat-active-text"] }}>
        Casino
      </span>
      <span className="rounded-[10px] px-3 py-2 text-[12px] font-bold" style={{ background: c["home-card-bg"], color: c["home-card-text"] }}>
        Slots
      </span>
      <span className="rounded-[10px] px-3 py-2 text-[12px] font-bold" style={{ background: c["home-card-bg"], color: c["home-card-text"] }}>
        Sports
      </span>
    </div>

    {/* provider cards */}
    <div className="grid grid-cols-3 gap-2">
      {["Evolution", "Pragmatic", "PG Soft"].map((p) => (
        <span key={p} className="flex items-center justify-center rounded-[10px] py-3 text-[12px] font-semibold" style={{ background: c["home-card-bg"], color: c["home-card-text"] }}>
          {p}
        </span>
      ))}
    </div>
  </div>
);

const HomeContentSetting = () => (
  <SectionThemePage
    scope="client/home"
    title="Home Content Theme"
    subtitle="Section titles and cards on the home page (categories, providers, notice)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default HomeContentSetting;
