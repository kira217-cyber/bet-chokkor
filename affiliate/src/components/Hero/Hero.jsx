import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, TrendingUp, Users } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectAffiliateHome } from "../../features/global/globalSelectors";

/**
 * হিরো — বাঁয়ে লেখা ও CTA, ডানে আয়ের ছোট প্রিভিউ কার্ড।
 * নিচে BetChokkor এর আসল অ্যাফিলিয়েট ক্রিয়েটিভ পুরো প্রস্থ জুড়ে
 * (ছবিটা ৩৮৪০×৪২০ — খুব চওড়া, তাই নিজের অনুপাতেই দেখানো হয়)।
 */
const Hero = () => {
  const { t, tv, isBangla } = useLanguage();
  const home = useSelector(selectAffiliateHome);
  const h = home?.hero || {};

  return (
    <section className="aff-glow overflow-hidden border-b border-[var(--neutral800)]">
      <div className="aff-container grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:py-20">
        <div className="text-center lg:text-start">
          <p className="aff-eyebrow">{tv(h.badge) || t("heroBadge")}</p>

          <h1 className="aff-h1">{tv(h.title) || t("heroTitle")}</h1>

          <p className="aff-lead mx-auto max-w-xl lg:mx-0">{tv(h.text) || t("heroText")}</p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
            <Link to="/register" className="aff-btn aff-btn--primary">
              {tv(h.joinBtn) || t("joinNow")}
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="aff-btn aff-btn--ghost">
              {tv(h.loginBtn) || t("login")}
            </Link>
          </div>
        </div>

        {/* ── আয়ের প্রিভিউ কার্ড ── */}
        <div className="aff-card mx-auto w-full max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--text-muted)]">
              {t("calcResult")}
            </span>

            <span className="flex items-center gap-1 rounded-full bg-[var(--neutral800)] px-2.5 py-1 text-[12px] font-semibold text-[var(--primary500)]">
              <TrendingUp size={13} />
              {tv(h.pill) || (isBangla ? "৫০%" : "50%")}
            </span>
          </div>

          <p className="mt-2 text-[34px] font-extrabold leading-none text-[var(--primary500)] lg:text-[40px]">
            {tv(h.earnFigure) || (isBangla ? "৳৫,০০,০০০" : "৳500,000")}
          </p>

          {/* সরল বার-চার্ট — ছয় মাসের বাড়তে থাকা আয় */}
          <div className="mt-6 flex h-28 items-end gap-2">
            {[28, 42, 38, 58, 74, 100].map((height, index) => (
              <span
                key={height}
                className="flex-1 rounded-t-[6px]"
                style={{
                  height: `${height}%`,
                  background:
                    index === 5
                      ? "var(--primary500)"
                      : "color-mix(in srgb, var(--primary500), transparent 78%)",
                }}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 border-t border-[var(--neutral800)] pt-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--primary500)]">
              <Users size={18} />
            </span>

            <div>
              <p className="text-[15px] font-bold text-[var(--neutral100)]">
                {tv(h.activePlayersValue) || (isBangla ? "১২৪ জন" : "124")}
              </p>
              <p className="text-[13px] text-[var(--text-muted)]">
                {tv(h.activePlayersLabel) || t("activePlayers")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── আসল অ্যাফিলিয়েট ব্যানার ── */}
      <div className="aff-container pb-12 lg:pb-16">
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={h.desktopImage || `${import.meta.env.BASE_URL}assets/banners/affiliate-desktop.jpg`}
          />
          <img
            src={h.mobileImage || `${import.meta.env.BASE_URL}assets/banners/affiliate-mobile.jpg`}
            alt={tv(h.title) || t("heroTitle")}
            className="hero-banner w-full rounded-2xl object-cover"
            draggable="false"
          />
        </picture>
      </div>

      <style>{`
        .hero-banner {
          aspect-ratio: 1125 / 540;
        }

        @media (min-width: 768px) {
          .hero-banner {
            aspect-ratio: 3840 / 420;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
