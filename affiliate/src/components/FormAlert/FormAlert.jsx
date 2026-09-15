import React from "react";
import { TriangleAlert } from "lucide-react";

/**
 * ফর্মের উপরে ভুলের বার্তা।
 *
 * মডাল না দেখিয়ে ফর্মের ভিতরেই — ব্যবহারকারী যেখানে ভুল করেছেন তার
 * পাশেই লেখাটা থাকে, আর কিছু বন্ধ করতেও হয় না।
 */
const FormAlert = ({ children, tone = "danger" }) => {
  if (!children) return null;

  const color =
    tone === "success" ? "var(--status-success)" : "var(--status-danger)";

  return (
    <div
      className="flex items-start gap-2 rounded-[12px] px-4 py-3 text-[14px]"
      style={{
        background: `color-mix(in srgb, ${color}, transparent 88%)`,
        color,
      }}
    >
      <TriangleAlert size={16} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
};

export default FormAlert;
