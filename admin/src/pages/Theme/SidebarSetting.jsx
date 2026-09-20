import React from "react";
import { Gift, Phone, Star } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["side-bg", "Sidebar background", "#292926"],
  ["side-row-bg", "Row background", "#383835"],
  ["side-row-hover", "Row hover", "#3d3d39"],
  ["side-text", "Row text", "#cdcdcb"],
  ["side-icon-bg", "Icon circle bg", "#3d3d39"],
  ["side-divider", "Divider", "#3d3d39"],
];

const row = (c, Icon, label) => (
  <div className="flex items-center gap-3 rounded-[10px] px-3" style={{ height: 44, background: c["side-row-bg"] }}>
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: c["side-icon-bg"] }}>
      <Icon size={15} style={{ color: "#f9b901" }} />
    </span>
    <span className="text-[13px] font-medium" style={{ color: c["side-text"] }}>{label}</span>
  </div>
);

const preview = (c) => (
  <div className="w-[220px] max-w-full rounded-[14px] p-3" style={{ background: c["side-bg"] }}>
    <div className="flex flex-col gap-2">
      {row(c, Star, "Favourites")}
      {row(c, Gift, "Promotions")}
      <span className="my-1 h-px w-full" style={{ background: c["side-divider"] }} />
      {row(c, Phone, "Contact")}
    </div>
  </div>
);

const SidebarSetting = () => (
  <SectionThemePage
    scope="client/sidebar"
    title="Sidebar Theme"
    subtitle="Colors of the client sidebar — rows, icons, dividers."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default SidebarSetting;
