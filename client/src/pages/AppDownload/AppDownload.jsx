import React, { useEffect, useState } from "react";
import {
  Clock3,
  Download,
  Fingerprint,
  Loader2,
  Radio,
  ShieldCheck,
  Smile,
  Zap,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAppDownload } from "../../features/appDownload/appDownloadApi";

const API_URL = import.meta.env.VITE_API_URL || "";

const readableSize = (bytes) => {
  const mb = Number(bytes || 0) / (1024 * 1024);
  if (mb <= 0) return "";
  return mb >= 1 ? `${mb.toFixed(0)} MB` : `${(mb * 1024).toFixed(0)} KB`;
};

/**
 * অ্যাপ ডাউনলোড — মূল সাইট (betchokkor.com/bd/bn/app-download) হুবহু।
 *
 * তিনটে অংশ: (১) কালো হিরো — বাঁয়ে টেবিলের ছবি, ডানে ডাউনলোড; (২)
 * সোনালি ব্যাকগ্রাউন্ডে "অভিজ্ঞতা" — চারটে ক্যারেক্টার কার্ড; (৩)
 * কালো "৬টি মূল বৈশিষ্ট্য" — বাঁয়ে রুলেট-নর্তকীর ছবি, ডানে ছয়টা ঘর।
 *
 * APK অ্যাডমিন আপলোড করলে সোনালি বোতামে ডাউনলোড (যে নামে আপলোড সেই
 * নামেই); না থাকলে বোতামের বদলে অ্যাডমিনের বার্তা।
 */
const CARDS = [
  { key: "sports", img: "/assets/app/cards-sports.png", titleKey: "appExpSports", textKey: "appExpSportsText" },
  { key: "casino", img: "/assets/app/cards-casino.png", titleKey: "appExpCasino", textKey: "appExpCasinoText" },
  { key: "slots", img: "/assets/app/cards-slots.png", titleKey: "appExpSlots", textKey: "appExpSlotsText" },
  { key: "table", img: "/assets/app/cards-table.png", titleKey: "appExpTable", textKey: "appExpTableText" },
];

const FEATURES = [
  { key: "appFeatFree", Icon: Download },
  { key: "appFeatBiometric", Icon: Fingerprint },
  { key: "appFeatLiveScore", Icon: Radio },
  { key: "appFeatLiveBet", Icon: Zap },
  { key: "appFeatFast", Icon: ShieldCheck },
  { key: "appFeatSecure", Icon: Smile },
];

const AppDownload = () => {
  const { t, tv } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchAppDownload()
      .then((next) => alive && setData(next))
      .catch(() => alive && setData({ available: false, note: {} }))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const available = data?.available;
  const downloadHref = available ? `${API_URL}${data.downloadUrl}` : "";

  return (
    <div className="w-full overflow-hidden">
      {/* ══ ১) হিরো ══ */}
      <section
        className="relative w-full"
        style={{ background: "#0a0a09" }}
      >
        <div
          className="mx-auto flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-10"
          style={{
            maxWidth: "var(--content-width)",
            paddingInline: "calc(var(--u) * 4.267)",
            paddingBlock: "calc(var(--u) * 6.4)",
          }}
        >
          {/*
            * হিরোর ছবি দুই স্তরে — পেছনে সোনালি স্ফুলিঙ্গ (hero-bg),
            * তার উপরে নারী ও টেবিল (hero-main, স্বচ্ছ পটভূমি)। লাইভ
            * সাইটও এভাবেই বসায়; একটা ছবিতে দুটো থাকলে সাইজ বড় হতো
            * আর স্ফুলিঙ্গটা আলাদা করে নড়ানো যেত না।
            */}
          <div className="relative w-full lg:w-1/2">
            <img
              src="/assets/app/hero-bg.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mx-auto h-full w-full max-w-[560px] object-contain"
              draggable="false"
              style={{ left: 0, right: 0 }}
            />
            <img
              src="/assets/app/hero-main.png"
              alt=""
              className="relative mx-auto w-full max-w-[560px] object-contain"
              draggable="false"
            />
          </div>

          <div className="w-full lg:w-1/2">
            <div className="mb-5 flex items-center gap-4">
              <img
                src="/assets/app/image_10502.png"
                alt="BET CHOKKOR"
                className="h-[60px] w-[60px] shrink-0 rounded-[16px] object-cover"
                draggable="false"
              />
              <h1
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "calc(var(--u) * 8)", lineHeight: 1.15 }}
              >
                {t("appHeroTitle")}
              </h1>
            </div>

            <p
              className="text-[var(--neutral100)]"
              style={{ fontSize: "var(--fs-body)", marginBottom: "calc(var(--u) * 3.2)" }}
            >
              {t("appHeroLead")}
            </p>

            <p
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)", lineHeight: 1.7 }}
            >
              {t("appHeroText")}
            </p>

            <p
              className="mt-6 font-semibold text-[var(--primary500)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {t("appHelpNeeded")}
            </p>

            <div className="mt-4">
              {loading ? (
                <span className="flex items-center gap-2 text-[var(--text-muted)]">
                  <Loader2 size={18} className="animate-spin" />
                  {t("loading")}
                </span>
              ) : available ? (
                <a
                  href={downloadHref}
                  className="inline-flex items-center gap-3 rounded-[12px] bg-[var(--neutral900)] px-6 py-3 transition-[filter] hover:brightness-110"
                  style={{ border: "1px solid var(--neutral700)" }}
                >
                  <img
                    src="/assets/app/btn-apk.png"
                    alt=""
                    className="h-9 w-auto object-contain"
                    draggable="false"
                  />
                  {data.size ? (
                    <span
                      className="text-[var(--text-muted)]"
                      style={{ fontSize: "var(--fs-small)" }}
                    >
                      {readableSize(data.size)}
                    </span>
                  ) : null}
                </a>
              ) : (
                <div
                  className="flex items-start gap-3 rounded-[12px] bg-[var(--neutral900)] p-4"
                  style={{ border: "1px solid var(--neutral700)", maxWidth: "440px" }}
                >
                  <Clock3 size={20} className="mt-0.5 shrink-0 text-[var(--status-pending)]" />
                  <p
                    className="text-[var(--text-secondary)]"
                    style={{ fontSize: "var(--fs-larger)", lineHeight: 1.6 }}
                  >
                    {tv(data?.note) || t("appComingSoon")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ ২) অভিজ্ঞতা — সোনালি ══
        *
        * bg-middle-web.jpg আসলে কালো ঢেউয়ের ছবি; লাইভ সাইটের সোনালি
        * ভাবটা আসে একটা গ্রেডিয়েন্ট থেকে — উপরে গাঢ়, নিচে উজ্জ্বল
        * সোনালি। তাই গ্রেডিয়েন্টই মূল, ছবিটা তার উপরে হালকা করে বসানো।
        */}
      <section
        className="relative w-full"
        style={{
          background:
            "linear-gradient(180deg, #241802 0%, #8a5e02 38%, #f9b901 100%)",
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen"
          style={{ backgroundImage: "url(/assets/app/bg-middle-web.jpg)" }}
        />
        <div
          className="relative mx-auto w-full"
          style={{
            maxWidth: "var(--content-width)",
            paddingInline: "calc(var(--u) * 4.267)",
            paddingBlock: "calc(var(--u) * 9.333)",
          }}
        >
          <p
            className="text-center font-semibold text-[#ffdf9a]"
            style={{ fontSize: "var(--fs-h4)" }}
          >
            {t("appExpEyebrow")}
          </p>
          <h2
            className="text-center font-black text-[var(--neutral100)]"
            style={{ fontSize: "calc(var(--u) * 9.333)", lineHeight: 1.2 }}
          >
            {t("appExpTitle")}
          </h2>
          <p
            className="text-center text-[#ffe9c2]"
            style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u) * 6.4)" }}
          >
            {t("appExpSub")}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {CARDS.map((card) => (
              <div
                key={card.key}
                className="relative flex flex-col justify-start overflow-hidden"
                style={{
                  borderRadius: "calc(var(--u) * 4)",
                  background:
                    "linear-gradient(150deg, #2a2a26 0%, #14140f 100%)",
                  border: "1px solid rgba(249,185,1,0.35)",
                  minHeight: "calc(var(--u) * 45)",
                  padding: "calc(var(--u) * 4.267)",
                }}
              >
                <div className="relative z-10 max-w-[55%]">
                  <h3
                    className="font-black text-[var(--neutral100)]"
                    style={{ fontSize: "calc(var(--u) * 6.4)" }}
                  >
                    {t(card.titleKey)}
                  </h3>
                  <p
                    className="mt-1 text-[var(--text-secondary)]"
                    style={{ fontSize: "var(--fs-normal)", lineHeight: 1.5 }}
                  >
                    {t(card.textKey)}
                  </p>
                </div>

                <img
                  src={card.img}
                  alt=""
                  className="pointer-events-none absolute bottom-0 right-0 h-[85%] w-auto object-contain"
                  draggable="false"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ৩) ৬টি বৈশিষ্ট্য — কালো, বাঁয়ে ছবি ══ */}
      <section
        className="relative w-full"
        style={{ background: "#0a0a09" }}
      >
        <div
          className="mx-auto flex w-full flex-col items-center gap-6 lg:flex-row"
          style={{
            maxWidth: "var(--content-width)",
            paddingInline: "calc(var(--u) * 4.267)",
            paddingBlock: "calc(var(--u) * 9.333)",
          }}
        >
          {/* বাঁয়ে বড় ছবি */}
          <div className="w-full lg:w-1/2">
            <img
              src="/assets/app/bottom-main.png"
              alt=""
              className="mx-auto w-full max-w-[560px] object-contain"
              draggable="false"
            />
          </div>

          {/* ডানে বৈশিষ্ট্য */}
          <div className="w-full lg:w-1/2">
            <p
              className="font-semibold text-[var(--primary600)]"
              style={{ fontSize: "var(--fs-h4)" }}
            >
              {t("appFeatEyebrow")}
            </p>
            <h2
              className="font-black text-[var(--neutral100)]"
              style={{ fontSize: "calc(var(--u) * 8.5)", lineHeight: 1.2 }}
            >
              {t("appFeatTitle")}
            </h2>
            <p
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u) * 4.267)" }}
            >
              {t("appFeatSub")}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURES.map((item) => {
                const FeatureIcon = item.Icon;

                return (
                <div
                  key={item.key}
                  className="flex flex-col items-center gap-2 text-center"
                  style={{
                    borderRadius: "var(--radius-10)",
                    background: "var(--neutral900)",
                    border: "1px solid var(--neutral800)",
                    padding: "calc(var(--u) * 4.267) calc(var(--u) * 2.667)",
                    minHeight: "calc(var(--u) * 32)",
                  }}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary500)]/12 text-[var(--primary500)]">
                    <FeatureIcon size={20} />
                  </span>
                  <span
                    className="text-[var(--neutral100)]"
                    style={{ fontSize: "var(--fs-normal)", lineHeight: 1.4 }}
                  >
                    {t(item.key)}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AppDownload;
