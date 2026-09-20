import React from "react";
import { useSelector } from "react-redux";
import { Check } from "lucide-react";

import Section from "../Section/Section";
import Calculator from "../Calculator/Calculator";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectCommissionTiers, selectAffiliateHome } from "../../features/global/globalSelectors";

/**
 * কমিশন স্ল্যাব — ডেস্কটপে টেবিল, মোবাইলে কার্ড (টেবিল ছোট স্ক্রিনে
 * পড়া কঠিন হয়ে যায়)। সর্বোচ্চ স্ল্যাবটা গোল্ড বর্ডারে হাইলাইট করা।
 */
const Commission = () => {
  const { t, tv } = useLanguage();
  const staticTiers = useSelector(selectCommissionTiers);
  const c = useSelector(selectAffiliateHome)?.commission || {};

  const tiers = c.tiers?.length
    ? c.tiers.map((x, i) => ({ key: i, tier: i + 1, players: x.players, share: x.share }))
    : staticTiers;

  const topTier = tiers.length ? tiers[tiers.length - 1] : null;

  return (
    <Section
      id="commission"
      eyebrow={tv(c.eyebrow) || t("navCommission")}
      title={tv(c.title) || t("commissionTitle")}
      text={tv(c.text) || t("commissionText")}
    >
      <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start lg:gap-10">
        {/* ── ডেস্কটপ টেবিল ── */}
        <div className="aff-card hidden !p-0 sm:block">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr className="bg-[var(--neutral800)]">
                <th className="px-5 py-4 text-start text-[13px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {tv(c.tierLabel) || t("tierLabel")}
                </th>
                <th className="px-5 py-4 text-start text-[13px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {t("activePlayers")}
                </th>
                <th className="px-5 py-4 text-end text-[13px] font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  {tv(c.revenueShare) || t("revenueShare")}
                </th>
              </tr>
            </thead>

            <tbody>
              {tiers.map((tier) => {
                const isTop = tier.key === topTier?.key;

                return (
                  <tr
                    key={tier.key}
                    className="border-t border-[var(--neutral800)]"
                    style={
                      isTop
                        ? { background: "rgba(249, 185, 1, 0.06)" }
                        : undefined
                    }
                  >
                    <td className="px-5 py-4 text-[15px] font-semibold text-[var(--neutral100)]">
                      {tier.tier}
                    </td>
                    <td className="px-5 py-4 text-[15px] text-[var(--text-secondary)]">
                      {tv(tier.players)}
                    </td>
                    <td
                      className="px-5 py-4 text-end text-[18px] font-bold"
                      style={{
                        color: isTop
                          ? "var(--primary500)"
                          : "var(--neutral100)",
                      }}
                    >
                      {tier.share}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── মোবাইল কার্ড ── */}
        <div className="flex flex-col gap-3 sm:hidden">
          {tiers.map((tier) => {
            const isTop = tier.key === topTier?.key;

            return (
              <div
                key={tier.key}
                className="aff-card flex items-center justify-between !p-4"
                style={
                  isTop
                    ? { borderColor: "var(--primary500)", background: "rgba(249, 185, 1, 0.06)" }
                    : undefined
                }
              >
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-[var(--text-disabled)]">
                    {tv(c.tierLabel) || t("tierLabel")} {tier.tier}
                  </p>
                  <p className="mt-1 text-[15px] text-[var(--text-secondary)]">
                    {tv(tier.players)} {t("activePlayers")}
                  </p>
                </div>

                <p
                  className="text-[22px] font-bold"
                  style={{
                    color: isTop ? "var(--primary500)" : "var(--neutral100)",
                  }}
                >
                  {tier.share}%
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Calculator />

          <ul className="flex flex-col gap-3">
            {["why1Text", "why4Text", "why3Text"].map((key) => (
              <li key={key} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary500)] text-[var(--neutral600)]">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="aff-body">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
};

export default Commission;
