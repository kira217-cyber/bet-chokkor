import React from "react";

/**
 * রেফারেল পাতার অংশগুলো — মূল সাইট থেকে মেপে।
 *
 * ১৪৪০ প্রস্থে মাপা: সোনালি প্যানেল ৮১৭px চওড়া, radius ৫px, ভিতরের
 * কালো ঘর #383835 radius ৩px, শিরোনামের আগে ৪px চওড়া গাঢ় দাগ,
 * মাইলফলকের টালি ৮০×৯০ radius ৩px।
 */

/** সোনালি প্যানেলের ঢাল — বাঁয়ে মোলায়েম, ডানে পুরো সোনালি */
export const GOLD =
  "linear-gradient(90deg, #eeba66 0%, #f7dfa0 22%, #f9b901 100%)";

/**
 * সোনালি প্যানেল।
 *
 * শিরোনামের আগে গাঢ় দাগটা মূল সাইটেই আছে — ওটা না থাকলে লেখাটা
 * সোনালির উপর ভেসে থাকে, কোথায় শুরু বোঝা যায় না।
 */
export const GoldPanel = ({ title, action, children }) => (
  <div
    style={{
      background: GOLD,
      borderRadius: "5px",
      padding: "calc(var(--u) * 4.267)",
    }}
  >
    <div
      className="flex flex-wrap items-center justify-between gap-2"
      style={{ marginBottom: "calc(var(--u) * 4.267)" }}
    >
      <div className="flex items-center" style={{ gap: "calc(var(--u) * 2.667)" }}>
        <span
          style={{
            backgroundColor: "var(--neutral600)",
            borderRadius: "1px",
            height: "16px",
            width: "4px",
          }}
        />

        <span
          className="font-semibold"
          style={{ color: "var(--neutral1000)", fontSize: "16px" }}
        >
          {title}
        </span>
      </div>

      {action}
    </div>

    {children}
  </div>
);

/** প্যানেলের ভিতরের কালো ঘর — নাম উপরে, সংখ্যা নিচে */
export const DarkStat = ({ label, value, tone }) => (
  <div
    className="min-w-0 flex-1 bg-[var(--neutral800)]"
    style={{
      borderRadius: "3px",
      // ৩৯০px এ তিনটে পাশাপাশি বসালে "তাঁদের টার্নওভার" এর মতো লেখা
      // কেটে যায়, তাই ন্যূনতম চওড়া বাড়ানো — তখন দুটো করে সারিতে নামে
      minWidth: "132px",
      padding: "calc(var(--u) * 2.667) calc(var(--u) * 4.267)",
    }}
  >
    <p
      className="truncate text-[var(--text-primary)]"
      style={{ fontSize: "12px" }}
    >
      {label}
    </p>

    <p
      className="truncate font-semibold"
      style={{
        color: tone || "var(--primary500)",
        fontSize: "18px",
        marginTop: "calc(var(--u) * 2.133)",
      }}
    >
      {value}
    </p>
  </div>
);

/**
 * প্যানেলের বাঁ পাশের বড় সংখ্যাটা।
 *
 * পেছনের হালকা রিংটা মূল সাইটের — সংখ্যাটা বড় বলে একা বসলে ফাঁকা
 * দেখাত।
 */
export const BigNumber = ({ value, label }) => (
  <div
    className="relative flex shrink-0 flex-col items-center justify-center text-center"
    style={{ minWidth: "133px", paddingBlock: "calc(var(--u) * 2.133)" }}
  >
    <span
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full"
      style={{
        border: "1px solid rgba(255, 255, 255, 0.35)",
        height: "96px",
        width: "96px",
      }}
    />

    <span
      className="relative font-semibold"
      style={{ color: "var(--neutral1000)", fontSize: "30px" }}
    >
      {value}
    </span>

    <span
      className="relative"
      style={{
        color: "var(--neutral1000)",
        fontSize: "14px",
        marginTop: "calc(var(--u) * 1.6)",
      }}
    >
      {label}
    </span>
  </div>
);

/**
 * মাইলফলকের সারি।
 *
 * কালো পটভূমিতে সোনালি টালি; উপরে সময়কালের নাম, নিচে অগ্রগতির রেখা ও
 * বিন্দু। যে ধাপ পেরিয়ে গেছে তার বিন্দু সোনালি হয়ে যায়।
 */
export const MilestoneStrip = ({ period, milestones, inviteLabel }) => (
  <div
    className="bg-[var(--neutral800)]"
    style={{ borderRadius: "3px", overflow: "hidden" }}
  >
    <p
      className="text-center font-semibold text-[var(--text-primary)]"
      style={{
        borderBottom: "1px solid var(--neutral600)",
        fontSize: "14px",
        paddingBlock: "calc(var(--u) * 2.667)",
      }}
    >
      {period}
    </p>

    <div
      className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ padding: "calc(var(--u) * 3.2) calc(var(--u) * 2.133)" }}
    >
      <div className="flex min-w-max" style={{ gap: "8px" }}>
        {milestones.map((item) => (
          <div key={item.count} className="shrink-0 text-center" style={{ width: "80px" }}>
            <div
              style={{
                background: item.reached
                  ? "linear-gradient(180deg, #f9b901, rgba(249,185,1,0.5) 60%, rgba(249,185,1,0))"
                  : "linear-gradient(180deg, rgba(249,185,1,0.35), rgba(249,185,1,0.12) 60%, rgba(249,185,1,0))",
                backgroundColor: "#222424",
                borderRadius: "3px",
                height: "90px",
                paddingTop: "calc(var(--u) * 3.2)",
              }}
            >
              <p style={{ color: "var(--text-primary)", fontSize: "12px" }}>
                {inviteLabel}
              </p>

              <p
                className="font-semibold"
                style={{ color: "#ffdf1a", fontSize: "20px" }}
              >
                {item.count}
              </p>
            </div>

            <p
              style={{
                color: "var(--text-primary)",
                fontSize: "12px",
                fontWeight: 500,
                marginTop: "calc(var(--u) * 1.6)",
              }}
            >
              +{item.amount.toLocaleString("en-US")}
            </p>
          </div>
        ))}
      </div>

      {/* অগ্রগতির রেখা — প্রতিটা ধাপের নিচে একটা বিন্দু */}
      <div
        className="relative min-w-max"
        style={{ marginTop: "calc(var(--u) * 2.133)" }}
      >
        <div
          className="absolute"
          style={{
            backgroundColor: "var(--neutral600)",
            height: "1px",
            insetInline: "40px",
            top: "3px",
          }}
        />

        <div className="relative flex min-w-max" style={{ gap: "8px" }}>
          {milestones.map((item) => (
            <span
              key={item.count}
              className="flex shrink-0 justify-center"
              style={{ width: "80px" }}
            >
              <span
                className="rounded-full"
                style={{
                  backgroundColor: item.reached
                    ? "var(--primary500)"
                    : "var(--neutral600)",
                  height: "7px",
                  width: "7px",
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/**
 * "কিভাবে আরো প্রাইজ পাবেন?" — তিন ধাপের ফ্লোচার্ট।
 *
 * মূল সাইট (referral-program/info) থেকে নেওয়া: বড় সোনালি সংখ্যা, পাশে
 * ধাপের ছবি, নিচে ছোট বর্ণনা। ছোট পর্দায় এক কলাম, বড় পর্দায় তিন।
 */
export const PrizeSteps = ({ title, steps }) => (
  <div
    className="bg-[var(--neutral900)]"
    style={{
      borderRadius: "var(--radius-10)",
      padding: "calc(var(--u) * 4.267)",
    }}
  >
    <h3
      className="font-bold text-[var(--neutral100)]"
      style={{
        fontSize: "calc(var(--u) * 5.333)",
        marginBottom: "calc(var(--u) * 4.267)",
      }}
    >
      {title}
    </h3>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="relative flex flex-col overflow-hidden bg-[var(--neutral800)]"
          style={{
            borderRadius: "var(--radius-5)",
            padding: "calc(var(--u) * 3.733)",
            minHeight: "calc(var(--u) * 40)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="font-black leading-none"
              style={{ color: "#ffdf1a", fontSize: "calc(var(--u) * 16)" }}
            >
              {index + 1}
            </span>

            {step.img ? (
              <img
                src={step.img}
                alt=""
                className="h-[64px] w-[64px] shrink-0 object-contain"
                draggable="false"
              />
            ) : null}
          </div>

          <p
            className="mt-auto font-bold"
            style={{ color: "#ffdf1a", fontSize: "var(--fs-body)" }}
          >
            {step.title}
          </p>
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-normal)", marginTop: "calc(var(--u) * 1.067)" }}
          >
            {step.text}
          </p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * ডার্ক প্যানেল — referral-program/info পাতার মতো।
 *
 * ওই পাতায় বাক্সগুলো সোনালি নয়, গাঢ় (#292926 এর কাছাকাছি) বর্ডার
 * সহ। শিরোনামের আগে সোনালি দাগ, ডানে ঐচ্ছিক বোতাম।
 */
export const DarkPanel = ({ title, action, children }) => (
  <div
    style={{
      background: "var(--neutral900)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "var(--radius-10)",
      padding: "calc(var(--u) * 4.267)",
    }}
  >
    {title ? (
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ marginBottom: "calc(var(--u) * 3.2)" }}
      >
        <span
          className="font-bold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-h4)" }}
        >
          {title}
        </span>

        {action}
      </div>
    ) : null}

    {children}
  </div>
);

/**
 * ক্যাশ রিওয়ার্ড রেশিও — একটা ব্যান্ডের তিনটে লেভেল, পাশে তীর দিয়ে
 * ব্যান্ড বদলানো যায়।
 *
 * মূল সাইটে উপরে তিনটে রেঞ্জের মাথা (টার্নওভার/ডিপোজিট/জয়-পরাজয়), আর
 * নিচে লেভেল ১/২/৩ এর শতাংশ। ব্যান্ড একটার বেশি থাকলে তীর দেখা যায়।
 */
export const CashRatio = ({
  bands = [],
  maxTier = 3,
  index,
  onPrev,
  onNext,
  labels,
}) => {
  const band = bands[index] || {};
  const tierOf = (n) =>
    (band.tiers || []).find((item) => item.tier === n)?.percent;

  return (
    <div>
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        style={{ marginBottom: "calc(var(--u) * 3.2)" }}
      >
        <span
          className="font-bold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-body)" }}
        >
          {labels.title}
        </span>

        {bands.length > 1 ? (
          <div className="flex items-center" style={{ gap: "calc(var(--u) * 1.6)" }}>
            <button
              type="button"
              onClick={onPrev}
              aria-label={labels.prev}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label={labels.next}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      {/* রেঞ্জের মাথা */}
      <div
        className="flex flex-wrap gap-x-6 gap-y-1"
        style={{ marginBottom: "calc(var(--u) * 3.2)" }}
      >
        {[
          [labels.turnoverRange, band.requireTurnover],
          [labels.depositRange, 0],
          [labels.winLossRange, 0],
        ].map(([name, value]) => (
          <span
            key={name}
            className="text-[var(--text-muted)]"
            style={{ fontSize: "var(--fs-normal)" }}
          >
            {name}{" "}
            <b style={{ color: "#ffdf1a" }}>
              {labels.over} {value}
            </b>
          </span>
        ))}
      </div>

      {/* লেভেল */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {Array.from({ length: maxTier }).map((_, i) => {
          const pct = tierOf(i + 1);

          return (
            <div
              key={i}
              className="flex items-center justify-between bg-[var(--neutral800)]"
              style={{
                borderRadius: "var(--radius-5)",
                padding: "calc(var(--u) * 3.2) calc(var(--u) * 3.733)",
              }}
            >
              <span
                className="text-[var(--text-secondary)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {labels.level} {i + 1}
              </span>
              <span
                className="font-bold"
                style={{ color: "#ffdf1a", fontSize: "var(--fs-larger)" }}
              >
                {pct != null ? `${pct}%` : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
