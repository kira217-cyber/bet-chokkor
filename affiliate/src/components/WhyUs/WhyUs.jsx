import React from "react";
import { useSelector } from "react-redux";
import {
  UserPlus,
  Share2,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  ShieldCheck,
  Headset,
  Megaphone,
  Circle,
} from "lucide-react";

// affiliateData এর icon নাম থেকে কম্পোনেন্ট
const ICONS = {
  UserPlus,
  Share2,
  Wallet,
  TrendingUp,
  BarChart3,
  Zap,
  ShieldCheck,
  Headset,
  Megaphone,
};

import Section from "../Section/Section";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectFeatures } from "../../features/global/globalSelectors";

/** ছয়টি ফিচার কার্ড — মোবাইলে ১, ট্যাবলেটে ২, ডেস্কটপে ৩ কলাম */
const WhyUs = () => {
  const { t } = useLanguage();
  const features = useSelector(selectFeatures);

  return (
    <Section id="why-us" eyebrow={t("navWhyUs")} title={t("whyTitle")}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => {
          const Icon = ICONS[item.icon] || Circle;

          return (
            <div key={item.key} className="aff-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--neutral800)] text-[var(--primary500)]">
                <Icon size={20} />
              </span>

              <h3 className="aff-h3 mt-4">{t(item.titleKey)}</h3>
              <p className="aff-body mt-2">{t(item.textKey)}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default WhyUs;
