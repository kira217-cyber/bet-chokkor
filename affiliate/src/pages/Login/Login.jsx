import React, { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import AuthCard from "../../components/AuthCard/AuthCard";
import FormField from "../../components/FormField/FormField";
import { useLanguage } from "../../Context/LanguageProvider";

/**
 * অ্যাফিলিয়েট লগইন।
 * সাবমিট এখনো স্ট্যাটিক — server যুক্ত হলে authSlice এর thunk বসবে।
 */
const Login = () => {
  const { t } = useLanguage();

  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = form.username.trim() && form.password.trim();

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const boxClass =
    "flex w-full items-center overflow-hidden rounded-[12px] bg-[var(--form-box-bg)]";
  const inputClass =
    "h-[48px] w-full bg-transparent px-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link
            to="/register"
            className="font-semibold text-[var(--primary500)] underline underline-offset-4"
          >
            {t("signup")}
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <FormField label={t("username")}>
          <div className={boxClass}>
            <input
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={update("username")}
              placeholder={t("usernamePlaceholder")}
              className={inputClass}
            />
          </div>
        </FormField>

        <FormField label={t("password")}>
          <div className={boxClass}>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder={t("passwordPlaceholder")}
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={t("password")}
              className="flex h-[48px] w-11 shrink-0 cursor-pointer items-center justify-center text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
            >
              {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
            </button>
          </div>
        </FormField>

        <div className="flex justify-end">
          <Link
            to="/login"
            className="text-[14px] text-[var(--primary500)] underline underline-offset-4"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="aff-btn aff-btn--primary w-full disabled:cursor-not-allowed"
          style={
            canSubmit
              ? undefined
              : { background: "color-mix(in srgb, var(--primary500), black 40%)" }
          }
        >
          {t("login")}
        </button>
      </form>
    </AuthCard>
  );
};

export default Login;
