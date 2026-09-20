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
import { selectFeatures, selectAffiliateHome } from "../../features/global/globalSelectors";

/** ছয়টি ফিচার কার্ড — মোবাইলে ১, ট্যাবলেটে ২, ডেস্কটপে ৩ কলাম */
const WhyUs = () => {
  const { t, tv } = useLanguage();
  const features = useSelector(selectFeatures);
  const home = useSelector(selectAffiliateHome);
  const c = home?.whyUs || {};

  const list = c.features?.length
    ? c.features.map((f, i) => ({ key: i, icon: f.icon, title: tv(f.title), text: tv(f.text) }))
    : features.map((f) => ({ key: f.key, icon: f.icon, title: t(f.titleKey), text: t(f.textKey) }));

  return (
    <Section id="why-us" eyebrow={tv(c.eyebrow) || t("navWhyUs")} title={tv(c.title) || t("whyTitle")}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((item) => {
          const Icon = ICONS[item.icon] || Circle;

          return (
            <div key={item.key} className="aff-card">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[var(--neutral800)] text-[var(--primary500)]">
                <Icon size={20} />
              </span>

              <h3 className="aff-h3 mt-4">{item.title}</h3>
              <p className="aff-body mt-2">{item.text}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default WhyUs;
