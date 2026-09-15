import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AtSign, Check, Copy, Phone, TriangleAlert } from "lucide-react";

import FormAlert from "../../components/FormAlert/FormAlert";
import FormField, { TextInput } from "../../components/FormField/FormField";
import {
  EditModal,
  InfoRow,
  LockNote,
  ModalButton,
  ProfileShell,
} from "./profileBits";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { authError } from "../../features/auth/authApi";
import {
  saveBirthday,
  saveEmail,
  saveFullName,
  savePhone,
  sendPhoneOtp,
} from "../../features/profile/profileApi";

/** ০১৭৮৯৭৯৪৬৫৬ → +৮৮০ 1789794656, মূল সাইটের মতো */
const showPhone = (user) =>
  user?.phone ? `${user.countryCode || "+880"} ${user.phone}` : "";

const showDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-CA", { timeZone: "UTC" })
    : "";

/**
 * ব্যক্তিগত তথ্য।
 *
 * পাঁচটা সারি: ইউজারনেম (শুধু কপি করা যায়), লিগ্যাল নাম, জন্ম তারিখ,
 * ফোন আর ইমেইল। প্রতিটার নিজের মডাল।
 *
 * নাম আর জন্ম তারিখ একবার বসলে সারিটা আর ক্লিক করা যায় না — সার্ভারও
 * দ্বিতীয়বার নেয় না, তাই বোতামটা রেখে দিলে চাপার পর "পারবেন না"
 * শুনতে হতো।
 */
const ProfileInfo = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const user = useSelector(selectUser);

  const [open, setOpen] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    // ব্যালেন্সের মতো এই ঘরগুলোও পুরোনো হয়ে থাকতে পারে
    api
      .get("/api/user/me")
      .then(({ data }) => {
        if (alive && data?.data?.user) dispatch(updateUser(data.data.user));
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [dispatch]);

  const done = (message) => {
    setOpen("");
    showAlert({ type: "success", title: t("savedTitle"), message });
  };

  const copyUserId = async () => {
    try {
      await navigator.clipboard.writeText(user?.userId || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে নামটা পর্দাতেই দেখা যাচ্ছে
    }
  };

  return (
    <ProfileShell title={t("menuPersonalInfo")}>
      <InfoRow
        label={t("rowUsername")}
        value={user?.userId}
        action={
          <button
            type="button"
            onClick={copyUserId}
            aria-label={t("copy")}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--text-disabled)] transition-colors hover:text-[var(--primary500)]"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        }
      />

      <InfoRow
        label={t("rowFullName")}
        value={user?.fullName || t("manage")}
        onClick={user?.fullName ? undefined : () => setOpen("fullName")}
      />

      <InfoRow
        label={t("rowBirthday")}
        value={showDate(user?.dateOfBirth) || t("manage")}
        onClick={user?.dateOfBirth ? undefined : () => setOpen("birthday")}
      />

      <InfoRow
        label={t("rowPhone")}
        value={showPhone(user) || t("manage")}
        warn={
          user?.phone && !user?.isPhoneVerified ? (
            <TriangleAlert
              size={15}
              className="shrink-0 text-[var(--status-pending)]"
              aria-label={t("notVerified")}
            />
          ) : null
        }
        onClick={() => setOpen("phone")}
      />

      <InfoRow
        label={t("rowEmail")}
        value={user?.email || t("manage")}
        onClick={() => setOpen("email")}
      />

      {open === "fullName" ? (
        <FullNameModal
          onClose={() => setOpen("")}
          onSaved={(next) => {
            dispatch(updateUser(next));
            done(t("fullNameSaved"));
          }}
        />
      ) : null}

      {open === "birthday" ? (
        <BirthdayModal
          onClose={() => setOpen("")}
          onSaved={(next) => {
            dispatch(updateUser(next));
            done(t("birthdaySaved"));
          }}
        />
      ) : null}

      {open === "phone" ? (
        <PhoneModal
          user={user}
          onClose={() => setOpen("")}
          onSaved={(next) => {
            dispatch(updateUser(next));
            done(t("phoneSaved"));
          }}
        />
      ) : null}

      {open === "email" ? (
        <EmailModal
          user={user}
          onClose={() => setOpen("")}
          onSaved={(next) => {
            dispatch(updateUser(next));
            done(t("emailSaved"));
          }}
        />
      ) : null}
    </ProfileShell>
  );
};

/* =========================
   সম্পূর্ণ লিগ্যাল নাম
   ========================= */

const FullNameModal = ({ onClose, onSaved }) => {
  const { t } = useLanguage();

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");

      onSaved(await saveFullName(value.trim()));
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditModal title={t("rowFullName")} onClose={onClose}>
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <FormAlert>{error}</FormAlert>

        <FormField label={t("rowFullName")}>
          <TextInput
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t("legalNamePlaceholder")}
            autoFocus
          />
        </FormField>

        <LockNote />

        <ModalButton type="submit" disabled={busy || value.trim().length < 3}>
          {busy ? t("loading") : t("submitDeposit")}
        </ModalButton>
      </form>
    </EditModal>
  );
};

/* =========================
   জন্ম তারিখ
   ========================= */

const BirthdayModal = ({ onClose, onSaved }) => {
  const { t } = useLanguage();

  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");

      onSaved(await saveBirthday(value));
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditModal title={t("rowBirthday")} onClose={onClose}>
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <FormAlert>{error}</FormAlert>

        <FormField label={t("rowBirthday")}>
          <TextInput
            type="date"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            autoFocus
          />
        </FormField>

        <LockNote />

        <ModalButton type="submit" disabled={busy || !value}>
          {busy ? t("loading") : t("submitDeposit")}
        </ModalButton>
      </form>
    </EditModal>
  );
};

/* =========================
   ফোন নম্বর
   ========================= */

/**
 * ফোন — দুই ধাপ।
 *
 * নতুন নম্বরে কোড যায়, তারপর কোড মিললে নম্বরটা বসে। অ্যাডমিন
 * `profileVerify` বন্ধ রাখলে সার্ভার `required: false` বলে, তখন
 * কোডের ধাপটা এড়িয়ে সোজা সেভ হয়।
 */
const PhoneModal = ({ user, onClose, onSaved }) => {
  const { t } = useLanguage();

  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const countryCode = user?.countryCode || "+880";

  const save = async (code) => {
    onSaved(await savePhone({ countryCode, phone, otp: code }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");

      if (step === "phone") {
        const result = await sendPhoneOtp({ countryCode, phone });

        if (result?.required) {
          setStep("otp");
          return;
        }

        await save("");
        return;
      }

      await save(otp);
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditModal title={t("rowPhone")} onClose={onClose}>
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[var(--status-success)]/10 text-[var(--status-success)]">
            <Phone size={28} />
          </span>

          <p className="text-[15px] font-bold text-[var(--neutral100)]">
            {t("phoneNumber")}
          </p>

          <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
            {t("phoneModalText")}
          </p>
        </div>

        <FormAlert>{error}</FormAlert>

        {step === "phone" ? (
          <FormField label={t("phoneNumber")}>
            <div className="flex gap-2">
              <span
                className="flex shrink-0 items-center bg-[var(--form-box-bg)] px-4 text-[var(--text-secondary)]"
                style={{
                  height: "calc(var(--u) * 13.333)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                {countryCode}
              </span>

              <TextInput
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, ""))
                }
                placeholder="1789794656"
                autoFocus
              />
            </div>
          </FormField>
        ) : (
          <FormField label={t("otpLabel")}>
            <TextInput
              inputMode="numeric"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
              placeholder="------"
              autoFocus
            />
          </FormField>
        )}

        <ModalButton type="submit" disabled={busy || phone.length < 6}>
          {busy ? t("loading") : t("continue")}
        </ModalButton>
      </form>
    </EditModal>
  );
};

/* =========================
   ইমেইল
   ========================= */

const EmailModal = ({ user, onClose, onSaved }) => {
  const { t } = useLanguage();

  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    try {
      setBusy(true);
      setError("");

      onSaved(await saveEmail(email.trim()));
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditModal title={t("rowEmail")} onClose={onClose}>
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex h-[64px] w-[64px] items-center justify-center rounded-[18px] bg-[var(--primary500)]/10 text-[var(--primary500)]">
            <AtSign size={28} />
          </span>

          <p className="text-[15px] font-bold text-[var(--neutral100)]">
            {t("emailAddress")}
          </p>

          <p className="text-[13px] leading-relaxed text-[var(--text-muted)]">
            {t("emailModalText")}
          </p>
        </div>

        <FormAlert>{error}</FormAlert>

        <FormField label={t("rowEmail")}>
          <TextInput
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("emailPlaceholder")}
            autoFocus
          />
        </FormField>

        <ModalButton type="submit" disabled={busy || !email.trim()}>
          {busy ? t("loading") : t("continue")}
        </ModalButton>
      </form>
    </EditModal>
  );
};

export default ProfileInfo;
