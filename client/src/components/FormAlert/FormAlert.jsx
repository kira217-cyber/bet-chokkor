import React from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

const LOOK = {
  error: { Icon: CircleAlert, color: "var(--status-danger)" },
  success: { Icon: CircleCheck, color: "var(--status-success)" },
  warning: { Icon: TriangleAlert, color: "var(--status-pending)" },
  info: { Icon: Info, color: "var(--status-info)" },
};

/**
 * ফর্মের ভিতরের বার্তা — মূল সাইটের মতো ইনলাইন ব্যানার।
 *
 * মূল সাইটে লগইন/রেজিস্টারের ভুল মডালে নয়, ফর্মের উপরে এই ব্যানারেই
 * দেখায় (লেখার রঙ #ff777c — মেপে নেওয়া)। ব্যবহারকারী ফর্ম ছেড়ে না
 * গিয়েই ভুলটা দেখতে পান, তাই ফর্মের ক্ষেত্রে এটাই ঠিক।
 *
 * বড় কোনো ফল (যেমন ডিপোজিট জমা হয়েছে) দেখাতে AlertModal ব্যবহার হয়।
 */
const FormAlert = ({ type = "error", children }) => {
  if (!children) return null;

  const look = LOOK[type] || LOOK.error;
  const { Icon } = look;

  return (
    <div
      role="alert"
      className="flex items-center"
      style={{
        gap: "calc(var(--u) * 2.133)",
        padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
        borderRadius: "var(--radius-10)",
        background: `color-mix(in srgb, ${look.color}, transparent 88%)`,
        color: look.color,
        fontSize: "var(--fs-larger)",
      }}
    >
      <Icon size={18} className="shrink-0" />
      <span className="leading-snug">{children}</span>
    </div>
  );
};

export default FormAlert;
