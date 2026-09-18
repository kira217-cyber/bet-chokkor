import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useComingSoon } from "../../Context/comingSoonContext";
import { useSelector } from "react-redux";
import { ChevronRight } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectGameCategories,
  selectGlobalGameLoading,
  selectGlobalGameLoaded,
} from "../../features/globalGame/globalGameSelectors";

/**
 * ক্যাটাগরি ট্যাব (স্পোর্ট / ক্যাসিনো / স্লট …) এবং নির্বাচিত ক্যাটাগরির
 * ভেন্ডর গ্রিড — মোবাইলে ৩ কলাম, ডেস্কটপে ৫ কলাম।
 *
 * মূল সাইট থেকে মাপা (--u এককে, দুই ভিউপোর্টেই একই):
 *   ট্যাব ২৫.৬u × ২২.৯৩u, গ্যাপ ২.১৩৩u, আইকন ১৩.৩৩৩u, লেখা --fs-larger
 *   ট্যাব skewX(-7.43deg) — সামান্য বাঁকানো প্যারালেলোগ্রাম; ভেতরের
 *   কনটেন্ট উল্টো skew করে সোজা রাখা হয়, মূল সাইটের মতোই
 *   হেডার উচ্চতা ৯.০৬৭u, প্যাডিং ০ ৪.২৬৭u ২.১৩৩u, টাইটেল --fs-body
 *   সেল ২৫.৩৭u উঁচু, প্যাডিং ৩.২u, গ্যাপ ৩.৪৬৭u, আইকন ১০.৬৬৭u
 *
 * ট্যাব সারি: মোবাইলে দুই পাশে ৪.২৬৭u প্যাডিং, ডেস্কটপে শুধু বাঁয়ে ২.১৩৩u।
 * গ্রিড: মোবাইলে ৪.২৬৭u প্যাডিং, ডেস্কটপে ০ — তাই কার্ড টাইটেলের বাঁ দিক
 * ছাড়িয়ে কলামের প্রান্ত পর্যন্ত যায়, মূল সাইটের মতোই।
 */
const Categories = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const { openComingSoon } = useComingSoon();

  const categories = useSelector(selectGameCategories);
  const loading = useSelector(selectGlobalGameLoading);
  const loaded = useSelector(selectGlobalGameLoaded);

  const [activeKey, setActiveKey] = useState("sports");

  const showSkeleton = loading || !loaded;
  const active = categories.find((item) => item.key === activeKey);

  const label = (item) => tv(item.name);

  return (
    <section
      className="flex w-full flex-col"
      style={{
        marginTop: "calc(var(--u) * 4.267)",
        gap: "calc(var(--u) * 2.667)",
      }}
    >
      {/* ── ট্যাব সারি ── */}
      <div
        className="no-scrollbar cat-tabs flex overflow-x-auto"
        style={{ gap: "calc(var(--u) * 2.133)" }}
      >
        {(showSkeleton ? Array.from({ length: 8 }) : categories).map(
          (item, index) => {
            const isActive = item && item.key === activeKey;

            return (
              <button
                key={item?.key || index}
                type="button"
                disabled={showSkeleton}
                onClick={() => item && setActiveKey(item.key)}
                className={`cat-tab relative shrink-0 cursor-pointer transition-colors duration-200 ${
                  showSkeleton ? "animate-pulse" : ""
                }`}
                style={{
                  width: "calc(var(--u) * 25.6)",
                  height: "calc(var(--u) * 22.93)",
                  borderRadius: "var(--radius-10)",
                  backgroundColor: isActive
                    ? "var(--primary500)"
                    : "var(--neutral800)",
                }}
              >
                {item && (
                  <span className="cat-tab__inner flex h-full w-full flex-col items-center justify-center">
                    <img
                      src={isActive ? item.activeIcon : item.icon}
                      alt=""
                      className="object-contain"
                      style={{
                        height: "calc(var(--u) * 13.333)",
                        width: "calc(var(--u) * 13.333)",
                      }}
                      draggable="false"
                    />

                    <span
                      className="font-bold leading-none"
                      style={{
                        fontSize: "var(--fs-larger)",
                        color: isActive
                          ? "var(--neutral600)"
                          : "var(--neutral200)",
                      }}
                    >
                      {label(item)}
                    </span>
                  </span>
                )}
              </button>
            );
          },
        )}
      </div>

      {/* ── নির্বাচিত ক্যাটাগরির হেডার + গ্রিড ── */}
      {active && (
        <div style={{ paddingBlock: "calc(var(--u) * 2.133)" }}>
          <div
            className="bc-pad flex items-center"
            style={{
              height: "calc(var(--u) * 9.067)",
              gap: "calc(var(--u) * 2.133)",
              paddingBottom: "calc(var(--u) * 2.133)",
              boxSizing: "content-box",
            }}
          >
            <img
              src={active.activeIcon}
              alt=""
              className="object-contain"
              style={{
                height: "calc(var(--u) * 6.4)",
                width: "calc(var(--u) * 6.4)",
              }}
              draggable="false"
            />

            <h2
              className="font-semibold text-[var(--neutral100)]"
              style={{ fontSize: "var(--fs-body)", lineHeight: 1 }}
            >
              {label(active)}
            </h2>

            {active.key !== "sports" && (
              <Link
                to={`/games/${active.key}`}
                className="ms-auto flex items-center gap-1 text-[var(--text-muted)] transition-colors hover:text-[var(--primary500)]"
                style={{ fontSize: "var(--fs-normal)" }}
              >
                {t("viewAll")}
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          <div
            className="cat-grid grid grid-cols-3 lg:grid-cols-5"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {active.vendors.map((vendor) => {
              // স্পোর্টসের কার্ডগুলো প্রোভাইডার নয়, গেম — white-label থেকে
              // আসা এন্ট্রিতে `code` (game_uid) থাকে, তাই ক্লিকে সরাসরি
              // গেম লঞ্চ হয় (Bajiman এর মতো)। `code` না থাকলে (স্ট্যাটিক
              // ফলব্যাক) "শীঘ্রই আসছে" মডাল খোলে
              const isSports = active.key === "sports";
              const sportGameUid = vendor.code || "";

              const cellProps = {
                className:
                  "vendor-cell relative flex flex-col overflow-hidden bg-[var(--neutral800)] text-start transition-colors hover:bg-[var(--neutral700)]",
                style: {
                  height: "calc(var(--u) * 25.37)",
                  padding: "calc(var(--u) * 3.2)",
                  gap: "calc(var(--u) * 3.467)",
                  borderRadius: "var(--radius-10)",
                  "--vendor-icon": `url(${vendor.icon})`,
                },
              };

              const inner = (
                <>
                <span
                  className="z-[1] flex shrink-0 items-center justify-center rounded-full bg-[var(--neutral700)]"
                  style={{
                    height: "calc(var(--u) * 10.667)",
                    width: "calc(var(--u) * 10.667)",
                    padding: "calc(var(--u) * 1.333)",
                  }}
                >
                  <img
                    src={vendor.icon}
                    alt=""
                    className="h-full w-full object-contain"
                    draggable="false"
                  />
                </span>

                <span
                  className="z-[1] font-bold leading-[1.3] text-[var(--neutral200)]"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {tv(vendor.name)}
                </span>
                </>
              );

              if (isSports) {
                return (
                  <button
                    key={`${active.key}-${vendor.key}`}
                    type="button"
                    onClick={() =>
                      sportGameUid
                        ? navigate(`/play/${sportGameUid}`)
                        : openComingSoon({
                            name: vendor.name,
                            image: vendor.icon,
                          })
                    }
                    {...cellProps}
                    className={`${cellProps.className} cursor-pointer`}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <Link
                  key={`${active.key}-${vendor.key}`}
                  to={`/games/${active.key}?vendor=${vendor.key}`}
                  {...cellProps}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        /* প্যারালেলোগ্রাম ট্যাব — বাইরের বাক্স বাঁকা, ভেতরের কনটেন্ট সোজা */
        .cat-tab {
          transform: skewX(-7.43deg);
        }

        .cat-tab__inner {
          transform: skewX(7.43deg);
        }

        /* উপরে হালকা গ্রেডিয়েন্ট বর্ডার */
        .cat-tab::before {
          content: "";
          position: absolute;
          inset: 1px;
          border-radius: inherit;
          background: linear-gradient(
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0)
          );
          pointer-events: none;
        }

        .cat-tabs {
          padding-inline: calc(var(--u) * 4.267);
        }

        .cat-grid {
          padding-inline: calc(var(--u) * 4.267);
        }

        /* কার্ডের উপরে হালকা গ্রেডিয়েন্ট বর্ডার */
        .vendor-cell::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(180deg, #ffffff0a, #fff0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          z-index: 1;
        }

        /* ডান-নিচে ভেন্ডর লোগোর ফিকে ওয়াটারমার্ক */
        .vendor-cell::after {
          content: "";
          position: absolute;
          right: calc(var(--u) * -5.333);
          bottom: calc(var(--u) * -5.333);
          width: calc(var(--u) * 21.867);
          height: calc(var(--u) * 21.867);
          background-image: var(--vendor-icon);
          background-size: contain;
          background-repeat: no-repeat;
          opacity: 0.05;
          filter: grayscale(1);
          pointer-events: none;
          z-index: 0;
        }

        @media (min-width: 1024px) {
          .cat-tabs {
            padding-inline: calc(var(--u) * 2.133) 0;
          }

          .cat-grid {
            padding-inline: 0;
          }
        }
      `}</style>
    </section>
  );
};

export default Categories;
