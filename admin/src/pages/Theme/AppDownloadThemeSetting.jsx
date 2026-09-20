import React from "react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["appdl-section-bg", "Hero & features bg", "#0a0a09"],
  ["appdl-band-top", "Gold band — top", "#241802"],
  ["appdl-band-bottom", "Gold band — bottom", "#f9b901"],
  ["appdl-card-bg", "Experience card bg", "#22221e"],
  ["appdl-accent", "Gold accent", "#f9b901"],
];

const preview = (c) => (
  <div className="overflow-hidden rounded-[14px]">
    {/* hero */}
    <div className="p-4" style={{ background: c["appdl-section-bg"] }}>
      <p className="text-[13px] font-bold text-white">App title</p>
      <p className="mt-1 text-[10px] text-white/70">Download the app for the best experience.</p>
      <p className="mt-2 text-[11px] font-semibold" style={{ color: c["appdl-accent"] }}>Need help downloading?</p>
    </div>
    {/* band */}
    <div className="p-4 text-center" style={{ background: `linear-gradient(180deg, ${c["appdl-band-top"]}, ${c["appdl-band-bottom"]})` }}>
      <p className="text-[13px] font-black text-white">Experience it all</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-[8px] p-2 text-left" style={{ background: c["appdl-card-bg"], border: "1px solid rgba(249,185,1,.35)" }}>
            <p className="text-[10px] font-black text-white">Card {i + 1}</p>
            <p className="text-[8px] text-white/60">Short text</p>
          </div>
        ))}
      </div>
    </div>
    {/* features */}
    <div className="p-4" style={{ background: c["appdl-section-bg"] }}>
      <p className="text-[12px] font-black text-white">6 key features</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-[8px] p-2 text-center" style={{ background: "#292926", border: "1px solid #383835" }}>
            <span className="mx-auto mb-1 block h-5 w-5 rounded-full" style={{ background: `color-mix(in srgb, ${c["appdl-accent"]}, transparent 85%)` }} />
            <p className="text-[8px] text-white">Feature</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AppDownloadThemeSetting = () => (
  <SectionThemePage
    scope="client/app-download"
    title="App Download Theme"
    subtitle="Colors of the /app-download page (backgrounds, gold band, accent)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default AppDownloadThemeSetting;
