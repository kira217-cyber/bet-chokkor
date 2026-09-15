import React, { useState } from "react";
import { Circle, CircleCheck, CircleX, Eye, EyeOff } from "lucide-react";

import FormAlert from "../../components/FormAlert/FormAlert";
import FormField from "../../components/FormField/FormField";
import {
  EditModal,
  InfoRow,
  ModalButton,
  ProfileShell,
} from "./profileBits";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { authError } from "../../features/auth/authApi";
import { changePassword, passwordChecks } from "../../features/profile/profileApi";

/**
 * লগইন ও সিকিউরিটি।
 *
 * এখন একটাই সারি — পাসওয়ার্ড। মূল সাইটেও তাই। আলাদা পাতা রাখা হলো
 * কারণ মেনুতে এটা আলাদা আইটেম, আর পরে টু-স্টেপ বা লগইন ইতিহাস যোগ
 * হলে এখানেই বসবে।
 */
const ProfileSecurity = () => {
  const { t } = useLanguage();
  const { showAlert } = useAlert();

  const [open, setOpen] = useState(false);

  return (
    <ProfileShell title={t("menuSecurity")}>
      <InfoRow
        label={t("passwordLabel")}
        value={t("manage")}
        onClick={() => setOpen(true)}
      />

      {open ? (
        <PasswordModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            showAlert({
              type: "success",
              title: t("savedTitle"),
              message: t("passwordChangedNote"),
            });
          }}
        />
      ) : null}
    </ProfileShell>
  );
};

/** পাসওয়ার্ডের ঘর — চোখের বোতাম সহ */
const SecretInput = ({ value, onChange, placeholder, autoFocus }) => {
  const [show, setShow] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      className="flex w-full items-center overflow-hidden bg-[var(--form-box-bg)]"
      style={{
        height: "calc(var(--u) * 13.333)",
        borderRadius: "var(--radius-10)",
      }}
    >
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        className="h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
        style={{
          fontSize: "var(--fs-larger)",
          paddingInline: "calc(var(--u) * 4.267)",
        }}
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        aria-label={t(show ? "hide" : "show")}
        className="flex h-full shrink-0 cursor-pointer items-center px-4 text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
};

/**
 * পাসওয়ার্ড বদলানো।
 *
 * নিয়মগুলো টাইপ করার সাথে সাথেই টিক-ক্রস হয়ে দেখায় — মূল সাইটের
 * মতো। কিছু না লিখলে ক্রসও নয়, ফাঁকা বৃত্ত, নইলে ফর্ম খোলা মাত্রই
 * পাঁচটা লাল ক্রস ভেসে উঠত।
 */
const PasswordModal = ({ onClose, onSaved }) => {
  const { t } = useLanguage();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const checks = passwordChecks(next);
  const allOk = checks.every((item) => item.ok);
  const matches = next.length > 0 && next === again;

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    if (!matches) {
      setError(t("errPasswordMismatch"));
      return;
    }

    try {
      setBusy(true);
      setError("");

      await changePassword({ currentPassword: current, newPassword: next });
      onSaved();
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <EditModal title={t("changePassword")} onClose={onClose}>
      <form noValidate className="flex flex-col gap-4" onSubmit={submit}>
        <FormAlert>{error}</FormAlert>

        <FormField label={t("currentPassword")}>
          <SecretInput
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            placeholder={t("passwordPlaceholder")}
            autoFocus
          />
        </FormField>

        <FormField label={t("newPassword")}>
          <SecretInput
            value={next}
            onChange={(event) => setNext(event.target.value)}
            placeholder={t("passwordPlaceholder")}
          />
        </FormField>

        <ul className="flex flex-col gap-1.5">
          {checks.map((item) => {
            const Icon = !next ? Circle : item.ok ? CircleCheck : CircleX;

            const color = !next
              ? "var(--text-disabled)"
              : item.ok
                ? "var(--status-success)"
                : "var(--status-danger)";

            return (
              <li
                key={item.key}
                className="flex items-center gap-2 text-[12px]"
                style={{ color }}
              >
                <Icon size={14} className="shrink-0" />
                {t(`pwRule_${item.key}`)}
              </li>
            );
          })}
        </ul>

        <FormField
          label={t("confirmNewPassword")}
          error={again && !matches ? t("errPasswordMismatch") : ""}
        >
          <SecretInput
            value={again}
            onChange={(event) => setAgain(event.target.value)}
            placeholder={t("passwordPlaceholder")}
          />
        </FormField>

        <ModalButton type="submit" disabled={busy || !current || !allOk || !matches}>
          {busy ? t("loading") : t("changePassword")}
        </ModalButton>
      </form>
    </EditModal>
  );
};

export default ProfileSecurity;
