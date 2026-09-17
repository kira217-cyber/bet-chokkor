import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Banknote, ChevronRight, Loader2, Wallet } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAutoWithdrawStatus } from "../../features/withdraw/withdrawApi";

/**
 * উইথড্রয়ের প্রথম পর্দা — কোন পথে টাকা তুলবেন।
 *
 * ডিপোজিটের মতোই দুটো সারি: ম্যানুয়াল (নিজে নম্বর দিয়ে, অ্যাডমিন
 * অনুমোদন করে) আর অটো (গেটওয়ে নিজেই পাঠায়)। অটো বন্ধ থাকলে সারিটা
 * দেখানো হয় না, তখন শুধু ম্যানুয়াল।
 */
const WithdrawHome = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [autoActive, setAutoActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchAutoWithdrawStatus()
      .then((status) => alive && setAutoActive(Boolean(status?.active)))
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const rows = [
    {
      key: "manual",
      label: t("manualWithdraw"),
      hint: t("manualWithdrawHint"),
      Icon: Wallet,
      path: "/member/wallet/withdraw/manual",
    },
    ...(autoActive
      ? [
          {
            key: "auto",
            label: t("autoWithdraw"),
            hint: t("autoWithdrawHint"),
            Icon: Banknote,
            path: "/member/wallet/withdraw/auto",
          },
        ]
      : []),
  ];

  return (
    <MemberPage title={t("withdrawTitle")} onBack={() => navigate("/")}>
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

              <ChevronRight size={16} className="text-[var(--text-disabled)]" />
            </button>
          ))}
        </div>
      )}
    </MemberPage>
  );
};

export default WithdrawHome;
