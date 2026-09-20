import React from "react";
import { ChevronLeft, ChevronRight, User, Lock, BadgeCheck } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["member-card-bg", "Card / section bg", "#292926"],
  ["member-surface-bg", "Surface (buttons, active menu)", "#383835"],
  ["member-surface-hover", "Hover / border", "#3d3d39"],
  ["member-accent", "Accent / primary button", "#f9b901"],
  ["member-title", "Title / label text", "#ffffff"],
  ["member-text", "Body / value text", "#cdcdcb"],
];

const preview = (c) => (
  <div className="rounded-[14px] p-3" style={{ background: "#1c1c1a" }}>
    {/* header row */}
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-[8px]" style={{ background: c["member-surface-bg"], color: c["member-text"] }}>
        <ChevronLeft size={14} />
      </span>
      <span className="text-[13px] font-bold" style={{ color: c["member-title"] }}>Profile</span>
    </div>

    <div className="flex gap-3">
      {/* side menu */}
      <div className="w-28 shrink-0 overflow-hidden rounded-[10px]" style={{ border: `1px solid ${c["member-surface-hover"]}` }}>
        {[["Personal", User, true], ["Security", Lock, false], ["Verify", BadgeCheck, false]].map(([label, Icon, active]) => (
          <div key={label} className="flex items-center gap-1.5 px-2.5 py-2 text-[11px]"
            style={active ? { background: c["member-surface-bg"], color: c["member-title"], fontWeight: 700 } : { color: c["member-text"] }}>
            <Icon size={12} /> {label}
          </div>
        ))}
      </div>

      {/* content card */}
      <div className="min-w-0 flex-1 overflow-hidden rounded-[10px]" style={{ background: c["member-card-bg"], border: `1px solid ${c["member-surface-hover"]}` }}>
        <div className="px-3 py-2 text-[12px] font-bold" style={{ color: c["member-title"] }}>Personal Info</div>
        {[["Name", "Rahim"], ["Phone", "+880 1XXX"], ["Email", "—"]].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-3 py-2 text-[11px]">
            <span style={{ color: c["member-title"] }}>{k}</span>
            <span className="flex items-center gap-1" style={{ color: c["member-text"] }}>
              {v} <ChevronRight size={12} style={{ color: "#7e7e77" }} />
            </span>
          </div>
        ))}
        <div className="p-3">
          <div className="flex h-8 items-center justify-center rounded-[8px] text-[12px] font-bold" style={{ background: c["member-accent"], color: c["member-card-bg"] }}>
            Save
          </div>
        </div>
      </div>
    </div>
  </div>
);

const MemberSetting = () => (
  <SectionThemePage
    scope="client/member"
    title="Member Theme"
    subtitle="Colors of profile, deposit, withdraw, history & referral pages."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default MemberSetting;
