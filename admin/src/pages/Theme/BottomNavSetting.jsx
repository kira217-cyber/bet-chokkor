import React from "react";
import { Menu, Dices, Wallet, UserRound } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["bnav-bg", "Bar background", "#383835"],
  ["bnav-active", "Active item", "#f9b901"],
  ["bnav-inactive", "Inactive item", "#cdcdcb"],
];

const item = (c, Icon, label, active) => {
  const color = active ? c["bnav-active"] : c["bnav-inactive"];
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1">
      <Icon size={18} style={{ color }} />
      <span style={{ color, fontSize: 11 }}>{label}</span>
    </div>
  );
};

const preview = (c) => (
  <div className="flex items-stretch rounded-[12px] px-2 py-2" style={{ background: c["bnav-bg"], height: 62 }}>
    {item(c, Menu, "Menu", false)}
    {item(c, Dices, "Casino", true)}
    {item(c, Wallet, "Deposit", false)}
    {item(c, UserRound, "Profile", false)}
  </div>
);

const BottomNavSetting = () => (
  <SectionThemePage
    scope="client/bottom-nav"
    title="Bottom Navigation Theme"
    subtitle="Colors of the mobile bottom bar."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default BottomNavSetting;
