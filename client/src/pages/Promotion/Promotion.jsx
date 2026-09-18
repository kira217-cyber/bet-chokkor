import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Clock, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectPromotions } from "../../features/global/globalSelectors";

/**
 * প্রমোশন পাতা — মূল সাইটের /promotion এর হুবহু।
 *
 * উপরে ক্যাটাগরি ট্যাব (ওয়েলকাম অফার / স্লট / লাইভ ক্যাসিনো …), নিচে
 * কার্ড: ছবি + ব্যাজ + তারিখ রেঞ্জ + শিরোনাম + "আরও পড়ুন"। কার্ডে
 * ক্লিকে বিস্তারিত মডাল।
 */
const CATEGORIES = [
  { key: "welcome-offer", bn: "ওয়েলকাম অফার", en: "Welcome Offer" },
  { key: "slots", bn: "স্লট", en: "Slots" },
  { key: "live-casino", bn: "লাইভ ক্যাসিনো", en: "Live Casino" },
  { key: "sports", bn: "স্পোর্টস", en: "Sports" },
  { key: "fishing", bn: "ফিশিং", en: "Fishing" },
  { key: "lottery", bn: "লটারী", en: "Lottery" },
  { key: "table", bn: "টেবিল", en: "Table" },
  { key: "arcade", bn: "আর্কেড", en: "Arcade" },
  { key: "crash", bn: "ক্র্যাশ", en: "Crash" },
  { key: "other", bn: "অন্যান্য", en: "Other" },
];

const pad = (n) => String(n).padStart(2, "0");
const fmt = (d) => {
  if (!d) return "";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  return `${x.getFullYear()}/${pad(x.getMonth() + 1)}/${pad(x.getDate())} ${pad(
    x.getHours(),
  )}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
};

const Promotion = () => {
  const { t, tv, isBangla } = useLanguage();
  const promotions = useSelector(selectPromotions);

  // মূল সাইটের মতোই সব ক্যাটাগরি ট্যাব দেখায়
  const tabs = CATEGORIES;

  const [category, setCategory] = useState("welcome-offer");
  const active = category;
  const [detail, setDetail] = useState(null);

  const list = promotions.filter((p) => p.category === active);

  const catLabel = (key) => {
    const c = CATEGORIES.find((x) => x.key === key);
    return c ? (isBangla ? c.bn : c.en) : key;
  };

  return (
    <div
      className="bc-page"
      style={{
        paddingBlock: "calc(var(--u) * 4.267)",
        paddingInline: "calc(var(--u) * 4.267)",
      }}
    >
      <h1
        className="font-bold text-[var(--neutral100)]"
        style={{ fontSize: "var(--fs-h3)", marginBottom: "calc(var(--u) * 4.267)" }}
      >
        {t("promotion")}
      </h1>

      {/* ── ক্যাটাগরি ট্যাব ── */}
      {tabs.length > 0 && (
        <div
          className="no-scrollbar flex overflow-x-auto"
          style={{ gap: "calc(var(--u) * 2.133)", marginBottom: "calc(var(--u) * 4.267)" }}
        >
          {tabs.map((c) => {
            const on = c.key === active;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className="shrink-0 cursor-pointer font-semibold transition-colors"
                style={{
                  height: "calc(var(--u) * 9.6)",
                  paddingInline: "calc(var(--u) * 4.267)",
                  borderRadius: "999px",
                  fontSize: "var(--fs-larger)",
                  background: on ? "var(--primary500)" : "var(--neutral800)",
                  color: on ? "var(--btn-primary-txt)" : "var(--text-secondary)",
                }}
              >
                {isBangla ? c.bn : c.en}
              </button>
            );
          })}
        </div>
      )}

      {list.length === 0 ? (
        <p
          className="text-center text-[var(--text-muted)]"
          style={{ paddingBlock: "calc(var(--u) * 10.667)", fontSize: "var(--fs-larger)" }}
        >
          {t("promoEmpty")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((promo) => (
            <div
              key={promo.id}
              className="overflow-hidden bg-[var(--neutral800)]"
              style={{ borderRadius: "var(--radius-10)" }}
            >
              <img
                src={promo.image}
                alt={tv(promo.title)}
                className="w-full object-cover"
                style={{ aspectRatio: "358.81 / 165" }}
                draggable="false"
              />

              <div style={{ padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267) calc(var(--u) * 4.267)" }}>
                {/* ব্যাজ */}
                <div className="flex flex-wrap items-center" style={{ gap: "calc(var(--u) * 1.6)" }}>
                  {promo.tag ? (
                    <span
                      className="font-bold text-[var(--btn-primary-txt)]"
                      style={{
                        background: "var(--primary500)",
                        borderRadius: "var(--radius-3)",
                        padding: "calc(var(--u) * 0.5) calc(var(--u) * 1.6)",
                        fontSize: "var(--fs-small)",
                      }}
                    >
                      {promo.tag}
                    </span>
                  ) : null}
                  <span
                    className="text-[var(--text-secondary)]"
                    style={{
                      background: "var(--neutral700)",
                      borderRadius: "var(--radius-3)",
                      padding: "calc(var(--u) * 0.5) calc(var(--u) * 1.6)",
                      fontSize: "var(--fs-small)",
                    }}
                  >
                    {catLabel(promo.category)}
                  </span>
                </div>

                {/* তারিখ রেঞ্জ */}
                {promo.startAt || promo.endAt ? (
                  <p
                    className="flex items-center text-[var(--text-muted)]"
                    style={{
                      gap: "calc(var(--u) * 1.333)",
                      marginTop: "calc(var(--u) * 2.133)",
                      fontSize: "var(--fs-small)",
                    }}
                  >
                    <Clock size={12} />
                    {fmt(promo.startAt)} ~ {fmt(promo.endAt)}
                  </p>
                ) : null}

                {/* শিরোনাম */}
                {tv(promo.title) ? (
                  <p
                    className="font-bold text-[var(--neutral100)]"
                    style={{ marginTop: "calc(var(--u) * 2.133)", fontSize: "var(--fs-larger)" }}
                  >
                    {tv(promo.title)}
                  </p>
                ) : null}

                {/* আরও পড়ুন */}
                <button
                  type="button"
                  onClick={() => setDetail(promo)}
                  className="flex cursor-pointer items-center font-semibold text-[var(--primary500)]"
                  style={{ gap: "calc(var(--u) * 1.067)", marginTop: "calc(var(--u) * 2.667)", fontSize: "var(--fs-larger)" }}
                >
                  {t("readMore")} ›
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── বিস্তারিত মডাল ── */}
      {detail ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setDetail(null)}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto bg-[var(--neutral900)]"
            style={{ borderRadius: "var(--radius-10)" }}
          >
            <button
              type="button"
              onClick={() => setDetail(null)}
              aria-label="close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            >
              <X size={18} />
            </button>

            <img src={detail.image} alt="" className="w-full object-cover" draggable="false" />

            <div style={{ padding: "calc(var(--u) * 4.267)" }}>
              {tv(detail.title) ? (
                <h3 className="font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-h5)" }}>
                  {tv(detail.title)}
                </h3>
              ) : null}

              {detail.startAt || detail.endAt ? (
                <p
                  className="flex items-center text-[var(--text-muted)]"
                  style={{ gap: "calc(var(--u) * 1.333)", marginTop: "calc(var(--u) * 1.6)", fontSize: "var(--fs-small)" }}
                >
                  <Clock size={12} />
                  {fmt(detail.startAt)} ~ {fmt(detail.endAt)}
                </p>
              ) : null}

              {tv(detail.description) ? (
                <p
                  className="whitespace-pre-line text-[var(--text-secondary)]"
                  style={{ marginTop: "calc(var(--u) * 2.667)", fontSize: "var(--fs-larger)", lineHeight: 1.6 }}
                >
                  {tv(detail.description)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Promotion;
