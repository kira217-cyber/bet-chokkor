import React from "react";
import { X, TriangleAlert } from "lucide-react";

import SectionThemePage from "./SectionThemePage";

const TOKENS = [
  ["modal-bg", "Modal background", "#292926"],
  ["modal-border", "Modal border", "#3d3d39"],
  ["modal-title", "Title text", "#ffffff"],
  ["modal-text", "Body text", "#cdcdcb"],
  ["modal-btn-bg", "Secondary button bg", "#383835"],
  ["modal-btn-hover", "Secondary button hover", "#3d3d39"],
  ["modal-primary-bg", "Primary button bg", "#f9b901"],
  ["modal-primary-text", "Primary button text", "#292926"],
];

const preview = (c) => (
  <div className="flex justify-center rounded-[14px] p-5" style={{ background: "#0e0e0d" }}>
    <div className="relative w-full max-w-[300px] rounded-[16px] border p-5 text-center" style={{ background: c["modal-bg"], borderColor: c["modal-border"] }}>
      <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full" style={{ background: c["modal-btn-bg"], color: c["modal-text"] }}>
        <X size={14} />
      </span>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "#f9b90122", color: "#f9b901" }}>
        <TriangleAlert size={20} />
      </span>
      <p className="mt-3 text-[15px] font-extrabold" style={{ color: c["modal-title"] }}>Are you sure?</p>
      <p className="mt-1 text-[12px]" style={{ color: c["modal-text"] }}>This action needs your confirmation.</p>
      <div className="mt-4 flex gap-3">
        <span className="flex-1 rounded-[10px] py-2 text-[12px] font-bold" style={{ background: c["modal-btn-bg"], color: c["modal-text"] }}>Cancel</span>
        <span className="flex-1 rounded-[10px] py-2 text-[12px] font-bold" style={{ background: c["modal-primary-bg"], color: c["modal-primary-text"] }}>Confirm</span>
      </div>
    </div>
  </div>
);

const ModalSetting = () => (
  <SectionThemePage
    scope="client/modal"
    title="Modal Theme"
    subtitle="Colors of pop-up modals (alert, confirm, coming-soon, maintenance)."
    tokens={TOKENS}
    renderPreview={preview}
  />
);

export default ModalSetting;
