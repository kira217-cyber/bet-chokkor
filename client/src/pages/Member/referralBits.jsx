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
