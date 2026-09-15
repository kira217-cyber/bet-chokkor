import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  BadgeCheck,
  Clock3,
  ImageUp,
  Loader2,
  TriangleAlert,
  X,
} from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import OtpStep from "../../components/OtpStep/OtpStep";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { authError, sendOtp } from "../../features/auth/authApi";
import {
  fetchVerification,
  submitVerification,
} from "../../features/verification/verificationApi";
import { imageUrl } from "../../features/deposit/imageUrl";

const DOCUMENTS = [
  { key: "nid", label: "docNid" },
  { key: "passport", label: "docPassport" },
  { key: "driving", label: "docDriving" },
];

const box = {
  borderRadius: "var(--radius-10)",
  padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
};

/**
 * একটা ছবির ঘর।
 *
 * বেছে নেওয়ার সাথে সাথেই ছোট করে দেখানো হয় — না দেখালে কোন পাশের
 * ছবিটা কোথায় বসল সেটা নিয়ে ভুল হতো। আগে পাঠানো ছবি থাকলে সেটাই
 * দেখায়, নতুন না দিলে ওটাই থাকে।
 */
const ImageBox = ({ label, hint, preview, existing, onPick, onClear }) => {
  const inputRef = useRef(null);

  const shown = preview || (existing ? imageUrl(existing) : "");

  return (
    <div className="bg-[var(--neutral900)]" style={box}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className="font-semibold text-[var(--neutral100)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {label}
          </p>
          <p
            className="text-[var(--text-muted)]"
            style={{ fontSize: "var(--fs-small)" }}
          >
            {hint}
          </p>
        </div>

        {shown ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              if (inputRef.current) inputRef.current.value = "";
            }}
            aria-label="remove"
            className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--status-danger)]"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(event) => onPick(event.target.files?.[0] || null)}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-3 flex w-full cursor-pointer items-center justify-center overflow-hidden bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
        style={{
          borderRadius: "var(--radius-10)",
          minHeight: "calc(var(--u) * 32)",
        }}
      >
        {shown ? (
          <img
            src={shown}
            alt={label}
            className="h-full w-full object-contain"
            style={{ maxHeight: "calc(var(--u) * 48)" }}
          />
        ) : (
          <span
            className="flex flex-col items-center text-[var(--text-muted)]"
            style={{ gap: "calc(var(--u) * 1.6)", fontSize: "var(--fs-normal)" }}
          >
            <ImageUp size={22} />
            {hint}
          </span>
        )}
      </button>
    </div>
  );
};

/**
 * পরিচয় যাচাই।
 *
 * মূল সাইটে প্রোফাইল মেনুতে "প্রতিপাদন" — ডিপোজিট ও উইথড্র এর পেছনে
 * এটাই আটকানো থাকে। এখানে আটকানোটা অ্যাডমিন চালু-বন্ধ করতে পারেন,
 * তাই পাতাটা নিজে থেকেই বলে দেয় এখন এটা লাগবে কিনা।
 *
 * অবস্থা তিনটে: ঝুলে আছে, অনুমোদিত, বাতিল। বাতিল হলে কারণটা দেখানো
 * হয় আর ফর্মটা আবার খোলা থাকে — নইলে কী ঠিক করতে হবে বোঝা যেত না।
 */
const Verification = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

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

  /**
   * বেছে নেওয়া ছবির অস্থায়ী ঠিকানা।
   *
   * ইভেন্ট হ্যান্ডলারেই বানানো ও আগেরটা ছেড়ে দেওয়া হয় — effect এ করলে
   * প্রতিবার একটা বাড়তি রেন্ডার হতো।
   */
  const [previews, setPreviews] = useState({});

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;

    fetchVerification()
      .then((next) => {
        if (!alive) return;

        setData(next);

        // আগের আবেদন থাকলে ফর্মটা সেটা দিয়েই ভরা থাকে, নইলে বাতিল
        // হওয়ার পরে সব আবার টাইপ করতে হতো
        if (next.verification) {
          setForm({
            fullName: next.verification.fullName || "",
            dateOfBirth: next.verification.dateOfBirth
              ? String(next.verification.dateOfBirth).slice(0, 10)
              : "",
            documentType: next.verification.documentType || "nid",
            documentNumber: next.verification.documentNumber || "",
          });
        }
      })
      .catch(() => alive && setError(t("somethingWrong")))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const load = () => setReload((prev) => prev + 1);

  const set = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const pick = (key) => (file) => {
    setFiles((prev) => ({ ...prev, [key]: file }));

    setPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);

      const next = { ...prev };

      if (file) next[key] = URL.createObjectURL(file);
      else delete next[key];

      return next;
    });
  };

  const send = async () => {
    try {
      setBusy(true);
      setError("");

      await submitVerification({ ...form, ...files });

      setDone(true);
      setOtpOpen(false);
      load();
    } catch (err) {
      // সার্ভার OTP চায় বললে তখনই কোড পাঠানো — আগেভাগে পাঠালে যাঁদের
      // জন্য OTP বন্ধ তাঁদেরও অকারণে SMS যেত
      if (err?.response?.data?.code === "otpNotVerified") {
        try {
          const sent = await sendOtp({
            flow: "profileVerify",
            site: "client",
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

    if (!form.fullName.trim() || !form.documentNumber.trim()) {
      setError(t("errMissingFields"));
      return;
    }

    const row = data?.verification;

    if (!row && (!files.frontImage || !files.selfieImage)) {
      setError(t("verifyNeedImages"));
      return;
    }

    send();
  };

  if (loading) {
    return (
      <MemberPage title={t("verification")}>
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
      </MemberPage>
    );
  }

  if (otpOpen) {
    return (
      <MemberPage title={t("verification")} onBack={() => setOtpOpen(false)}>
        <OtpStep
          flow="profileVerify"
          userId={user?.userId}
          maskedPhone={maskedPhone}
          onVerified={send}
        />
      </MemberPage>
    );
  }

  const row = data?.verification;
  const setting = data?.setting || {};

  const approved = row?.status === "approved";
  const pending = row?.status === "pending";

  if (done || approved || pending) {
    const tone = approved ? "var(--status-success)" : "var(--status-pending)";

    return (
      <MemberPage title={t("verification")} onBack={() => navigate("/member/profile")}>
        <div
          className="flex flex-col items-center bg-[var(--neutral800)] text-center"
          style={{
            borderRadius: "var(--radius-10)",
            gap: "calc(var(--u) * 3.2)",
            padding: "calc(var(--u) * 8.533) calc(var(--u) * 4.267)",
          }}
        >
          <span style={{ color: tone }}>
            {approved ? <BadgeCheck size={38} /> : <Clock3 size={38} />}
          </span>

          <p
            className="font-bold text-[var(--neutral100)]"
            style={{ fontSize: "var(--fs-h4)" }}
          >
            {approved ? t("verifyApprovedTitle") : t("verifyPendingTitle")}
          </p>

          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {approved ? t("verifyApprovedText") : t("verifyPendingText")}
          </p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="cursor-pointer font-bold text-[var(--btn-primary-txt)]"
            style={{
              backgroundColor: "var(--primary500)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
              padding: "calc(var(--u) * 2.667) calc(var(--u) * 6.4)",
            }}
          >
            {t("backToHome")}
          </button>
        </div>
      </MemberPage>
    );
  }

  return (
    <MemberPage title={t("verification")} onBack={() => navigate("/member/profile")}>
      <form
        onSubmit={submit}
        className="flex flex-col"
        style={{ gap: "calc(var(--u) * 3.2)" }}
      >
        <FormAlert>{error}</FormAlert>

        {/* কেন লাগছে — অ্যাডমিনের লেখা বার্তা, নইলে ডিফল্ট */}
        <div
          className="bg-[var(--neutral900)] text-[var(--text-secondary)]"
          style={{ ...box, fontSize: "var(--fs-normal)" }}
        >
          {tv(setting.note) || t("verifyIntro")}

          {setting.requireForDeposit || setting.requireForWithdraw ? (
            <p
              className="text-[var(--status-pending)]"
              style={{ marginTop: "calc(var(--u) * 1.6)" }}
            >
              {setting.requireForDeposit && setting.requireForWithdraw
                ? t("verifyGateBoth")
                : setting.requireForDeposit
                  ? t("verifyGateDeposit")
                  : t("verifyGateWithdraw")}
            </p>
          ) : null}
        </div>

        {row?.status === "rejected" ? (
          <div
            className="flex items-start"
            style={{
              ...box,
              backgroundColor:
                "color-mix(in srgb, var(--status-danger), transparent 88%)",
              color: "var(--status-danger)",
              fontSize: "var(--fs-normal)",
              gap: "calc(var(--u) * 2.133)",
            }}
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <span>
              {t("verifyRejected")}
              {row.reviewNote ? ` — ${row.reviewNote}` : ""}
            </span>
          </div>
        ) : null}

        <div className="bg-[var(--neutral900)]" style={box}>
          <FormField label={t("verifyFullName")}>
            <input
              value={form.fullName}
              onChange={set("fullName")}
              placeholder={t("verifyFullNameHint")}
              className="w-full bg-[var(--form-box-bg)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              style={{
                borderRadius: "var(--radius-10)",
                fontSize: "var(--fs-larger)",
                height: "calc(var(--u) * 13.333)",
                paddingInline: "calc(var(--u) * 4.267)",
              }}
            />
          </FormField>

          <FormField label={t("verifyBirthDate")}>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={set("dateOfBirth")}
              className="w-full bg-[var(--form-box-bg)] text-[var(--text-primary)] outline-none"
              style={{
                borderRadius: "var(--radius-10)",
                fontSize: "var(--fs-larger)",
                height: "calc(var(--u) * 13.333)",
                paddingInline: "calc(var(--u) * 4.267)",
              }}
            />
          </FormField>

          <FormField label={t("verifyDocType")}>
            <div
              className="flex flex-wrap"
              style={{ gap: "calc(var(--u) * 2.133)" }}
            >
              {DOCUMENTS.map((item) => {
                const active = form.documentType === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, documentType: item.key }))
                    }
                    className="cursor-pointer font-semibold transition-colors"
                    style={{
                      backgroundColor: active
                        ? "var(--primary500)"
                        : "var(--neutral800)",
                      borderRadius: "var(--radius-70)",
                      color: active
                        ? "var(--neutral1000)"
                        : "var(--text-secondary)",
                      fontSize: "var(--fs-normal)",
                      padding: "calc(var(--u) * 2.133) calc(var(--u) * 4.267)",
                    }}
                  >
                    {t(item.label)}
                  </button>
                );
              })}
            </div>
          </FormField>

          <FormField label={t("verifyDocNumber")}>
            <input
              value={form.documentNumber}
              onChange={set("documentNumber")}
              placeholder={t("verifyDocNumberHint")}
              className="w-full bg-[var(--form-box-bg)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              style={{
                borderRadius: "var(--radius-10)",
                fontSize: "var(--fs-larger)",
                height: "calc(var(--u) * 13.333)",
                paddingInline: "calc(var(--u) * 4.267)",
              }}
            />
          </FormField>
        </div>

        <ImageBox
          label={t("verifyFront")}
          hint={t("verifyFrontHint")}
          preview={previews.frontImage}
          existing={row?.frontImage}
          onPick={pick("frontImage")}
          onClear={() => pick("frontImage")(null)}
        />

        <ImageBox
          label={t("verifyBack")}
          hint={t("verifyBackHint")}
          preview={previews.backImage}
          existing={row?.backImage}
          onPick={pick("backImage")}
          onClear={() => pick("backImage")(null)}
        />

        <ImageBox
          label={t("verifySelfie")}
          hint={t("verifySelfieHint")}
          preview={previews.selfieImage}
          existing={row?.selfieImage}
          onPick={pick("selfieImage")}
          onClear={() => pick("selfieImage")(null)}
        />

        <button
          type="submit"
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center font-bold text-[var(--btn-primary-txt)] transition-[filter] hover:brightness-105 disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary500)",
            borderRadius: "var(--radius-10)",
            fontSize: "var(--fs-larger)",
            gap: "calc(var(--u) * 2.133)",
            height: "calc(var(--u) * 13.333)",
          }}
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : null}
          {t("verifySubmit")}
        </button>
      </form>
    </MemberPage>
  );
};

export default Verification;
