import React, { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Clock3, TriangleAlert, Upload, X } from "lucide-react";

import { Card, Loading } from "../../components/Panel/Panel";
import FormAlert from "../../components/FormAlert/FormAlert";
import FormField from "../../components/FormField/FormField";
import { useLanguage } from "../../Context/LanguageProvider";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useSelector } from "react-redux";
import { selectUser } from "../../features/auth/authSelectors";
import { authError, sendOtp } from "../../features/auth/authApi";
import {
  fetchVerification,
  submitVerification,
} from "../../features/verification/verificationApi";

const DOC_TYPES = ["nid", "passport", "driving"];

const DOC_LABEL = {
  nid: "docNid",
  passport: "docPassport",
  driving: "docDriving",
};

/**
 * অ্যাফিলিয়েটের পরিচয় যাচাই।
 *
 * খেলোয়াড়ের পাতার মতোই কাজ, কিন্তু আলাদা করে লেখা — অ্যাফিলিয়েট
 * অ্যাপের ইনপুট ও কার্ডের মাপ আলাদা (৪৮px fixed, ক্লায়েন্টের `--u`
 * ভিত্তিক নয়), শেয়ার করা কম্পোনেন্ট বসালে চেহারা মিলত না।
 *
 * এখানে ডিপোজিটের কথা নেই — অ্যাফিলিয়েট ডিপোজিট করেন না, তাঁদের
 * যাচাই শুধু টাকা তোলার আগে লাগে, আর সেই সুইচটাও অ্যাডমিনের হাতে।
 */
const Verification = () => {
  const { t, tv } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const user = useSelector(selectUser);

  // OTP লাগলে কোডের ধাপ — সার্ভার না চাওয়া পর্যন্ত খোলা হয় না
  const [otpOpen, setOtpOpen] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    dateOfBirth: "",
    documentType: "nid",
    documentNumber: "",
  });

  const [files, setFiles] = useState({
    frontImage: null,
    backImage: null,
    selfieImage: null,
  });

  useEffect(() => {
    let alive = true;

    fetchVerification()
      .then((next) => alive && setData(next))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [reload]);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  /**
   * কাগজপত্র পাঠানো।
   *
   * সার্ভার OTP চাইলে তখনই কোড পাঠানো হয়, আগেভাগে নয় — যাঁদের জন্য
   * OTP বন্ধ তাঁদেরও অকারণে SMS যেত। কোড মিলে গেলে এই ফাংশনটাই
   * আবার ডাকা হয়, এবার সার্ভার নিয়ে নেয়।
   */
  const send = async () => {
    try {
      setBusy(true);
      setError("");

      await submitVerification({ ...form, ...files });

      setOtpOpen(false);
      setReload((prev) => prev + 1);
    } catch (err) {
      if (err?.response?.data?.code === "otpNotVerified") {
        try {
          const sent = await sendOtp({
            flow: "profileVerify",
            userId: user?.userId,
          });

          setMaskedPhone(sent.maskedPhone || "");
          setOtpOpen(true);
          return;
        } catch (otpErr) {
          setError(authError(otpErr, t("somethingWrong"), t));
          return;
        }
      }

      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();

    if (busy) return;

    send();
  };

  if (loading) return <Loading label={t("loading")} />;

  if (otpOpen) {
    return (
      <Card title={t("otpTitle")}>
        <OtpStep
          flow="profileVerify"
          userId={user?.userId}
          maskedPhone={maskedPhone}
          onVerified={send}
        />
      </Card>
    );
  }

  const row = data?.verification;
  const status = row?.status;

  /* ── হয়ে গেছে বা চলছে ── */
  if (status === "approved" || status === "pending") {
    const done = status === "approved";

    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <span
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{
              background: `color-mix(in srgb, ${
                done ? "var(--status-success)" : "var(--status-pending)"
              }, transparent 88%)`,
              color: done ? "var(--status-success)" : "var(--status-pending)",
            }}
          >
            {done ? <BadgeCheck size={36} /> : <Clock3 size={36} />}
          </span>

          <p className="text-[17px] font-bold text-[var(--text-primary)]">
            {t(done ? "verifyApprovedTitle" : "verifyPendingTitle")}
          </p>

          <p className="max-w-[420px] text-[14px] leading-relaxed text-[var(--text-muted)]">
            {t(done ? "verifyApprovedText" : "verifyPendingText")}
          </p>
        </div>
      </Card>
    );
  }

  const boxClass =
    "flex w-full items-center overflow-hidden rounded-[12px] bg-[var(--form-box-bg)]";
  const inputClass =
    "h-[48px] w-full bg-transparent px-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]";

  return (
    <div className="flex flex-col gap-4">
      {tv(data?.setting?.note) ? (
        <Card>
          <p className="text-[13px] text-[var(--text-muted)]">
            {tv(data.setting.note)}
          </p>
        </Card>
      ) : null}

      {status === "rejected" ? (
        <Card>
          <p className="flex items-start gap-2 text-[14px] text-[var(--status-danger)]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            {row?.reviewNote || t("verifyRejected")}
          </p>
        </Card>
      ) : null}

      <Card title={t("verification")} subtitle={t("verifyIntro")}>
        <form noValidate className="flex flex-col gap-5" onSubmit={submit}>
          <FormAlert>{error}</FormAlert>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label={t("verifyFullName")}>
              <div className={boxClass}>
                <input
                  value={form.fullName}
                  onChange={update("fullName")}
                  placeholder={t("verifyFullNameHint")}
                  className={inputClass}
                />
              </div>
            </FormField>

            <FormField label={t("verifyBirthDate")}>
              <div className={boxClass}>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={update("dateOfBirth")}
                  max={new Date().toISOString().slice(0, 10)}
                  className={inputClass}
                />
              </div>
            </FormField>
          </div>

          <FormField label={t("verifyDocType")}>
            <div className="flex flex-wrap gap-2">
              {DOC_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, documentType: type }))
                  }
                  className="flex h-11 cursor-pointer items-center rounded-[10px] px-4 text-[13px] transition"
                  style={{
                    background:
                      form.documentType === type
                        ? "var(--primary500)"
                        : "var(--neutral800)",
                    color:
                      form.documentType === type
                        ? "var(--neutral1000)"
                        : "var(--text-secondary)",
                    fontWeight: form.documentType === type ? 700 : 400,
                  }}
                >
                  {t(DOC_LABEL[type])}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label={t("verifyDocNumber")}>
            <div className={boxClass}>
              <input
                value={form.documentNumber}
                onChange={update("documentNumber")}
                placeholder={t("verifyDocNumberHint")}
                className={inputClass}
              />
            </div>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["frontImage", "verifyFront", true],
              ["backImage", "verifyBack", false],
              ["selfieImage", "verifySelfie", true],
            ].map(([key, labelKey, required]) => (
              <FilePick
                key={key}
                label={`${t(labelKey)}${required ? "" : ` (${t("optional")})`}`}
                file={files[key]}
                onPick={(file) =>
                  setFiles((prev) => ({ ...prev, [key]: file }))
                }
                clearLabel={t("close")}
                pickLabel={t("verifyUploadHint")}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={busy || !form.fullName.trim() || !files.frontImage || !files.selfieImage}
            className="aff-btn aff-btn--primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t("loading") : t("submitDeposit")}
          </button>
        </form>
      </Card>
    </div>
  );
};

/**
 * ছবি বাছার ঘর।
 *
 * বাছার পরে ছোট করে প্রিভিউ দেখানো হয় — নইলে ভুল ছবি দিয়ে ফেলেছেন
 * কিনা জমা দেওয়ার আগে বোঝার উপায় থাকত না।
 */
const FilePick = ({ label, file, onPick, clearLabel, pickLabel }) => {
  const inputRef = useRef(null);

  /*
   * প্রিভিউর URL — ফাইল ধরে বানানো, state এ নয়।
   *
   * effect এর ভিতরে setState করলে বাড়তি একটা রেন্ডার হতো (আর lint ও
   * আটকাত); এখানে ফাইল বদলালেই নতুন URL, আর আগেরটা ছেড়ে দেওয়া হয়
   * — নইলে বেছে বেছে ছবি বদলালে মেমরিতে জমতে থাকত।
   */
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <FormField label={label}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => onPick(event.target.files?.[0] || null)}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-[12px] border border-white/[0.07]">
          <img
            src={preview}
            alt=""
            className="h-[120px] w-full object-cover"
            draggable="false"
          />

          <button
            type="button"
            onClick={() => onPick(null)}
            aria-label={clearLabel}
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[var(--neutral600)] text-[13px] text-[var(--text-muted)] transition hover:border-[var(--primary500)] hover:text-[var(--text-secondary)]"
        >
          <Upload size={20} />
          {pickLabel}
        </button>
      )}
    </FormField>
  );
};

export default Verification;
