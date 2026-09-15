import React from "react";

/**
 * ইতিহাসের পাতাগুলোর ছোট ছোট অংশ — ট্যাব, স্ট্যাটাস ব্যাজ, সারির লাইন।
 * টাকা ও তারিখের ফরম্যাট পাশের historyFormat.js এ।
 *
 * তিনটে পাতায় একই জিনিস বারবার লেখার বদলে এখানে একবার। রঙ ও মাপ মূল
 * সাইটের member পাতা থেকে মাপা — সারি neutral800, ট্যাব neutral800 /
 * সক্রিয়টা primary500।
 */

const STATUS_TONE = {
  pending: "var(--status-pending)",
  approved: "var(--status-success)",
  paid: "var(--status-success)",
  completed: "var(--status-success)",
  running: "var(--status-pending)",
  rejected: "var(--status-danger)",
  failed: "var(--status-danger)",
  win: "var(--status-success)",
  loss: "var(--status-danger)",
  push: "var(--status-info)",
};

/** স্ট্যাটাসের ব্যাজ — রঙটা ১৫% অস্বচ্ছ পটভূমিতে, লেখাটা পুরো রঙে */
export const StatusPill = ({ status, label }) => {
  const tone = STATUS_TONE[String(status || "").toLowerCase()] || "var(--text-muted)";

  return (
    <span
      className="inline-flex shrink-0 items-center font-semibold"
      style={{
        color: tone,
        backgroundColor: `color-mix(in srgb, ${tone}, transparent 85%)`,
        borderRadius: "var(--radius-70)",
        fontSize: "var(--fs-small)",
        padding: "calc(var(--u) * 0.8) calc(var(--u) * 2.4)",
      }}
    >
      {label}
    </span>
  );
};

/** সারির ভিতরের এক লাইন — বাঁয়ে নাম, ডানে মান */
export const Line = ({ label, value, tone }) => (
  <div
    className="flex items-baseline justify-between gap-3"
    style={{ paddingBlock: "calc(var(--u) * 0.533)" }}
  >
    <span
      className="shrink-0 text-[var(--text-muted)]"
      style={{ fontSize: "var(--fs-normal)" }}
    >
      {label}
    </span>

    <span
      className="break-all text-right font-semibold"
      style={{
        color: tone || "var(--text-primary)",
        fontSize: "var(--fs-normal)",
      }}
    >
      {value}
    </span>
  </div>
);

/** সারির উপরের অংশ — শিরোনাম, তারিখ আর ডানে ব্যাজ */
export const RowHead = ({ title, subtitle, right }) => (
  <div
    className="flex items-start justify-between gap-3"
    style={{ marginBottom: "calc(var(--u) * 2.133)" }}
  >
    <div className="min-w-0">
      <p
        className="truncate font-semibold text-[var(--neutral100)]"
        style={{ fontSize: "var(--fs-larger)" }}
      >
        {title}
      </p>

      {subtitle ? (
        <p
          className="text-[var(--text-muted)]"
          style={{
            fontSize: "var(--fs-small)",
            marginTop: "calc(var(--u) * 0.533)",
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>

    {right}
  </div>
);

/**
 * উপরের ট্যাব সারি।
 *
 * বেশি ট্যাব হলে পাশে স্ক্রল করা যায় (মোবাইলে পাঁচটা ট্যাব একসাথে
 * ধরে না), স্ক্রলবার লুকানো।
 */
export const Tabs = ({ tabs, value, onChange }) => (
  <div
    className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    style={{ marginBottom: "calc(var(--u) * 3.2)" }}
  >
    <div className="flex min-w-max" style={{ gap: "calc(var(--u) * 2.133)" }}>
      {tabs.map((tab) => {
        const active = tab.key === value;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="shrink-0 cursor-pointer font-semibold whitespace-nowrap transition-colors"
            style={{
              backgroundColor: active
                ? "var(--primary500)"
                : "var(--neutral800)",
              color: active ? "var(--neutral1000)" : "var(--text-secondary)",
              borderRadius: "var(--radius-70)",
              fontSize: "var(--fs-normal)",
              padding: "calc(var(--u) * 2.133) calc(var(--u) * 4.267)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>
);
