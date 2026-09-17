import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { Gift, Loader2, Zap } from "lucide-react";

import MemberPage from "./MemberPage";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import AmountPicker from "../../components/AmountPicker/AmountPicker";
import { useLanguage } from "../../Context/LanguageProvider";
import { authError } from "../../features/auth/authApi";
import { imageUrl } from "../../features/deposit/imageUrl";
import { selectUser } from "../../features/auth/authSelectors";
import {
  fetchAutoStatus,
  startAutoDeposit,
} from "../../features/deposit/depositApi";

const num = (value) => Number(value) || 0;

const SectionLabel = ({ children }) => (
  <p
    className="dep-section text-[var(--text-secondary)]"
    style={{
      marginTop: "calc(var(--u) * 4.267)",
      marginBottom: "calc(var(--u) * 2.133)",
    }}
  >
    {children}
  </p>
);

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
 * ডিজাইন ম্যানুয়াল ডিপোজিটের মতোই — একই বড় মেথড কার্ড, একই অঙ্ক
 * পিকার। শুধু এখানে চ্যানেল/নম্বর নেই; মেথড ও অঙ্ক বেছে দিলে সার্ভার
 * গেটওয়ে থেকে পেমেন্ট পাতার ঠিকানা এনে দেয়, সেখানেই পাঠানো হয়।
 */
const AutoDeposit = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [methodCode, setMethodCode] = useState("");
  const [bonusId, setBonusId] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    let alive = true;

    fetchAutoStatus()
      .then((data) => {
        if (!alive) return;

        setStatus(data);
        if (data?.methods?.length) setMethodCode(data.methods[0].code);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const methods = status?.methods || [];
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

  const amountOk =
    base > 0 && (min <= 0 || base >= min) && (max <= 0 || base <= max);

  // মেথড থাকলে একটা বাছাই লাগবে — ম্যানুয়ালের মতোই
  const methodOk = methods.length === 0 || Boolean(methodCode);
  const canSubmit = amountOk && methodOk && !busy;

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
      maxWidth="820px"
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
          style={{ gap: 0 }}
          onSubmit={handleSubmit}
        >
          <FormAlert>{error}</FormAlert>

          {/* ── উপায় ── ম্যানুয়াল ডিপোজিটের মতোই বড় কার্ড */}
          {methods.length > 0 && (
            <>
              <SectionLabel>{t("selectPayment")}</SectionLabel>

              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "calc(var(--u) * 2.133)",
                }}
              >
                {methods.map((item) => {
                  const active = item.code === methodCode;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setMethodCode(item.code)}
                      className="dep-card flex cursor-pointer flex-col items-center justify-center bg-[var(--neutral800)] transition-colors"
                      style={{
                        borderRadius: "var(--radius-10)",
                        border: `1px solid ${
                          active ? "var(--primary500)" : "transparent"
                        }`,
                      }}
                    >
                      {item.logoUrl ? (
                        <img
                          src={imageUrl(item.logoUrl)}
                          alt=""
                          className="dep-logo object-contain"
                          draggable="false"
                        />
                      ) : (
                        <span className="dep-logo dep-label flex items-center justify-center rounded-full bg-[var(--neutral700)] font-bold text-[var(--primary500)]">
                          {(tv(item.name) || item.code)
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}

                      <span className="dep-label px-1 text-center leading-tight text-[var(--text-primary)]">
                        {tv(item.name) || item.code}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── বোনাস ── */}
          {bonuses.length > 0 && (
            <>
              <SectionLabel>{t("selectBonus")}</SectionLabel>

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
                      className="dep-row flex w-full cursor-pointer items-center justify-between bg-[var(--neutral800)] transition-colors"
                      style={{
                        borderRadius: "var(--radius-10)",
                        paddingInline: "calc(var(--u) * 4.267)",
                        border: `1px solid ${
                          active ? "var(--primary500)" : "transparent"
                        }`,
                      }}
                    >
                      <span
                        className="dep-label flex items-center font-semibold text-[var(--neutral100)]"
                        style={{ gap: "calc(var(--u) * 2.133)" }}
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
            </>
          )}

          {/* ── অঙ্ক ── ম্যানুয়ালের মতোই চিপসহ পিকার */}
          <SectionLabel>{t("depositAmount")}</SectionLabel>

          <FormField
            error={base > 0 && !amountOk ? `${t("minMax")}: ${min} / ${max}` : ""}
          >
            <AmountPicker
              value={amount}
              onChange={setAmount}
              placeholder={t("amountPlaceholder")}
              currency={user?.currency || "BDT"}
              min={min}
              max={max}
            />
          </FormField>

          {base > 0 && (
            <div
              className="bg-[var(--neutral900)]"
              style={{
                marginTop: "calc(var(--u) * 4.267)",
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
            disabled={!canSubmit}
            className="dep-btn flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
            style={{
              marginTop: "calc(var(--u) * 6.4)",
              borderRadius: "var(--radius-10)",
              gap: "calc(var(--u) * 2.133)",
              backgroundColor: canSubmit
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
