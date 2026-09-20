import React from "react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["mo-bg", "Section background", "#1c1c1a"],
  ["mo-rail-bg", "Sport rail / bar bg", "#141413"],
  ["mo-card-bg", "Match card bg", "#1e1e1e"],
  ["mo-card-header", "Card header bg", "#1d2ab8"],
  ["mo-live", "LIVE dot", "#00b585"],
  ["mo-odds-bg", "Odds cell bg", "#262626"],
  ["mo-status", "Status text", "#7b8cff"],
];

const preview = (c) => (
  <div className="rounded-[14px] p-3" style={{ background: c["mo-bg"] }}>
    <div className="flex gap-2">
      {/* rail */}
      <div className="flex w-16 shrink-0 flex-col justify-center gap-2 rounded-[10px] p-2" style={{ background: c["mo-rail-bg"] }}>
        <span className="text-[10px] font-bold text-white">SOCCER</span>
        <span className="text-[10px]" style={{ color: "#7e7e77" }}>TENNIS</span>
      </div>

      {/* match card */}
      <div className="flex-1 overflow-hidden rounded-[10px]" style={{ background: c["mo-card-bg"] }}>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ background: c["mo-card-header"] }}>
          <span className="text-[11px] font-bold text-white">Poland</span>
          <span className="flex items-center gap-1 text-[11px] font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: c["mo-live"] }} /> LIVE
          </span>
        </div>
        <div className="p-3">
          <div className="flex justify-between text-[12px] text-white"><span>Piast Gliwice</span><b>1</b></div>
          <div className="flex justify-between text-[12px] text-white"><span>Pogon Szczecin</span><b>2</b></div>
          <p className="mt-1 text-[11px]" style={{ color: c["mo-status"] }}>2nd half · 76:44</p>
          <div className="mt-2 flex gap-1.5">
            {["Home 34", "Draw 5", "Away 1.2"].map((o) => (
              <span key={o} className="flex-1 rounded-[5px] py-1.5 text-center text-[11px] font-bold text-white" style={{ background: c["mo-odds-bg"] }}>
                {o}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MatchOddsSetting = () => (
  <SectionThemePage
    scope="client/match-odds"
    title="Match Odds Theme"
    subtitle="Colors of the live match-odds panel on the home page."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default MatchOddsSetting;
