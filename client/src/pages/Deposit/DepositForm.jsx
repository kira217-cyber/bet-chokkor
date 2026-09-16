import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Copy } from "lucide-react";

import MemberPage from "./MemberPage";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import AmountPicker from "../../components/AmountPicker/AmountPicker";
import { selectUser } from "../../features/auth/authSelectors";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { authError } from "../../features/auth/authApi";
import { previewCalc, submitDeposit } from "../../features/deposit/depositApi";
import { imageUrl } from "../../features/deposit/imageUrl";

const boxStyle = {
  height: "calc(var(--u) * 13.333)",
  borderRadius: "var(--radius-10)",
};

const inputStyle = {
  fontSize: "var(--fs-larger)",
  paddingInline: "calc(var(--u) * 4.267)",
};

const inputClass =
  "h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

/** হিসাবের এক লাইন */
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
      className={strong ? "font-bold text-[var(--primary500)]" : "text-[var(--text-primary)]"}
      style={{ fontSize: strong ? "var(--fs-h5)" : "var(--fs-larger)" }}
    >
      {value}
    </span>
  </div>
);

/**
 * ডিপোজিটের শেষ ধাপ — টাকার অঙ্ক আর অ্যাডমিনের চাওয়া তথ্য।
 *
 * যে নম্বরে টাকা পাঠাতে হবে সেটা উপরে কপি বাটনসহ থাকে, আর অঙ্ক লেখার
 * সাথে সাথেই বোনাস ও টার্নওভারের হিসাবটা নিচে দেখা যায় — জমা দেওয়ার
 * পর যেন কিছু অবাক করা না থাকে।
 */
const DepositForm = ({ method, channel, promo, contact, onBack }) => {
  const user = useSelector(selectUser);
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [amount, setAmount] = useState("");
  const [fields, setFields] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputs = method.inputs || [];
  const calc = previewCalc({ amount, method, channel, promo });

  const min = Number(method.minDepositAmount || 0);
  const max = Number(method.maxDepositAmount || 0);

  const amountOk =
    calc.amount > 0 &&
    (min <= 0 || calc.amount >= min) &&
    (max <= 0 || calc.amount <= max);

  const fieldsOk = inputs
    .filter((input) => input.required)
    .every((input) => String(fields[input.key] || "").trim());

  const canSubmit = amountOk && fieldsOk && !busy;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(contact?.number || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে কিছু করার নেই — নম্বরটা পর্দায় দেখাই যাচ্ছে
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!amountOk) {
      setError(t("amountRange"));
      return;
    }

    try {
      setBusy(true);
      setError("");

      await submitDeposit({
        methodId: method.methodId,
        channelId: channel.id,
        promoId: promo?.id || "none",
        amount: calc.amount,
        fields,
      });

      await showAlert({
        type: "success",
        title: t("depositDone"),
        message: t("depositDoneText"),
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MemberPage title={tv(method.methodName) || method.methodId} onBack={onBack}>
      <form
        className="flex flex-col"
        style={{ gap: "calc(var(--u) * 4.267)" }}
        onSubmit={handleSubmit}
      >
        <FormAlert>{error}</FormAlert>

        {/* ── যে নম্বরে টাকা পাঠাতে হবে ── */}
        {contact?.number && (
          <div
            className="flex items-center bg-[var(--neutral800)]"
            style={{
              borderRadius: "var(--radius-10)",
              padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
              gap: "calc(var(--u) * 3.2)",
            }}
          >
            {method.logoUrl && (
              <img
                src={imageUrl(method.logoUrl)}
                alt=""
                className="shrink-0 object-contain"
                style={{
                  height: "calc(var(--u) * 12.8)",
                  width: "calc(var(--u) * 12.8)",
                }}
                draggable="false"
              />
            )}

            <div className="min-w-0 flex-1">
              <p
                className="text-[var(--text-secondary)]"
                style={{ fontSize: "var(--fs-small)" }}
              >
                {t("sendMoneyTo")}
              </p>

              <p
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-h5)" }}
              >
                {contact.number}
              </p>
            </div>

            <button
              type="button"
              onClick={copyNumber}
              className="flex shrink-0 cursor-pointer items-center text-[var(--primary500)]"
              style={{
                gap: "calc(var(--u) * 1.6)",
                fontSize: "var(--fs-small)",
              }}
            >
              <Copy size={15} />
              {copied ? t("copied") : ""}
            </button>
          </div>
        )}

        {/* ── নির্দেশনা ── */}
        {tv(method.instructions) && (
          <FormAlert type="info">{tv(method.instructions)}</FormAlert>
        )}

        {/* ── টাকার অঙ্ক ── */}
        <FormField
          label={t("depositAmount")}
          error={
            calc.amount > 0 && !amountOk
              ? `${t("minMax")}: ${min} / ${max}`
              : ""
          }
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

        {/* ── অ্যাডমিনের চাওয়া তথ্য ── */}
        {inputs.map((input) => (
          <FormField key={input.key} label={tv(input.label) || input.key}>
            <div
              className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
              style={boxStyle}
            >
              <input
                type={input.type === "number" ? "text" : input.type || "text"}
                inputMode={
                  input.type === "number" || input.type === "tel"
                    ? "numeric"
                    : "text"
                }
                maxLength={input.maxLength > 0 ? input.maxLength : undefined}
                value={fields[input.key] || ""}
                onChange={(event) =>
                  setFields((prev) => ({
                    ...prev,
                    [input.key]: event.target.value,
                  }))
                }
                placeholder={tv(input.placeholder)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
          </FormField>
        ))}

        {/* ── হিসাব ── */}
        {calc.amount > 0 && (
          <div
            className="bg-[var(--neutral900)]"
            style={{
              borderRadius: "var(--radius-10)",
              padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
            }}
          >
            <Line label={t("depositAmount")} value={calc.amount} />

            {calc.totalBonus > 0 && (
              <Line label={t("bonusLine")} value={`+${calc.totalBonus}`} />
            )}

            <div
              style={{
                marginTop: "calc(var(--u) * 2.133)",
                paddingTop: "calc(var(--u) * 2.133)",
                borderTop: "1px solid var(--neutral800)",
              }}
            >
              <Line label={t("totalGet")} value={calc.credited} strong />

              {calc.targetTurnover > 0 && (
                <Line
                  label={`${t("turnoverLine")} (${calc.multiplier}×)`}
                  value={calc.targetTurnover}
                />
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
            fontSize: "var(--fs-larger)",
            backgroundColor: canSubmit
              ? "var(--primary500)"
              : "color-mix(in srgb, var(--primary500), black 40%)",
            color: "var(--btn-primary-txt)",
          }}
        >
          {busy ? t("loading") : t("submitDeposit")}
        </button>
      </form>
    </MemberPage>
  );
};

export default DepositForm;
