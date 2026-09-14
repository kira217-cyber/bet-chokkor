import React, { useEffect } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

const LOOK = {
  success: { Icon: CircleCheck, color: "var(--status-success)" },
  error: { Icon: CircleAlert, color: "var(--status-danger)" },
  warning: { Icon: TriangleAlert, color: "var(--status-pending)" },
  info: { Icon: Info, color: "var(--status-info)" },
  confirm: { Icon: TriangleAlert, color: "var(--primary500)" },
};

/**
 * সাইটের একমাত্র বার্তা-মডাল।
 *
 * `onConfirm` থাকলে দুটো বোতাম (হ্যাঁ/না), নইলে একটাই "ঠিক আছে"।
 * টোস্ট ব্যবহার করা হয় না — মূল সাইটে সব বার্তাই মডালে আসে, আর
 * মডাল না সরানো পর্যন্ত ব্যবহারকারী বার্তাটা মিস করেন না।
 */
const AlertModal = ({ alert, onClose, onConfirm }) => {
  const { t, tv } = useLanguage();

  const open = Boolean(alert);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const look = LOOK[alert.type] || LOOK.info;
  const { Icon } = look;

  const title = typeof alert.title === "object" ? tv(alert.title) : alert.title;
  const message =
    typeof alert.message === "object" ? tv(alert.message) : alert.message;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[400] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[3px]"
      />

      <div
        className="relative w-full max-w-[360px] rounded-[16px] border border-[var(--neutral700)] bg-[var(--neutral900)] p-6 text-center"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,.55)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute end-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--neutral300)] transition-colors hover:text-[var(--neutral100)]"
        >
          <X size={16} />
        </button>

        <span
          className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-full"
          style={{
            background: `color-mix(in srgb, ${look.color}, transparent 88%)`,
            color: look.color,
          }}
        >
          <Icon size={32} />
        </span>

        {title && (
          <p className="mt-4 text-[17px] font-extrabold text-[var(--neutral100)]">
            {title}
          </p>
        )}

        {message && (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--neutral300)]">
            {message}
          </p>
        )}

        <div
          className="mt-6 flex"
          style={{ gap: "calc(var(--u) * 2.667)" }}
        >
          {onConfirm ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="h-[44px] flex-1 cursor-pointer rounded-[10px] bg-[var(--neutral800)] text-[14px] font-bold text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
              >
                {alert.cancelText || t("no")}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="h-[44px] flex-1 cursor-pointer rounded-[10px] bg-[var(--primary500)] text-[14px] font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-[1.06]"
              >
                {alert.confirmText || t("yes")}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="h-[44px] w-full cursor-pointer rounded-[10px] bg-[var(--primary500)] text-[14px] font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-[1.06]"
            >
              {alert.okText || t("ok")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
