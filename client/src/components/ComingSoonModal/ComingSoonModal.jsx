import React, { useEffect } from "react";
import { X, Gamepad2 } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * "গেম খেলা শীঘ্রই আসছে" — গেমে ক্লিক করলে এটাই দেখায়।
 *
 * গেম লঞ্চ এখনো তৈরি হয়নি, তাই কোথাও পাঠানোর বদলে এখানেই জানিয়ে
 * দেওয়া হয়; গেমের নাম আর ছবিটা দেখানো হয় যাতে কোনটায় ক্লিক করা
 * হয়েছে বোঝা যায়।
 */
const ComingSoonModal = ({ game, onClose }) => {
  const { t, tv } = useLanguage();

  const open = Boolean(game);

  // খোলা অবস্থায় পেছনের পেজ স্ক্রল করবে না, Esc এ বন্ধ হবে
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

  const name = typeof game.name === "object" ? tv(game.name) : game.name || "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("comingSoonTitle")}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[3px]"
      />

      <div
        className="relative w-full max-w-[360px] overflow-hidden rounded-[16px] border border-[var(--modal-border)] bg-[var(--modal-bg)] p-6 text-center"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,.55)" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute end-3 top-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--modal-btn-bg)] text-[var(--modal-text)] transition-colors hover:text-[var(--modal-title)]"
        >
          <X size={16} />
        </button>

        {game.image ? (
          <img
            src={game.image}
            alt={name}
            className="mx-auto h-[92px] w-[92px] rounded-[12px] object-cover"
            draggable="false"
          />
        ) : (
          <span className="mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-[12px] bg-[var(--modal-btn-bg)] text-[var(--primary500)]">
            <Gamepad2 size={34} />
          </span>
        )}

        {name && (
          <p className="mt-4 text-[15px] font-bold text-[var(--modal-title)]">
            {name}
          </p>
        )}

        {game.vendor && (
          <p className="mt-1 text-[12px] text-[var(--neutral400)]">
            {game.vendor}
          </p>
        )}

        <p className="mt-4 text-[16px] font-extrabold text-[var(--primary500)]">
          {t("comingSoonTitle")}
        </p>

        <p className="mt-2 text-[13px] leading-relaxed text-[var(--modal-text)]">
          {t("comingSoonText")}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-[42px] w-full cursor-pointer rounded-[10px] bg-[var(--modal-primary-bg)] text-[14px] font-bold text-[var(--modal-primary-text)] transition-[filter] hover:brightness-[1.06]"
        >
          {t("gotIt")}
        </button>
      </div>
    </div>
  );
};

export default ComingSoonModal;
