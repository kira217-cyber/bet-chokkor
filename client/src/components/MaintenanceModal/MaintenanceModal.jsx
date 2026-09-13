import React from "react";
import { Wrench } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * সাইট রক্ষণাবেক্ষণে থাকলে যা দেখায়।
 *
 * ইচ্ছে করেই বন্ধ করার বোতাম নেই — অ্যাডমিন মোড নামানো পর্যন্ত
 * কনটেন্ট দেখানো উচিত নয়। "আবার চেষ্টা করুন" পেজটা নতুন করে লোড করে,
 * তাই মোড নামলে সাথে সাথেই সাইট ফিরে আসে।
 */
const MaintenanceModal = ({ setting }) => {
  const { tv, t } = useLanguage();

  const title = tv(setting?.title) || t("maintenanceTitle");
  const message = tv(setting?.message) || t("maintenanceText");

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--neutral1000)] px-4"
    >
      <div
        className="w-full max-w-[400px] rounded-[16px] border border-[var(--neutral700)] bg-[var(--neutral900)] p-7 text-center"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,.55)" }}
      >
        <span className="mx-auto flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[var(--primary500)]/10 text-[var(--primary500)]">
          <Wrench size={36} />
        </span>

        <img
          src="/assets/brand/header-logo.png"
          alt="BET CHOKKOR"
          className="mx-auto mt-5 h-7 w-auto object-contain"
          draggable="false"
        />

        <p className="mt-4 text-[18px] font-extrabold text-[var(--primary500)]">
          {title}
        </p>

        <p className="mt-3 text-[14px] leading-relaxed text-[var(--neutral300)]">
          {message}
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 h-[44px] w-full cursor-pointer rounded-[10px] bg-[var(--primary500)] text-[14px] font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-[1.06]"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
};

export default MaintenanceModal;
