import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectNotice,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

/**
 * পিল আকৃতির স্ক্রলিং নোটিশ বার (মূল সাইটের marquee)।
 * মাপ: উচ্চতা ৮u, radius --radius-70, বাঁ প্যাডিং ও গ্যাপ ২.১৩৩u,
 * আইকন ৪.২৬৭u — মোবাইল ও ডেস্কটপ দুই জায়গাতেই এক।
 */
const Notice = () => {
  const { tv } = useLanguage();

  const notice = useSelector(selectNotice);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  const showSkeleton = loading || !loaded;
  const text = tv(notice?.text);

  return (
    <section className="bc-pad w-full">
      <div
        className="flex items-center overflow-hidden bg-[var(--home-card-bg)]"
        style={{
          height: "calc(var(--u) * 8)",
          borderRadius: "var(--radius-70)",
          paddingInlineStart: "calc(var(--u) * 2.133)",
          gap: "calc(var(--u) * 2.133)",
        }}
      >
        <img
          src="/assets/icons/utility/icon-speaker.svg"
          alt=""
          className="shrink-0 object-contain"
          style={{
            height: "calc(var(--u) * 4.267)",
            width: "calc(var(--u) * 4.267)",
          }}
          draggable="false"
        />

        <div className="relative flex-1 overflow-hidden">
          {showSkeleton ? (
            <div
              className="animate-pulse rounded bg-[var(--neutral700)]"
              style={{ height: "calc(var(--u) * 3.2)", width: "60%" }}
            />
          ) : (
            <div className="notice-track">
              <span
                className="text-[var(--text-secondary)]"
                style={{ fontSize: "var(--fs-normal)" }}
              >
                {text || ""}
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .notice-track {
          display: inline-block;
          white-space: nowrap;
          padding-left: 100%;
          animation: noticeMarquee 28s linear infinite;
        }

        .notice-track:hover {
          animation-play-state: paused;
        }

        @keyframes noticeMarquee {
          0% {
            transform: translateX(0%);
          }

          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
};

export default Notice;
