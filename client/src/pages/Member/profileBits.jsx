import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import { BadgeCheck, ChevronLeft, ChevronRight, Lock, User, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * প্রোফাইলের পাতাগুলোর সাধারণ অংশ।
 *
 * মূল সাইট থেকে পিক্সেল মেপে নেওয়া: বাঁয়ে ৩৪৩px চওড়া মেনুর কার্ড,
 * ডানে বাকিটা; দুটো কার্ডেরই পটভূমি পাতার মতোই #292926, আলাদা করে
 * শুধু ১px বর্ডার #484846। সারি ৫২px উঁচু, দুপাশে ১৬px ফাঁক, লেখা
 * ১৪px, আর সারির মাঝে কোনো দাগ নেই।
 *
 * ছোট পর্দায় দুটো কার্ড উপর-নিচে বসে — মূল সাইট ওখানে আলাদা পাতা
 * খোলে, কিন্তু একই তথ্য এক পাতায় রাখলে এক ট্যাপ কম লাগে আর ফিরে
 * আসার ঝামেলা থাকে না।
 */

/* মেপে পাওয়া বর্ডার — টোকেনের neutral600 (#4c4d48) এর চেয়ে এক ধাপ ম্লান */
const CARD = {
  borderRadius: "var(--radius-10)",
  border: "1px solid rgb(72, 72, 70)",
};

const MENU = [
  { to: "/member/profile/info", labelKey: "menuPersonalInfo", Icon: User },
  { to: "/member/profile/account", labelKey: "menuSecurity", Icon: Lock },
  { to: "/member/verification", labelKey: "verification", Icon: BadgeCheck },
];

/** বাঁ পাশের মেনু — কোন পাতায় আছি সেটাই হালকা করে দেখানো */
const SideMenu = () => {
  const { t } = useLanguage();

  return (
    <nav className="shrink-0 overflow-hidden lg:w-[343px]" style={CARD}>
      {MENU.map((item) => {
        const { Icon } = item;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex h-[52px] items-center gap-2 px-4 text-[14px] transition-colors ${
                isActive
                  ? "bg-[var(--neutral800)] font-semibold text-[var(--neutral100)]"
                  : "text-[var(--text-secondary)] hover:bg-white/[0.03] hover:text-[var(--neutral100)]"
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {t(item.labelKey)}
          </NavLink>
        );
      })}
    </nav>
  );
};

/** পুরো প্রোফাইল পাতার খোলস — শিরোনাম, বাঁ মেনু, ডানে কার্ড */
export const ProfileShell = ({ title, children }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: "1232px",
        paddingInline: "calc(var(--u) * 4.267)",
        paddingBottom: "calc(var(--u) * 6.4)",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: "calc(var(--u) * 4.267)",
          paddingBlock: "calc(var(--u) * 6.4)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/member/profile")}
          aria-label={t("back")}
          className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)] lg:hidden"
          style={{
            height: "calc(var(--u) * 9.067)",
            width: "calc(var(--u) * 9.067)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <h1
          className="font-semibold text-[var(--neutral100)]"
          style={{ fontSize: "calc(var(--u) * 5.333)" }}
        >
          {t("profileTitle")}
        </h1>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <SideMenu />

        <section className="min-w-0 flex-1 overflow-hidden" style={CARD}>
          {/* মেপে পাওয়া: শিরোনামের ঘরটা ৬৬px, তারপর সারিগুলো শুরু */}
          <h2
            className="flex h-[66px] items-center px-4 font-bold text-[var(--neutral100)]"
            style={{ fontSize: "calc(var(--u) * 4.8)" }}
          >
            {title}
          </h2>

          {children}
        </section>
      </div>
    </div>
  );
};

/**
 * কার্ডের ভিতরের একটা সারি।
 *
 * `onClick` না থাকলে সারিটা শুধু দেখার — তখন তীরও দেখানো হয় না,
 * নইলে ক্লিক করা যায় ভেবে ব্যবহারকারী চাপতেন।
 */
export const InfoRow = ({ label, value, hint, warn, onClick, action }) => {
  const body = (
    <>
      <span className="shrink-0 text-[14px] text-[var(--neutral100)]">
        {label}
      </span>

      <span className="ms-auto flex min-w-0 items-center gap-2">
        <span className="truncate text-[14px] text-[var(--text-secondary)]">
          {value}
        </span>

        {warn}
        {action}

        {onClick ? (
          <ChevronRight
            size={16}
            className="shrink-0 text-[var(--text-disabled)]"
          />
        ) : null}
      </span>
    </>
  );

  const className =
    "flex min-h-[52px] w-full items-center gap-3 px-4 py-2 text-left";

  return (
    <div>
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={`${className} cursor-pointer transition-colors hover:bg-white/[0.03]`}
        >
          {body}
        </button>
      ) : (
        <div className={className}>{body}</div>
      )}

      {hint ? (
        <p className="px-4 pb-2 text-[12px] text-[var(--text-disabled)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

/**
 * ঘর বদলানোর মডাল।
 *
 * মূল সাইট ডেস্কটপে আলাদা পর্দা খোলে, কিন্তু মডালে রাখলে পিছনের
 * তালিকাটা চোখের সামনেই থাকে — কোন ঘরটা বদলাচ্ছি সেটা ভুলে যাওয়ার
 * সুযোগ থাকে না, আর ছোট পর্দাতেও একই জিনিস কাজ করে।
 */
export const EditModal = ({ title, onClose, children }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[400] flex items-center justify-center px-4 py-6"
    >
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[3px]"
      />

      <div
        className="relative flex max-h-full w-full max-w-[460px] flex-col overflow-y-auto rounded-[16px] border border-[var(--neutral700)] bg-[var(--neutral900)]"
        style={{ boxShadow: "0 24px 60px rgba(0,0,0,.55)" }}
      >
        <div className="flex items-center gap-3 px-5 pt-5">
          <h3 className="text-[17px] font-extrabold text-[var(--neutral100)]">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="ms-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--neutral300)] transition-colors hover:text-[var(--neutral100)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">{children}</div>
      </div>
    </div>
  );
};

/** মডালের বড় বোতাম — সবগুলো মডালে একই চেহারা */
export const ModalButton = ({ children, ...props }) => (
  <button
    {...props}
    className="flex h-[46px] w-full cursor-pointer items-center justify-center rounded-[12px] bg-[var(--primary500)] text-[14px] font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </button>
);

/**
 * "একবার বসলে আর বদলাবে না" — নাম আর জন্ম তারিখের নিচে।
 *
 * মূল সাইটে ঠিক এই সতর্কতাই আছে; না লিখলে ব্যবহারকারী ভুল নাম
 * বসিয়ে ফেলে পরে আটকে যেতেন।
 */
export const LockNote = () => {
  const { t } = useLanguage();

  return (
    <p className="text-[12px] leading-relaxed text-[var(--text-muted)]">
      {t("profileLockNote")}
    </p>
  );
};
