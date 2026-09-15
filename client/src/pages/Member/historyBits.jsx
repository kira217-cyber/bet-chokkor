import React from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { statusTone } from "./historyFormat";

/**
 * ইতিহাসের পাতার ছোট ছোট অংশ।
 *
 * Bajiman এর হিস্টোরি মডালগুলোর গড়ন — উপরে সারাংশ, তারপর ছাঁকনি,
 * তারপর কার্ডের তালিকা (শিরোনাম + স্ট্যাটাস, ২×২ ঘর, নিচে তারিখ),
 * সবার নিচে পাতা বদলানোর সারি। রঙ ও মাপ বেটচক্করের নিজের।
 *
 * টাকা ও তারিখের ফরম্যাট পাশের historyFormat.js এ।
 */

/** স্ট্যাটাসের ব্যাজ — রঙটা হালকা পটভূমিতে, লেখাটা পুরো রঙে */
export const StatusPill = ({ status, label, icon }) => {
  const tone = statusTone(status);

  return (
    <span
      className="inline-flex shrink-0 items-center font-semibold"
      style={{
        color: tone,
        backgroundColor: `color-mix(in srgb, ${tone}, transparent 85%)`,
        borderRadius: "var(--radius-70)",
        fontSize: "var(--fs-small)",
        gap: "calc(var(--u) * 1.067)",
        padding: "calc(var(--u) * 0.8) calc(var(--u) * 2.4)",
      }}
    >
      {icon}
      {label}
    </span>
  );
};

/**
 * কার্ডের উপরের অংশ — শিরোনাম, তার নিচে ছোট লাইনগুলো, ডানে ব্যাজ।
 *
 * `lines` এ যা দেওয়া হবে তাই ছোট হরফে বসে; খালি মান বাদ পড়ে, তাই
 * "চ্যানেল: —" এর মতো অর্থহীন লাইন দেখা যায় না।
 */
export const CardHead = ({ title, lines = [], right }) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p
        className="truncate font-bold text-[var(--neutral100)]"
        style={{ fontSize: "var(--fs-larger)" }}
      >
        {title}
      </p>

      {lines.filter(Boolean).map((line, index) => (
        <p
          key={index}
          className="break-all text-[var(--text-muted)]"
          style={{
            fontSize: "var(--fs-small)",
            marginTop: "calc(var(--u) * 0.8)",
          }}
        >
          {line}
        </p>
      ))}
    </div>

    {right}
  </div>
);

/** ২×২ ঘরের একটা ঘর — উপরে নাম, নিচে মান */
export const StatBox = ({ icon, label, value, tone }) => (
  <div
    className="min-w-0 bg-[var(--neutral900)]"
    style={{
      borderRadius: "var(--radius-5)",
      padding: "calc(var(--u) * 2.133)",
    }}
  >
    <div
      className="flex items-center text-[var(--text-muted)]"
      style={{ fontSize: "var(--fs-small)", gap: "calc(var(--u) * 1.067)" }}
    >
      {icon}
      <span className="truncate">{label}</span>
    </div>

    <p
      className="truncate font-bold"
      style={{
        color: tone || "var(--text-primary)",
        fontSize: "var(--fs-normal)",
        marginTop: "calc(var(--u) * 0.8)",
      }}
    >
      {value}
    </p>
  </div>
);

export const StatGrid = ({ children }) => (
  <div
    className="grid grid-cols-2"
    style={{
      gap: "calc(var(--u) * 2.133)",
      marginTop: "calc(var(--u) * 3.2)",
    }}
  >
    {children}
  </div>
);

/** কার্ডের নিচের ছোট লাইন — সাধারণত তারিখ */
export const CardFoot = ({ children }) => (
  <p
    className="text-[var(--text-muted)]"
    style={{
      fontSize: "var(--fs-small)",
      marginTop: "calc(var(--u) * 2.667)",
    }}
  >
    {children}
  </p>
);

/**
 * উপরের ট্যাব সারি।
 *
 * পাঁচটা ট্যাব মোবাইলে একসাথে ধরে না, তাই পাশে স্ক্রল করা যায়;
 * স্ক্রলবার লুকানো, কারণ মূল সাইটেও দেখা যায় না।
 */
export const Tabs = ({ tabs, value, onChange, size = "normal" }) => (
  <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="flex min-w-max" style={{ gap: "calc(var(--u) * 2.133)" }}>
      {tabs.map((tab) => {
        const active = tab.key === value;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="flex shrink-0 cursor-pointer items-center font-semibold whitespace-nowrap transition-colors"
            style={{
              backgroundColor: active
                ? "var(--primary500)"
                : "var(--neutral800)",
              color: active ? "var(--neutral1000)" : "var(--text-secondary)",
              borderRadius: "var(--radius-70)",
              fontSize: size === "small" ? "var(--fs-small)" : "var(--fs-normal)",
              gap: "calc(var(--u) * 1.6)",
              padding:
                size === "small"
                  ? "calc(var(--u) * 1.6) calc(var(--u) * 3.2)"
                  : "calc(var(--u) * 2.133) calc(var(--u) * 4.267)",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>
);

/** সারাংশের সারি — আইকন, কী দেখছি, কতগুলো, আর রিফ্রেশ */
export const SummaryHead = ({ icon, title, total, totalLabel, onRefresh, busy }) => (
  <div
    className="flex items-center justify-between bg-[var(--neutral800)]"
    style={{
      borderRadius: "var(--radius-10)",
      gap: "calc(var(--u) * 3.2)",
      padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
    }}
  >
    <div className="flex min-w-0 items-center" style={{ gap: "calc(var(--u) * 3.2)" }}>
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-[var(--neutral700)] text-[var(--primary500)]"
        style={{
          height: "calc(var(--u) * 10.667)",
          width: "calc(var(--u) * 10.667)",
        }}
      >
        {icon}
      </span>

      <div className="min-w-0">
        <p
          className="truncate font-bold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-larger)" }}
        >
          {title}
        </p>

        <p
          className="text-[var(--text-muted)]"
          style={{
            fontSize: "var(--fs-small)",
            marginTop: "calc(var(--u) * 0.533)",
          }}
        >
          {totalLabel}: {total}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={onRefresh}
      aria-label="refresh"
      className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral700)] text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
      style={{
        borderRadius: "var(--radius-10)",
        height: "calc(var(--u) * 9.067)",
        width: "calc(var(--u) * 9.067)",
      }}
    >
      <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
    </button>
  </div>
);

/** পাতা বদলানোর সারি — একটাই পাতা হলে দেখা যায় না */
export const Pager = ({ page, totalPages, total, labels, onChange, busy }) => {
  if (totalPages <= 1) return null;

  const button = (disabled, onClick, children) => (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className="flex flex-1 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)] disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        borderRadius: "var(--radius-10)",
        fontSize: "var(--fs-normal)",
        gap: "calc(var(--u) * 1.067)",
        height: "calc(var(--u) * 10.133)",
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ marginTop: "calc(var(--u) * 3.2)" }}>
      <div
        className="flex items-center justify-between text-[var(--text-muted)]"
        style={{
          fontSize: "var(--fs-small)",
          marginBottom: "calc(var(--u) * 2.133)",
        }}
      >
        <span>
          {labels.page} {page} {labels.of} {totalPages}
        </span>
        <span>
          {labels.total}: {total}
        </span>
      </div>

      <div className="flex" style={{ gap: "calc(var(--u) * 2.133)" }}>
        {button(page <= 1, () => onChange(page - 1), (
          <>
            <ChevronLeft size={15} />
            {labels.prev}
          </>
        ))}

        {button(page >= totalPages, () => onChange(page + 1), (
          <>
            {labels.next}
            <ChevronRight size={15} />
          </>
        ))}
      </div>
    </div>
  );
};
