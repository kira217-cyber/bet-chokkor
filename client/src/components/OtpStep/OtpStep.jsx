import React, { useEffect, useRef, useState } from "react";

import FormField from "../FormField/FormField";
import FormAlert from "../FormAlert/FormAlert";
import { useLanguage } from "../../Context/LanguageProvider";
import { authError, sendOtp, verifyOtp } from "../../features/auth/authApi";

const RESEND_SECONDS = 60;

/**
 * OTP যাচাইয়ের ধাপ।
 *
 * রেজিস্টার, লগইন আর পাসওয়ার্ড পুনরুদ্ধার — তিন জায়গাতেই একই ধাপ,
 * তাই একবারই লেখা। কোড ঠিক হলে `onVerified()` ডাকা হয়।
 *
 * নম্বরটা এখানে ঢাকা অবস্থায় (০১৭***৮৯০১) দেখানো হয় — ব্যবহারকারী
 * নিজের নম্বর চিনবেন, কিন্তু কাঁধের উপর দিয়ে কেউ পড়ে নিতে পারবে না।
 */
const OtpStep = ({
  flow,
  site = "client",
  userId,
  countryCode = "+880",
  phone,
  maskedPhone,
  onVerified,
}) => {
  const { t } = useLanguage();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);

  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // আবার পাঠানোর জন্য অপেক্ষা — সার্ভারও ৬০ সেকেন্ডের আগে পাঠায় না
  useEffect(() => {
    if (left <= 0) return undefined;

    const timer = setTimeout(() => setLeft((prev) => prev - 1), 1000);

    return () => clearTimeout(timer);
  }, [left]);

  const target = userId ? { userId } : { countryCode, phone };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (otp.length < 4) return;

    try {
      setBusy(true);
      setError("");

      await verifyOtp({ flow, ...target, otp });

      onVerified();
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    try {
      setBusy(true);
      setError("");

      await sendOtp({ flow, site, ...target });

      setLeft(RESEND_SECONDS);
      setOtp("");
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit = otp.length >= 4 && !busy;

  return (
    <form
      className="flex flex-col"
      style={{ gap: "calc(var(--u) * 4.267)" }}
      onSubmit={handleVerify}
    >
      <FormAlert>{error}</FormAlert>

      <FormField label={t("otpTitle")}>
        <div
          className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
            placeholder={t("otpPlaceholder")}
            className="h-full w-full bg-transparent text-center text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
            style={{
              fontSize: "var(--fs-h4)",
              letterSpacing: "calc(var(--u) * 2.133)",
            }}
          />
        </div>
      </FormField>

      {maskedPhone && (
        <p
          className="text-center text-[var(--text-secondary)]"
          style={{ fontSize: "var(--fs-larger)" }}
        >
          {t("otpSentTo")} {maskedPhone}
        </p>
      )}

      <div className="flex items-center justify-center">
        {left > 0 ? (
          <span
            className="text-[var(--text-disabled)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("resendIn")} {left}
            {t("seconds")}
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={busy}
            className="cursor-pointer text-[var(--primary500)] underline underline-offset-4 disabled:opacity-60"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("resendOtp")}
          </button>
        )}
      </div>

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
        {busy ? t("loading") : t("verify")}
      </button>
    </form>
  );
};

export default OtpStep;
