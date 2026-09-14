import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Eye, EyeOff, X } from "lucide-react";

import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useLanguage } from "../../Context/LanguageProvider";
import { setCredentials } from "../../features/auth/authSlice";
import { authError, loginUser, sendOtp } from "../../features/auth/authApi";

/**
 * লগইন পেজ।
 *
 * মূল সাইট থেকে মাপা: ফর্মের সারিগুলোর মাঝে ৪.২৬৭u গ্যাপ, ইনপুট ১৩.৩৩u
 * উঁচু (bg neutral800, radius --radius-10), লিংক সারি ৮.৫৩u,
 * বাটন ১৩.৩৩u উঁচু / --fs-larger / ৭০০।
 *
 * অ্যাডমিন লগইনে OTP চালু রাখলে পাসওয়ার্ডের পর একটা কোডের ধাপ আসে;
 * বন্ধ থাকলে সরাসরি ঢুকে যায়। ভুল হলে মূল সাইটের মতো ফর্মের উপরেই
 * ইনলাইন ব্যানারে দেখায়, মডালে নয়।
 */
const Login = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpStep, setOtpStep] = useState(null);

  const canSubmit = form.username.trim() && form.password.trim() && !busy;

  /** পাসওয়ার্ড ঠিক থাকলে টোকেন বসিয়ে হোমে */
  const finish = (data) => {
    dispatch(setCredentials({ user: data.user, token: data.token }));
    navigate("/", { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      setBusy(true);
      setError("");

      const data = await loginUser({
        userId: form.username.trim(),
        password: form.password,
      });

      // OTP লাগলে সার্ভার টোকেন দেয় না, কোড চাওয়ার কথা বলে
      if (data.otpRequired) {
        const sent = await sendOtp({
          flow: "login",
          site: "client",
          userId: form.username.trim(),
        });

        setOtpStep({ maskedPhone: sent.maskedPhone });
        return;
      }

      finish(data);
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  /** কোড ঠিক হলে একই পাসওয়ার্ড দিয়ে আবার — এবার টোকেন আসে */
  const handleVerified = async () => {
    try {
      setBusy(true);

      finish(
        await loginUser({
          userId: form.username.trim(),
          password: form.password,
        }),
      );
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
      setOtpStep(null);
    } finally {
      setBusy(false);
    }
  };

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const clear = (key) => () => setForm((prev) => ({ ...prev, [key]: "" }));

  const inputBox = "flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]";
  const inputBoxStyle = {
    height: "calc(var(--u) * 13.333)",
    borderRadius: "var(--radius-10)",
    paddingInlineEnd: "calc(var(--u) * 2.667)",
  };
  const inputStyle = {
    fontSize: "var(--fs-larger)",
    paddingInline: "calc(var(--u) * 4.267)",
  };
  const inputClass =
    "h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

  const iconButton = (label, onClick, children) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex shrink-0 cursor-pointer items-center justify-center text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
      style={{
        height: "calc(var(--u) * 6.4)",
        width: "calc(var(--u) * 6.4)",
      }}
    >
      {children}
    </button>
  );

  if (otpStep) {
    return (
      <AuthLayout active="login">
        <OtpStep
          flow="login"
          userId={form.username.trim()}
          maskedPhone={otpStep.maskedPhone}
          onVerified={handleVerified}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout active="login">
      <form
        className="flex flex-col"
        style={{ gap: "calc(var(--u) * 4.267)" }}
        onSubmit={handleSubmit}
      >
        <FormAlert>{error}</FormAlert>

        <FormField label={t("username")}>
          <div className={inputBox} style={inputBoxStyle}>
            <input
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={update("username")}
              placeholder={t("usernamePlaceholder")}
              className={inputClass}
              style={inputStyle}
            />

            {form.username &&
              iconButton("clear username", clear("username"), <X size={16} />)}
          </div>
        </FormField>

        <FormField label={t("password")}>
          <div className={inputBox} style={inputBoxStyle}>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder={t("passwordPlaceholder")}
              className={inputClass}
              style={inputStyle}
            />

            {form.password &&
              iconButton("clear password", clear("password"), <X size={16} />)}

            {iconButton(
              showPassword ? "hide password" : "show password",
              () => setShowPassword((prev) => !prev),
              showPassword ? <Eye size={16} /> : <EyeOff size={16} />,
            )}
          </div>
        </FormField>

        <div
          className="flex items-center justify-end"
          style={{ height: "calc(var(--u) * 8.53)" }}
        >
          <Link
            to="/forgot-password"
            className="text-[var(--primary500)] underline underline-offset-4"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("forgotPassword")}
          </Link>
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
          {busy ? t("loading") : t("login")}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
