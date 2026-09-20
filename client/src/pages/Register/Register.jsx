import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useDispatch } from "react-redux";
import { ChevronDown, Gift, Lock } from "lucide-react";

import AuthLayout from "../../components/AuthLayout/AuthLayout";
import FormField, { PasswordInput } from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { setCredentials } from "../../features/auth/authSlice";
import {
  authError,
  fetchRegisterBonus,
  registerUser,
  sendOtp,
} from "../../features/auth/authApi";

/**
 * তিন ধাপের রেজিস্টার পেজ।
 *
 * মূল সাইট থেকে মাপা: স্টেপার ২২.৯u উঁচু, বৃত্ত ১৩.৩৩u (অ্যাক্টিভ গোল্ড,
 * বাকিগুলো neutral700), সংযোগ রেখা ০.৫৩u, ধাপের নাম --fs-larger।
 * সারি ও বাটনের মাপ লগইন পেজের মতোই।
 *
 * OTP চালু থাকলে নম্বরের ধাপের পরেই কোড চাওয়া হয় — তাতে ভুল নম্বরে
 * পুরো ফর্ম পূরণ করে ফেলার পর আটকে যাওয়া লাগে না।
 *
 * রেফারেল লিংক (`?ref=CODE`) দিয়ে এলে কোডটা আগে থেকেই বসে থাকে।
 */
const STEPS = ["stepContact", "stepPersonal", "stepPassword"];

/**
 * নম্বরটা ঠিক আছে কিনা।
 *
 * মূল সাইটের মতো ১১ ডিজিট (০১৭...) ধরা হয়, কিন্তু কেউ শুরুর শূন্য ছাড়া
 * ১০ ডিজিট লিখলেও চলে — সার্ভার দুটোকেই একই রূপে বসায়।
 */
const isPhoneOk = (value) => {
  const digits = String(value).replace(/\D/g, "").replace(/^0+/, "");

  return digits.length === 10;
};

const Register = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const [params] = useSearchParams();

  // লিংক দিয়ে আসা কোড — বদলানো বা মোছা যাবে না
  const lockedReferral = Boolean((params.get("ref") || "").trim());

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    currency: "BDT",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: (params.get("ref") || "").toUpperCase(),
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [otpStep, setOtpStep] = useState(null);
  const [bonus, setBonus] = useState(null);

  useEffect(() => {
    let alive = true;

    fetchRegisterBonus().then((campaign) => alive && setBonus(campaign));

    return () => {
      alive = false;
    };
  }, []);

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
    isPhoneOk(form.phone),
    form.username.trim().length >= 4,
    form.password.trim().length >= 6 && form.password === form.confirmPassword,
  ];

  /** নম্বরের ধাপ শেষে — OTP লাগলে কোড চাওয়া, নইলে সোজা পরের ধাপে */
  const passContactStep = async () => {
    try {
      setBusy(true);
      setError("");

      const sent = await sendOtp({
        flow: "register",
        site: "client",
        countryCode: "+880",
        phone: form.phone.trim(),
      });

      if (sent.required) {
        setOtpStep({ maskedPhone: sent.maskedPhone });
        return;
      }

      setStep(1);
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    try {
      setBusy(true);
      setError("");

      const data = await registerUser({
        userId: form.username.trim(),
        password: form.password,
        countryCode: "+880",
        phone: form.phone.trim(),
        currency: form.currency,
        referralCode: form.referralCode.trim(),
      });

      dispatch(setCredentials({ user: data.user, token: data.token }));

      /*
       * বোনাস পেলে সেটাই মূল খবর — মূল সাইটের মতো মডালে জানানো হয়।
       *
       * সার্ভার ঘরটার নাম `amount`; আগে `creditedAmount` পড়া হতো বলে
       * টাকা ঠিকই জমত কিন্তু মডালে "undefined" লেখা উঠত।
       */
      const bonusAmount = Number(data.bonus?.amount || 0);

      await showAlert({
        type: "success",
        title: t("registerDone"),
        message: bonusAmount
          ? `${t("registerBonusNote")}: ${form.currency} ${bonusAmount.toFixed(2)}`
          : "",
      });

      navigate("/", { replace: true });
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const handleNext = () => {
    if (!stepValid[step] || busy) return;

    if (step === 0) {
      passContactStep();
      return;
    }

    if (step === STEPS.length - 1) {
      submit();
      return;
    }

    setStep((prev) => prev + 1);
  };

  if (otpStep) {
    return (
      <AuthLayout active="register">
        <OtpStep
          flow="register"
          countryCode="+880"
          phone={form.phone.trim()}
          maskedPhone={otpStep.maskedPhone}
          onVerified={() => {
            setOtpStep(null);
            setStep(1);
          }}
        />
      </AuthLayout>
    );
  }

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
          <React.Fragment key={item}>
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
        onSubmit={(event) => {
          event.preventDefault();
          handleNext();
        }}
      >
        <FormAlert>{error}</FormAlert>

        {step === 0 && bonus && (
          <div
            className="flex items-center"
            style={{
              gap: "calc(var(--u) * 2.133)",
              padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
              borderRadius: "var(--radius-10)",
              background:
                "color-mix(in srgb, var(--primary500), transparent 88%)",
              color: "var(--primary500)",
              fontSize: "var(--fs-larger)",
            }}
          >
            <Gift size={18} className="shrink-0" />
            <span>
              {t("registerBonusNote")}: {bonus.bonusAmount}
            </span>
          </div>
        )}

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
                form.phone && !isPhoneOk(form.phone)
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
            <FormField label={t("username")}>
              {textInput("username", t("usernamePlaceholder"))}
            </FormField>

            {/*
              * রেফারেল লিংক দিয়ে এলে কোডটা বসানো থাকে আর বদলানো যায় না।
              *
              * খোলা রাখলে কেউ মুছে ফেলতে পারতেন — তখন যে অ্যাফিলিয়েট
              * তাঁকে এনেছেন তিনি আর কোনো কমিশনই পেতেন না। হাতে টাইপ করে
              * এলে ঘরটা আগের মতোই খোলা থাকে, কারণ ওটা ঐচ্ছিক।
              */}
            <FormField
              label={
                lockedReferral
                  ? t("referralCode")
                  : `${t("referralCode")} (${t("optional")})`
              }
            >
              <div
                className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
                style={inputBoxStyle}
              >
                <input
                  type="text"
                  value={form.referralCode}
                  readOnly={lockedReferral}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      referralCode: event.target.value.toUpperCase(),
                    }))
                  }
                  placeholder={t("referralCodePlaceholder")}
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    ...(lockedReferral
                      ? { color: "var(--text-secondary)", cursor: "default" }
                      : {}),
                  }}
                />

                {lockedReferral ? (
                  <span
                    className="flex shrink-0 items-center text-[var(--primary500)]"
                    style={{ paddingInlineEnd: "calc(var(--u) * 4.267)" }}
                    title={t("referralLockedNote")}
                  >
                    <Lock size={14} />
                  </span>
                ) : null}
              </div>

              {lockedReferral ? (
                <p
                  className="text-[var(--text-disabled)]"
                  style={{
                    fontSize: "var(--fs-normal)",
                    marginTop: "calc(var(--u) * 1.067)",
                  }}
                >
                  {t("referralLockedNote")}
                </p>
              ) : null}
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <FormField label={t("password")}>
              <PasswordInput
                value={form.password}
                onChange={update("password")}
                placeholder={t("passwordPlaceholder")}
                autoComplete="new-password"
                showLabel={t("show")}
                hideLabel={t("hide")}
              />
            </FormField>

            <FormField
              label={t("confirmPassword")}
              error={
                form.confirmPassword && form.confirmPassword !== form.password
                  ? t("passwordMismatch")
                  : ""
              }
            >
              <PasswordInput
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                placeholder={t("confirmPasswordPlaceholder")}
                autoComplete="new-password"
                showLabel={t("show")}
                hideLabel={t("hide")}
              />
            </FormField>
          </>
        )}

        <button
          type="submit"
          disabled={!stepValid[step] || busy}
          className="flex w-full cursor-pointer items-center justify-center font-medium transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
            fontSize: "var(--fs-larger)",
            backgroundColor:
              stepValid[step] && !busy
                ? "var(--auth-btn-bg)"
                : "color-mix(in srgb, var(--auth-btn-bg), black 40%)",
            color: "var(--auth-btn-text)",
          }}
        >
          {busy
            ? t("loading")
            : step === STEPS.length - 1
              ? t("register")
              : t("continue")}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
