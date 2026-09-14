import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Loader2, Wallet } from "lucide-react";

import MemberPage from "./MemberPage";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  GROUPS,
  fetchDepositMethods,
  groupTopPercent,
} from "../../features/deposit/depositApi";

/**
 * ডিপোজিটের প্রথম পর্দা — কোন ধরনের উপায়ে টাকা দেবেন।
 *
 * মূল সাইট থেকে মাপা: সারি ১৬u উঁচু (bg neutral800, radius --radius-10,
 * ভিতরে দুপাশে ৪.২৬৭u), সারির মাঝে ২.১৩৩u ফাঁক, ডানে সোনালি
 * "১০০% পর্যন্ত" ৩.২u আর একটা শেভরন।
 *
 * যে ভাগে একটাও চালু উপায় নেই সেটা দেখানো হয় না — নইলে ঢুকে খালি
 * পর্দা পাওয়া যেত।
 */
const Deposit = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchDepositMethods()
      .then((list) => alive && setMethods(list))
      .catch(() => alive && setMethods([]))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const rows = GROUPS.map((group) => {
    const inGroup = methods.filter((method) => method.group === group.key);

    return { ...group, methods: inGroup, percent: groupTopPercent(inGroup) };
  }).filter((group) => group.methods.length > 0);

  return (
    <MemberPage title={t("deposit")} onBack={() => navigate("/")}>
      {loading ? (
        <div
          className="flex items-center justify-center text-[var(--text-muted)]"
          style={{ gap: "calc(var(--u) * 2.133)", paddingBlock: "calc(var(--u) * 10.667)" }}
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
          {rows.map((group) => (
            <button
              key={group.key}
              type="button"
              onClick={() => navigate(`/member/wallet/deposit/${group.key}`)}
              className="flex w-full cursor-pointer items-center justify-between bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
              style={{
                height: "calc(var(--u) * 16)",
                borderRadius: "var(--radius-10)",
                paddingInline: "calc(var(--u) * 4.267)",
              }}
            >
              <span
                className="flex items-center font-semibold text-[var(--neutral100)]"
                style={{
                  gap: "calc(var(--u) * 2.133)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                <Wallet size={16} className="text-[var(--primary500)]" />
                {t(group.labelKey)}
              </span>

              <span
                className="flex items-center"
                style={{ gap: "calc(var(--u) * 1.6)" }}
              >
                {group.percent > 0 && (
                  <span
                    className="text-[var(--primary500)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {t("upToPercent").replace("{n}", group.percent)}
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
