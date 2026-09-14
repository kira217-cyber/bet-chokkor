import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Gift, Loader2, Zap } from "lucide-react";

import MemberPage from "./MemberPage";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import { useLanguage } from "../../Context/LanguageProvider";
import { authError } from "../../features/auth/authApi";
import {
  fetchAutoStatus,
  startAutoDeposit,
} from "../../features/deposit/depositApi";

const num = (value) => Number(value) || 0;

const Line = ({ label, value, strong }) => (
  <div
    className="flex items-baseline justify-between"
    style={{ paddingBlock: "calc(var(--u) * 1.067)" }}
  >
    <span
      className="text-[var(--text-secondary)]"
      style={{ fontSize: "var(--fs-larger)" }}
    >
      {label}
    </span>

    <span
      className={
        strong
          ? "font-bold text-[var(--primary500)]"
          : "text-[var(--text-primary)]"
      }
      style={{ fontSize: strong ? "var(--fs-h5)" : "var(--fs-larger)" }}
    >
      {value}
    </span>
  </div>
);

/**
 * অটো ডিপোজিট।
 *
 * এখানে চ্যানেল বা নম্বর নেই — গেটওয়ে নিজেই টাকা নেয় আর নিশ্চিত করে।
 * বোনাস আর অঙ্ক বেছে দিলে সার্ভার গেটওয়ে থেকে পেমেন্ট পাতার ঠিকানা
 * এনে দেয়, সেখানেই পাঠিয়ে দেওয়া হয়।
 */
const AutoDeposit = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [bonusId, setBonusId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    let alive = true;

    fetchAutoStatus()
      .then((data) => alive && setStatus(data))
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const bonuses = status?.bonuses || [];
  const bonus = bonuses.find((item) => item._id === bonusId) || null;

  const base = num(amount);
  const bonusAmount = bonus
    ? bonus.bonusType === "percent"
      ? (base * num(bonus.bonusValue)) / 100
      : num(bonus.bonusValue)
    : 0;
  const credited = base + bonusAmount;
  const multiplier = bonus ? num(bonus.turnoverMultiplier) : 0;

  const min = num(status?.minAmount);
  const max = num(status?.maxAmount);

  const amountOk = base > 0 && (min <= 0 || base >= min) && (max <= 0 || base <= max);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amountOk) {
      setError(t("amountRange"));
      return;
    }

    try {
      setBusy(true);
      setError("");

      const data = await startAutoDeposit({
        amount: base,
        ...(bonusId ? { bonusId } : {}),
      });

      if (!data.paymentUrl) {
        setError(t("somethingWrong"));
        return;
      }

      // গেটওয়ের নিজের পাতা — সাইটের বাইরে
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MemberPage
      title={t("autoDeposit")}
      onBack={() => navigate("/member/wallet/deposit")}
    >
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
      ) : !status?.active ? (
        <FormAlert type="info">{t("autoOffNow")}</FormAlert>
      ) : (
        <form
          className="flex flex-col"
          style={{ gap: "calc(var(--u) * 4.267)" }}
          onSubmit={handleSubmit}
        >
          <FormAlert>{error}</FormAlert>

          {bonuses.length > 0 && (
            <FormField label={t("selectBonus")}>
              <div
                className="flex flex-col"
                style={{ gap: "calc(var(--u) * 2.133)" }}
              >
                {[{ _id: "", title: null }, ...bonuses].map((item) => {
                  const active = item._id === bonusId;

                  return (
                    <button
                      key={item._id || "none"}
                      type="button"
                      onClick={() => setBonusId(item._id)}
                      className="flex w-full cursor-pointer items-center justify-between bg-[var(--neutral800)] transition-colors"
                      style={{
                        height: "calc(var(--u) * 14.667)",
                        borderRadius: "var(--radius-10)",
                        paddingInline: "calc(var(--u) * 4.267)",
                        border: `1px solid ${
                          active ? "var(--primary500)" : "transparent"
                        }`,
                      }}
                    >
                      <span
                        className="flex items-center font-semibold text-[var(--neutral100)]"
                        style={{
                          gap: "calc(var(--u) * 2.133)",
                          fontSize: "var(--fs-larger)",
                        }}
                      >
                        <Gift
                          size={16}
                          className={
                            item._id
                              ? "text-[var(--primary500)]"
                              : "text-[var(--text-disabled)]"
                          }
                        />

                        {item._id ? tv(item.title) : t("noBonus")}

                        {item._id && (
                          <span
                            className="text-[var(--primary500)]"
                            style={{ fontSize: "var(--fs-small)" }}
                          >
                            {item.bonusType === "percent"
                              ? `+${item.bonusValue}%`
                              : `+${item.bonusValue}`}
                          </span>
                        )}
                      </span>

                      <span
                        className="flex shrink-0 items-center justify-center rounded-full"
                        style={{
                          height: "calc(var(--u) * 5.333)",
                          width: "calc(var(--u) * 5.333)",
                          border: `1px solid ${
                            active ? "var(--primary500)" : "var(--neutral600)"
                          }`,
                          background: active ? "var(--primary500)" : "transparent",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </FormField>
          )}

          <FormField
            label={t("depositAmount")}
            error={base > 0 && !amountOk ? `${t("minMax")}: ${min} / ${max}` : ""}
          >
            <div
              className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
              style={{
                height: "calc(var(--u) * 13.333)",
                borderRadius: "var(--radius-10)",
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value.replace(/[^\d.]/g, ""))
                }
                placeholder={t("amountPlaceholder")}
                className="h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                style={{
                  fontSize: "var(--fs-larger)",
                  paddingInline: "calc(var(--u) * 4.267)",
                }}
              />
            </div>
          </FormField>

          {base > 0 && (
            <div
              className="bg-[var(--neutral900)]"
              style={{
                borderRadius: "var(--radius-10)",
                padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
              }}
            >
              <Line label={t("depositAmount")} value={base} />

              {bonusAmount > 0 && (
                <Line label={t("bonusLine")} value={`+${bonusAmount}`} />
              )}

              <div
                style={{
                  marginTop: "calc(var(--u) * 2.133)",
                  paddingTop: "calc(var(--u) * 2.133)",
                  borderTop: "1px solid var(--neutral800)",
                }}
              >
                <Line label={t("totalGet")} value={credited} strong />

                {multiplier > 0 && (
                  <Line
                    label={`${t("turnoverLine")} (${multiplier}×)`}
                    value={credited * multiplier}
                  />
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!amountOk || busy}
            className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
            style={{
              height: "calc(var(--u) * 13.333)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
              gap: "calc(var(--u) * 2.133)",
              backgroundColor:
                amountOk && !busy
                  ? "var(--primary500)"
                  : "color-mix(in srgb, var(--primary500), black 40%)",
              color: "var(--btn-primary-txt)",
            }}
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Zap size={16} />
            )}
            {busy ? t("loading") : t("payNow")}
          </button>
        </form>
      )}
    </MemberPage>
  );
};

export default AutoDeposit;
