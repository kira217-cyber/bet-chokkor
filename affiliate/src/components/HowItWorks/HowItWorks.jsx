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
import { selectSteps, selectAffiliateHome } from "../../features/global/globalSelectors";

/** তিন ধাপ — ডেস্কটপে পাশাপাশি, মাঝে ধাপের নম্বর বড় করে */
const HowItWorks = () => {
  const { t, tv } = useLanguage();
  const steps = useSelector(selectSteps);
  const home = useSelector(selectAffiliateHome);
  const c = home?.howItWorks || {};

  const list = c.steps?.length
    ? c.steps.map((s, i) => ({ key: i, icon: s.icon, title: tv(s.title), text: tv(s.text) }))
    : steps.map((s) => ({ key: s.key, icon: s.icon, title: t(s.titleKey), text: t(s.textKey) }));

  return (
    <Section
      id="how-it-works"
      eyebrow={tv(c.eyebrow) || t("navHowItWorks")}
      title={tv(c.title) || t("howTitle")}
      className="bg-[var(--neutral900)]"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {list.map((step, index) => {
          const Icon = ICONS[step.icon] || Circle;

          return (
            <div key={step.key} className="aff-card">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[var(--neutral800)] text-[var(--primary500)]">
                  <Icon size={22} />
                </span>

                <span className="text-[34px] font-extrabold leading-none text-[var(--neutral800)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="aff-h3 mt-5">{step.title}</h3>
              <p className="aff-body mt-2">{step.text}</p>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default HowItWorks;
