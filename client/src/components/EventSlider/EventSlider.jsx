import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectHomeEvents } from "../../features/global/globalSelectors";

/**
 * হোম ইভেন্ট ব্যানার — অ্যাডমিন প্যানেল থেকে আসে।
 *
 * প্রতিটা ইভেন্টে শুধু ছবি থাকতে পারে, অথবা ক্লিকে একটা লিংকে যেতে
 * পারে, অথবা একটা পপআপ (মডাল) খুলতে পারে — ছবি ও বাংলা/ইংরেজি
 * বিবরণসহ। মূল সাইটের ইভেন্ট সারির মতোই।
 */
const EventSlider = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const events = useSelector(selectHomeEvents);

  const [modal, setModal] = useState(null);

  if (!events || events.length === 0) return null;

  const onClick = (item) => {
    if (item.actionType === "modal") {
      setModal(item.modal);
      return;
    }
    if (item.actionType === "link" && item.linkUrl) {
      if (/^https?:\/\//i.test(item.linkUrl)) {
        window.open(item.linkUrl, "_blank", "noreferrer");
      } else {
        navigate(item.linkUrl);
      }
    }
  };

  return (
    <>
      <LabeledCarousel
        title={t("event")}
        items={events}
        aspect="358.81 / 172.02"
        slidesPerView={[1, 3.15]}
        /* ইভেন্ট আগে নড়ে, ফিচার্ড গেমস পরে — একসাথে নড়লে চোখে ধাক্কা লাগে */
        autoplayDelay={4000}
        autoplayStartDelay={0}
        renderItem={(item) => (
          <button
            type="button"
            onClick={() => onClick(item)}
            className="block h-full w-full cursor-pointer"
          >
            <img
              src={item.image}
              alt=""
              className="h-full w-full object-cover"
              style={{ borderRadius: "var(--radius-10)" }}
              draggable="false"
            />
          </button>
        )}
      />

      {/* ── ইভেন্ট মডাল ── */}
      {modal ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModal(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] overflow-hidden bg-[var(--neutral900)]"
            style={{ borderRadius: "var(--radius-10)" }}
          >
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <X size={18} />
            </button>

            {modal.image ? (
              <img
                src={modal.image}
                alt=""
                className="w-full object-cover"
                draggable="false"
              />
            ) : null}

            <div style={{ padding: "calc(var(--u) * 4.267)" }}>
              {tv(modal.title) ? (
                <h3
                  className="font-bold text-[var(--neutral100)]"
                  style={{ fontSize: "var(--fs-h5)" }}
                >
                  {tv(modal.title)}
                </h3>
              ) : null}

              {tv(modal.description) ? (
                <p
                  className="whitespace-pre-line text-[var(--text-secondary)]"
                  style={{
                    marginTop: "calc(var(--u) * 2.133)",
                    fontSize: "var(--fs-larger)",
                    lineHeight: 1.6,
                  }}
                >
                  {tv(modal.description)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default EventSlider;
