import React from "react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * লগইন ও রেজিস্টার পেজের শেয়ার্ড মোড়ক — গোল্ড আভার উপর কেন্দ্রীভূত কার্ড।
 * ক্লায়েন্ট সাইটের auth পেজের মতো হিরো ছবি নেই; অ্যাফিলিয়েট পেজ
 * ইচ্ছে করেই সাদামাটা রাখা হয়েছে, ফর্মেই নজর থাকে।
 */
const AuthCard = ({ title, subtitle, width = "480px", children, footer }) => {
  const { t } = useLanguage();

  return (
    <div className="aff-glow flex min-h-[calc(100vh-var(--header-height))] items-start justify-center lg:min-h-[calc(100vh-var(--desktop-header-height))]">
      <div className="aff-container flex justify-center py-10 lg:py-16">
        <div className="w-full" style={{ maxWidth: width }}>
          <div className="mb-7 text-center">
            <h1 className="aff-h2">{title}</h1>
            <p className="aff-lead !mt-3">{subtitle}</p>
          </div>

          <div className="aff-card">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-[14px] text-[var(--text-muted)]">
              {footer}
            </p>
          )}

          <p className="mt-6 text-center text-[12px] text-[var(--text-disabled)]">
            {t("ageNotice")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
