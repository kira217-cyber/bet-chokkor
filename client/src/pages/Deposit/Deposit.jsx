import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Loader2, Wallet, Zap } from "lucide-react";

import MemberPage from "./MemberPage";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchAutoStatus,
  fetchDepositMethods,
  topPercent,
} from "../../features/deposit/depositApi";

/**
 * ডিপোজিটের প্রথম পর্দা — কোন পথে টাকা দেবেন।
 *
 * Bajiman এ এই দুটো ট্যাব হয়ে থাকে (ডিপোজিট / অটো ডিপোজিট); এখানে
 * সেটাই দুটো সারি, কারণ মূল সাইটের member পেজগুলো মডাল নয়, পাতা।
 *
 * মূল সাইট থেকে মাপা: সারি ১৬u উঁচু (bg neutral800, radius
 * --radius-10, ভিতরে দুপাশে ৪.২৬৭u), মাঝে ২.১৩৩u ফাঁক, ডানে সোনালি
 * "১০০% পর্যন্ত" আর একটা শেভরন।
 *
 * অটো বন্ধ থাকলে সারিটা দেখানো হয় না — নইলে ঢুকে খালি পর্দা মিলত।
 */
const Deposit = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [auto, setAuto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([fetchDepositMethods(), fetchAutoStatus()])
      .then(([list, status]) => {
        if (!alive) return;

        setMethods(list);
        setAuto(status);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const rows = [
    ...(methods.length
      ? [
          {
            key: "manual",
            label: t("manualDeposit"),
            hint: t("manualDepositHint"),
            percent: topPercent(methods),
            Icon: Wallet,
            path: "/member/wallet/deposit/manual",
          },
        ]
      : []),
    ...(auto?.active
      ? [
          {
            key: "auto",
            label: t("autoDeposit"),
            hint: t("autoDepositHint"),
            percent: topPercent([], auto.bonuses),
            Icon: Zap,
            path: "/member/wallet/deposit/auto",
          },
        ]
      : []),
  ];

  return (
    <MemberPage title={t("deposit")} onBack={() => navigate("/")}>
      {loading ? (
        <div
          className="flex items-center justify-center text-[var(--text-muted)]"
          style={{
            gap: "calc(var(--u) * 2.133)",
            paddingBlock: "calc(var(--u) * 10.667)",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          {t("loading")}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="flex flex-col items-center text-center"
          style={{
            gap: "calc(var(--u) * 3.2)",
            paddingBlock: "calc(var(--u) * 10.667)",
          }}
        >
          <Wallet size={28} className="text-[var(--text-disabled)]" />
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("noMethodYet")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "calc(var(--u) * 2.133)" }}>
          {rows.map((row) => (
            <button
              key={row.key}
              type="button"
              onClick={() => navigate(row.path)}
              className="flex w-full cursor-pointer items-center justify-between bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
              style={{
                minHeight: "calc(var(--u) * 16)",
                borderRadius: "var(--radius-10)",
                paddingInline: "calc(var(--u) * 4.267)",
                paddingBlock: "calc(var(--u) * 2.133)",
              }}
            >
              <span
                className="flex items-center text-start"
                style={{ gap: "calc(var(--u) * 3.2)" }}
              >
                <row.Icon size={18} className="shrink-0 text-[var(--primary500)]" />

                <span className="flex flex-col">
                  <span
                    className="font-semibold text-[var(--neutral100)]"
                    style={{ fontSize: "var(--fs-larger)" }}
                  >
                    {row.label}
                  </span>

                  <span
                    className="text-[var(--text-disabled)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {row.hint}
                  </span>
                </span>
              </span>

              <span
                className="flex shrink-0 items-center"
                style={{ gap: "calc(var(--u) * 1.6)" }}
              >
                {row.percent > 0 && (
                  <span
                    className="text-[var(--primary500)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {t("upToPercent").replace("{n}", row.percent)}
                  </span>
                )}

                <ChevronRight size={16} className="text-[var(--text-disabled)]" />
              </span>
            </button>
          ))}
        </div>
      )}
    </MemberPage>
  );
};

export default Deposit;
