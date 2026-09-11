import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField from "../../components/FormField/FormField";
import { useLanguage } from "../../Context/LanguageProvider";

/**
 * তিন ধাপের রেজিস্টার পেজ।
 *
 * মূল সাইট থেকে মাপা: স্টেপার ২২.৯u উঁচু, বৃত্ত ১৩.৩৩u (অ্যাক্টিভ গোল্ড,
 * বাকিগুলো neutral700), সংযোগ রেখা ০.৫৩u, ধাপের নাম --fs-larger।
 * সারি ও বাটনের মাপ লগইন পেজের মতোই।
 *
 * ফর্ম এখনো স্ট্যাটিক — server যুক্ত হলে রেজিস্টার API বসবে।
 */
const STEPS = ["stepContact", "stepPersonal", "stepPassword"];

const Register = () => {
  const { t } = useLanguage();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    currency: "BDT",
    phone: "",
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

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

  const textInput = (key, placeholder, type = "text") => (
    <div
      className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
      style={inputBoxStyle}
    >
      <input
        type={type}
        value={form[key]}
        onChange={update(key)}
        placeholder={placeholder}
        className={inputClass}
        style={inputStyle}
      />
    </div>
  );

  // ধাপ অনুযায়ী কোন কোন ঘর পূরণ হলে পরের ধাপে যাওয়া যাবে
  const stepValid = [
    form.phone.trim().length === 11,
    form.fullName.trim() && form.username.trim(),
    form.password.trim() && form.password === form.confirmPassword,
  ];

  return (
    <AuthLayout active="register">
      <h1
        className="font-bold text-[var(--neutral100)]"
        style={{
          fontSize: "var(--fs-h4)",
          marginBottom: "calc(var(--u) * 4.267)",
        }}
      >
        {t(STEPS[step])}
      </h1>

      {/* ── স্টেপার ── */}
      <div
        className="mx-auto flex items-start"
        style={{
          width: "min(calc(var(--u) * 96), 100%)",
          marginBottom: "calc(var(--u) * 4.267)",
        }}
      >
        {STEPS.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 && (
              <span
                className="shrink-0 bg-[var(--neutral700)]"
                style={{
                  flex: 1,
                  height: "calc(var(--u) * 0.53)",
                  marginTop: "calc(var(--u) * 6.67)",
                }}
              />
            )}

            <div
              className="flex shrink-0 flex-col items-center"
              style={{ width: "calc(var(--u) * 13.333)" }}
            >
              <span
                className="flex items-center justify-center rounded-full font-medium"
                style={{
                  height: "calc(var(--u) * 13.333)",
                  width: "calc(var(--u) * 13.333)",
                  fontSize: "var(--fs-body)",
                  backgroundColor:
                    index <= step
                      ? "var(--primary500)"
                      : "var(--neutral700)",
                  color:
                    index <= step
                      ? "var(--neutral600)"
                      : "var(--text-secondary)",
                }}
              >
                {index + 1}
              </span>

              <span
                className="text-center leading-tight text-[var(--text-secondary)]"
                style={{
                  fontSize: "var(--fs-larger)",
                  marginTop: "calc(var(--u) * 2.133)",
                }}
              >
                {t(item)}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>

      <form
        className="flex flex-col"
        style={{ gap: "calc(var(--u) * 4.267)" }}
        onSubmit={(event) => event.preventDefault()}
      >
        {step === 0 && (
          <>
            <FormField label={t("selectCurrency")}>
              {/* মূল সাইটে এই সিলেক্ট ডিজেবল — একটাই মুদ্রা (BDT) */}
              <div
                className="flex w-full items-center justify-between bg-[var(--neutral900)]"
                style={{
                  ...inputBoxStyle,
                  padding: "0 calc(var(--u) * 4.267)",
                }}
              >
                <span
                  className="flex items-center text-[var(--text-primary)]"
                  style={{
                    gap: "calc(var(--u) * 2.133)",
                    fontSize: "var(--fs-larger)",
                  }}
                >
                  <img
                    src="/assets/icons/flag/BD.png"
                    alt=""
                    className="rounded-full object-cover"
                    style={{
                      height: "calc(var(--u) * 5.333)",
                      width: "calc(var(--u) * 5.333)",
                    }}
                    draggable="false"
                  />
                  {form.currency}
                </span>

                <ChevronDown size={16} className="text-[var(--text-disabled)]" />
              </div>
            </FormField>

            <FormField
              label={t("phoneNumber")}
              error={
                form.phone && form.phone.length !== 11
                  ? t("phoneLengthError")
                  : ""
              }
            >
              <div
                className="flex w-full"
                style={{ gap: "calc(var(--u) * 6.4)" }}
              >
                <div
                  className="flex shrink-0 items-center justify-between bg-[var(--neutral900)]"
                  style={{
                    ...inputBoxStyle,
                    width: "calc(var(--u) * 43.7)",
                    padding: "0 calc(var(--u) * 4.267)",
                  }}
                >
                  <span
                    className="flex items-center text-[var(--text-primary)]"
                    style={{
                      gap: "calc(var(--u) * 2.133)",
                      fontSize: "var(--fs-larger)",
                    }}
                  >
                    <img
                      src="/assets/icons/flag/BD.png"
                      alt=""
                      className="rounded-full object-cover"
                      style={{
                        height: "calc(var(--u) * 5.333)",
                        width: "calc(var(--u) * 5.333)",
                      }}
                      draggable="false"
                    />
                    +880
                  </span>

                  <ChevronDown
                    size={16}
                    className="text-[var(--text-disabled)]"
                  />
                </div>

                <div
                  className="flex min-w-0 flex-1 items-center overflow-hidden bg-[var(--form-box-bg)]"
                  style={inputBoxStyle}
                >
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
                    placeholder="- - -  - - -  - - -"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
            </FormField>
          </>
        )}

        {step === 1 && (
          <>
            <FormField label={t("fullName")}>
              {textInput("fullName", t("fullNamePlaceholder"))}
            </FormField>

            <FormField label={t("email")}>
              {textInput("email", t("emailPlaceholder"), "email")}
            </FormField>

            <FormField label={t("username")}>
              {textInput("username", t("usernamePlaceholder"))}
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <FormField label={t("password")}>
              {textInput("password", t("passwordPlaceholder"), "password")}
            </FormField>

            <FormField
              label={t("confirmPassword")}
              error={
                form.confirmPassword && form.confirmPassword !== form.password
                  ? t("passwordMismatch")
                  : ""
              }
            >
              {textInput("confirmPassword", t("confirmPasswordPlaceholder"), "password")}
            </FormField>
          </>
        )}

        <button
          type="button"
          disabled={!stepValid[step]}
          onClick={() => setStep((prev) => Math.min(prev + 1, STEPS.length - 1))}
          className="flex w-full cursor-pointer items-center justify-center font-medium transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
            fontSize: "var(--fs-larger)",
            backgroundColor: stepValid[step]
              ? "var(--primary500)"
              : "color-mix(in srgb, var(--primary500), black 40%)",
            color: "var(--btn-primary-txt)",
          }}
        >
          {step === STEPS.length - 1 ? t("register") : t("continue")}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
