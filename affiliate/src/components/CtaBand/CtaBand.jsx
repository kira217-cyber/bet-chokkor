import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectAffiliateHome } from "../../features/global/globalSelectors";

/** পেজের শেষে যোগ দেওয়ার আহ্বান */
const CtaBand = () => {
  const { t, tv } = useLanguage();
  const c = useSelector(selectAffiliateHome)?.cta || {};

  return (
    <section className="aff-glow border-y border-[var(--neutral800)] bg-[var(--neutral900)]">
      <div className="aff-container flex flex-col items-center gap-6 py-14 text-center lg:flex-row lg:justify-between lg:py-16 lg:text-start">
        <div className="max-w-xl">
          <h2 className="aff-h2">{tv(c.title) || t("ctaTitle")}</h2>
          <p className="aff-lead">{tv(c.text) || t("ctaText")}</p>
        </div>

        <Link to="/register" className="aff-btn aff-btn--primary shrink-0">
          {tv(c.button) || t("joinNow")}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
};

export default CtaBand;
