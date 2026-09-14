import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import {
  authError,
  resetPassword,
  sendOtp,
} from "../../features/auth/authApi";

/**
 * ফরগেট পাসওয়ার্ড পেজ।
 *
 * মূল সাইট থেকে মাপা: কনটেন্ট কলাম ৫০০px কেন্দ্রীভূত (ভিতরে ১৬px প্যাডিং
 * বাদে ৪৬৮), টাইটেল সারি ৯.০৬৭u — ব্যাক বাটন ৯.০৬৭u বর্গ (bg neutral800,
 * radius --radius-10) + টাইটেল fs ২০px/৬০০। ব্যাকগ্রাউন্ডে গাঢ় সবুজ আভা।
 *
 * তিন ধাপ: ইউজারনেম → OTP → নতুন পাসওয়ার্ড। নম্বরটা ব্যবহারকারীকে
 * লিখতে হয় না — সার্ভার ইউজারনেম থেকে খুঁজে নেয় আর ঢাকা অবস্থায় দেখায়,
 * তাই অন্য কারো ইউজারনেম দিয়ে নম্বর জেনে নেওয়া যায় না।
 */
const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const inputBoxStyle = {
    height: "calc(var(--u) * 13.333)",
    borderRadius: "var(--radius-10)",
  };
  const inputStyle = {
    fontSize: "var(--fs-larger)",
    paddingInline: "calc(var(--u) * 4.267)",
  };
  const inputClass =
    "h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

  const buttonStyle = (enabled) => ({
    height: "calc(var(--u) * 13.333)",
    borderRadius: "var(--radius-10)",
    fontSize: "var(--fs-larger)",
    backgroundColor: enabled
      ? "var(--primary500)"
      : "color-mix(in srgb, var(--primary500), black 40%)",
    color: "var(--btn-primary-txt)",
  });

  const buttonClass =
    "flex w-full cursor-pointer items-center justify-center font-medium transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed";

  /** ইউজারনেম আছে কিনা দেখে কোড পাঠানো */
  const handleLookup = async (event) => {
    event.preventDefault();

    if (!username.trim() || busy) return;

    try {
      setBusy(true);
      setError("");

      const sent = await sendOtp({
        flow: "forgotPassword",
        site: "client",
        userId: username.trim(),
      });

      setMaskedPhone(sent.maskedPhone || "");

      // OTP বন্ধ থাকলে কোডের ধাপটা এড়িয়ে সোজা পাসওয়ার্ডে
      setStep(sent.required ? 1 : 2);
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }

    try {
      setBusy(true);
      setError("");

      await resetPassword({
        userId: username.trim(),
        newPassword: password,
      });

      await showAlert({
        type: "success",
        title: t("passwordChanged"),
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="forgot-page min-h-screen">
      <header className="forgot-header fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-[var(--header-bg)]">
        <Link to="/">
          <img
            src="/assets/brand/header-logo.png"
            alt="BET CHOKKOR"
            className="w-auto object-contain"
            style={{ height: "calc(var(--u) * 9.067)" }}
            draggable="false"
          />
        </Link>

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="home"
          className="flex cursor-pointer items-center justify-center bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
          style={{
            height: "calc(var(--u) * 9.067)",
            width: "calc(var(--u) * 9.067)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <img
            src="/assets/icons/utility/icon-home.svg"
            alt=""
            className="h-5 w-5"
            draggable="false"
          />
        </button>
      </header>

      <div className="forgot-body">
        <div className="forgot-panel">
          <div
            className="flex items-center"
            style={{
              gap: "calc(var(--u) * 4.267)",
              padding: "calc(var(--u) * 2.133) 0 calc(var(--u) * 4.267)",
            }}
          >
            <button
              type="button"
              onClick={() => (step > 0 ? setStep(step - 1) : navigate(-1))}
              aria-label="back"
              className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
              style={{
                height: "calc(var(--u) * 9.067)",
                width: "calc(var(--u) * 9.067)",
                borderRadius: "var(--radius-10)",
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <h1
              className="font-semibold text-[var(--neutral100)]"
              style={{ fontSize: "calc(var(--u) * 5.333)" }}
            >
              {t("forgotPasswordTitle")}
            </h1>
          </div>

          {step === 1 ? (
            <OtpStep
              flow="forgotPassword"
              userId={username.trim()}
              maskedPhone={maskedPhone}
              onVerified={() => setStep(2)}
            />
          ) : step === 2 ? (
            <form
              className="flex flex-col"
              style={{ gap: "calc(var(--u) * 4.267)" }}
              onSubmit={handleSave}
            >
              <FormAlert>{error}</FormAlert>

              <FormField label={t("newPassword")}>
                <div
                  className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
                  style={inputBoxStyle}
                >
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t("newPasswordPlaceholder")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </FormField>

              <FormField
                label={t("confirmPassword")}
                error={
                  confirm && confirm !== password ? t("passwordMismatch") : ""
                }
              >
                <div
                  className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
                  style={inputBoxStyle}
                >
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </FormField>

              <button
                type="submit"
                disabled={!password || !confirm || busy}
                className={buttonClass}
                style={buttonStyle(Boolean(password && confirm) && !busy)}
              >
                {busy ? t("loading") : t("savePassword")}
              </button>
            </form>
          ) : (
            <form
              className="flex flex-col"
              style={{ gap: "calc(var(--u) * 4.267)" }}
              onSubmit={handleLookup}
            >
              <FormAlert>{error}</FormAlert>

              <FormField label={t("username")}>
                <div
                  className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
                  style={inputBoxStyle}
                >
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={t("usernamePlaceholder")}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </FormField>

              <button
                type="submit"
                disabled={!username.trim() || busy}
                className={buttonClass}
                style={buttonStyle(Boolean(username.trim()) && !busy)}
              >
                {busy ? t("loading") : t("next")}
              </button>
            </form>
          )}

        </div>
      </div>

      <style>{`
        /* মূল সাইটের মতো গাঢ় সবুজ আভা — দুটো নরম radial glow */
        .forgot-page {
          background:
            radial-gradient(60% 45% at 3% 32%, rgba(12, 52, 44, 0.95), transparent 70%),
            radial-gradient(45% 40% at 28% 92%, rgba(12, 52, 44, 0.85), transparent 70%),
            var(--neutral1000);
        }

        .forgot-header {
          height: var(--header-height);
          padding-inline: calc(var(--u) * 4.267);
        }

        .forgot-body {
          padding-top: var(--header-height);
        }

        .forgot-panel {
          width: 100%;
          max-width: 500px;
          margin-inline: auto;
          padding: calc(var(--u) * 4.267);
        }

        @media (min-width: 1024px) {
          .forgot-header {
            height: var(--desktop-header-height);
            padding-inline: 16px;
          }

          .forgot-body {
            padding-top: var(--desktop-header-height);
          }

          .forgot-panel {
            padding-top: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
