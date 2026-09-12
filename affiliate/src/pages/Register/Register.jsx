import React, { useState } from "react";
import { Link } from "react-router";
import { Check, ChevronDown } from "lucide-react";

import AuthCard from "../../components/AuthCard/AuthCard";
import FormField from "../../components/FormField/FormField";
import { useLanguage } from "../../Context/LanguageProvider";

/**
 * অ্যাফিলিয়েট রেজিস্ট্রেশন — এক পেজেই সব ঘর (ক্লায়েন্টের ৩-ধাপ ফর্মের
 * বদলে), কারণ অ্যাফিলিয়েটের তথ্য কম আর একবারে দেখতে পারলে সুবিধা।
 *
 * সাবমিট এখনো স্ট্যাটিক — server যুক্ত হলে রেজিস্টার API বসবে।
 */
const Register = () => {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    channel: "",
    password: "",
    confirmPassword: "",
  });
  const [agreed, setAgreed] = useState(false);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const phoneValid = form.phone.length === 11;
  const passwordMatch = form.password && form.password === form.confirmPassword;

  const canSubmit =
    form.fullName.trim() &&
    form.username.trim() &&
    phoneValid &&
    passwordMatch &&
    agreed;

  const boxClass =
    "flex w-full items-center overflow-hidden rounded-[12px] bg-[var(--form-box-bg)]";
  const inputClass =
    "h-[48px] w-full bg-transparent px-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

  const textInput = (key, placeholder, type = "text") => (
    <div className={boxClass}>
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      width="560px"
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link
            to="/login"
            className="font-semibold text-[var(--primary500)] underline underline-offset-4"
          >
            {t("login")}
          </Link>
        </>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t("fullName")}>
            {textInput("fullName", t("fullNamePlaceholder"))}
          </FormField>

          <FormField label={t("username")}>
            {textInput("username", t("usernamePlaceholder"))}
          </FormField>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t("email")}>
            {textInput("email", t("emailPlaceholder"), "email")}
          </FormField>

          <FormField
            label={t("phoneNumber")}
            error={form.phone && !phoneValid ? t("phoneLengthError") : ""}
          >
            <div className="flex w-full gap-3">
              <div
                className={`${boxClass} !w-auto shrink-0 gap-2 px-3`}
                style={{ background: "var(--neutral900)" }}
              >
                <img
                  src="/assets/icons/flag/BD.png"
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                  draggable="false"
                />
                <span className="text-[15px] text-[var(--text-primary)]">
                  +880
                </span>
                <ChevronDown size={14} className="text-[var(--text-disabled)]" />
              </div>

              <div className={`${boxClass} min-w-0 flex-1`}>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      phone: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="01XXXXXXXXX"
                  className={inputClass}
                />
              </div>
            </div>
          </FormField>
        </div>

        <FormField label={t("promoChannel")}>
          {textInput("channel", t("promoChannelPlaceholder"))}
        </FormField>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label={t("password")}>
            {textInput("password", t("passwordPlaceholder"), "password")}
          </FormField>

          <FormField
            label={t("confirmPassword")}
            error={
              form.confirmPassword && !passwordMatch ? t("passwordMismatch") : ""
            }
          >
            {textInput(
              "confirmPassword",
              t("confirmPasswordPlaceholder"),
              "password",
            )}
          </FormField>
        </div>

        <button
          type="button"
          onClick={() => setAgreed((prev) => !prev)}
          className="flex cursor-pointer items-start gap-3 text-start"
        >
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors"
            style={{
              borderColor: agreed ? "var(--primary500)" : "var(--neutral600)",
              background: agreed ? "var(--primary500)" : "transparent",
              color: "var(--neutral600)",
            }}
          >
            {agreed && <Check size={13} strokeWidth={3} />}
          </span>

          <span className="text-[14px] leading-relaxed text-[var(--text-muted)]">
            {t("agreeTerms")}
          </span>
        </button>

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
          {t("signup")}
        </button>
      </form>
    </AuthCard>
  );
};

export default Register;
