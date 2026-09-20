import React from "react";
import { Search } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

/* কী = হেল্প সাইটের আসল CSS টোকেন নাম */
const TOKENS = [
  ["bg", "Page background", "#0d0d0b"],
  ["bg-soft", "Soft background", "#16150f"],
  ["panel", "Panel / card bg", "#17160f"],
  ["gold", "Gold (accent)", "#d5aa1c"],
  ["gold-bright", "Gold bright", "#ffdf18"],
  ["gold-grad-top", "Topic card — top", "#f7d37a"],
  ["gold-grad-bottom", "Topic card — bottom", "#d29a06"],
  ["text", "Text", "#ffffff"],
  ["text-soft", "Soft text", "#d1d5dc"],
  ["text-mute", "Muted text", "#99a1af"],
  ["line", "Border / line", "#d5aa1c2e"],
];

const preview = (c) => (
  <div className="overflow-hidden rounded-[14px]" style={{ background: c["bg"] }}>
    <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: c["line"] }}>
      <span className="text-[13px] font-black" style={{ color: c["gold"] }}>Help-VIP</span>
      <span className="ms-auto rounded-full border px-3 py-1 text-[11px] font-bold" style={{ borderColor: c["gold"], color: c["gold"] }}>Log in</span>
    </div>
    <div className="p-4 text-center">
      <p className="text-[16px] font-extrabold" style={{ color: c["gold"] }}>How can we <span style={{ color: c["gold-bright"] }}>help</span> you?</p>
      <div className="mx-auto mt-3 flex h-10 items-center gap-2 rounded-[10px] border px-3" style={{ background: c["bg-soft"], borderColor: c["line"] }}>
        <Search size={14} style={{ color: c["gold"] }} />
        <span className="text-[11px]" style={{ color: c["text-mute"] }}>Search…</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {["Account", "Payment"].map((x) => (
          <div key={x} className="rounded-[10px] border p-2 text-left" style={{ background: c["panel"], borderColor: c["line"] }}>
            <p className="text-[11px] font-bold" style={{ color: c["text"] }}>{x}</p>
            <p className="text-[9px]" style={{ color: c["text-mute"] }}>2 articles</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HelpTheme = () => (
  <SectionThemePage
    scope="help/site"
    title="Help Theme"
    subtitle="Colors of the help site (background, gold accent, text, panels)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default HelpTheme;
