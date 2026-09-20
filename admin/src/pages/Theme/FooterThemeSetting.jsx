import React from "react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["footer-bg", "Footer background", "#1c1c1a"],
  ["footer-heading", "Column heading text", "#ebebea"],
  ["footer-accent", "Accent (block title, link hover)", "#f9b901"],
  ["footer-link", "Nav link text", "#a8a8a4"],
  ["footer-text", "Copyright / license text", "#a8a8a4"],
  ["footer-divider", "Divider line", "#ffffff1a"],
];

const preview = (c) => (
  <div className="rounded-[14px] p-4" style={{ background: c["footer-bg"] }}>
    {/* link columns */}
    <div className="grid grid-cols-2 gap-4">
      {["About", "Help"].map((h) => (
        <div key={h}>
          <p className="text-[12px] font-semibold" style={{ color: c["footer-heading"] }}>{h}</p>
          <p className="mt-1.5 text-[11px]" style={{ color: c["footer-link"] }}>About Us</p>
          <p className="mt-1 text-[11px]" style={{ color: c["footer-link"] }}>Contact</p>
        </div>
      ))}
    </div>

    <div className="my-3">
      <p className="text-[12px] font-semibold" style={{ color: c["footer-accent"] }}>Gaming License</p>
    </div>

    <div className="h-px w-full" style={{ background: c["footer-divider"] }} />

    {/* brand */}
    <div className="flex items-center gap-3 py-3">
      <span className="text-[13px] font-extrabold" style={{ color: c["footer-accent"] }}>BC</span>
      <div>
        <p className="text-[11px] font-semibold" style={{ color: c["footer-accent"] }}>Win like a king</p>
        <p className="text-[10px]" style={{ color: c["footer-text"] }}>© 2026 BetChokkor. All rights reserved.</p>
      </div>
    </div>

    <div className="h-px w-full" style={{ background: c["footer-divider"] }} />

    <p className="pt-3 text-[10px] leading-relaxed" style={{ color: c["footer-text"] }}>
      BetChokkor is operated under license. Play responsibly. 18+
    </p>
  </div>
);

const FooterThemeSetting = () => (
  <SectionThemePage
    scope="client/footer"
    title="Footer Theme"
    subtitle="Colors of the client site footer (links, brand, license)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default FooterThemeSetting;
