import React, { useEffect, useState } from "react";
import {
  Clock3,
  Download,
  Fingerprint,
  Gamepad2,
  Gift,
  Headset,
  Loader2,
  Radio,
  ShieldCheck,
  Smile,
  Star,
  Trophy,
  Wallet,
  Zap,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAppDownload } from "../../features/appDownload/appDownloadApi";
import { imageUrl } from "../../features/deposit/imageUrl";

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
 * সব লেখা ও ছবি অ্যাডমিন থেকে বদলানো যায় (content); অ্যাডমিন খালি
 * রাখলে নিচের স্ট্যাটিক লেখা/ছবি দেখায়, তাই পেজ কখনো ভাঙে না। রঙ
 * section-theme (client:app-download) থেকে নিয়ন্ত্রিত।
 */

/* ফিচার আইকন — অ্যাডমিন এই কী থেকে বেছে দেয়, নইলে ডিফল্ট */
const FEATURE_ICONS = {
  download: Download,
  fingerprint: Fingerprint,
  radio: Radio,
  zap: Zap,
  shield: ShieldCheck,
  smile: Smile,
  gift: Gift,
  game: Gamepad2,
  trophy: Trophy,
  wallet: Wallet,
  support: Headset,
  star: Star,
};

/* স্ট্যাটিক fallback — অ্যাডমিন সেট না করলে এগুলোই দেখায় */
const STATIC_CARDS = [
  { img: "/assets/app/cards-sports.png", titleKey: "appExpSports", textKey: "appExpSportsText" },
  { img: "/assets/app/cards-casino.png", titleKey: "appExpCasino", textKey: "appExpCasinoText" },
  { img: "/assets/app/cards-slots.png", titleKey: "appExpSlots", textKey: "appExpSlotsText" },
  { img: "/assets/app/cards-table.png", titleKey: "appExpTable", textKey: "appExpTableText" },
];

const STATIC_FEATURES = [
  { icon: "download", key: "appFeatFree" },
  { icon: "fingerprint", key: "appFeatBiometric" },
  { icon: "radio", key: "appFeatLiveScore" },
  { icon: "zap", key: "appFeatLiveBet" },
  { icon: "shield", key: "appFeatFast" },
  { icon: "smile", key: "appFeatSecure" },
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

  /* ── কনটেন্ট: অ্যাডমিন মান, নইলে স্ট্যাটিক ── */
  const c = data?.content || {};
  const hero = c.hero || {};
  const exp = c.experience || {};
  const feat = c.features || {};

  // দ্বিভাষিক মান বা স্ট্যাটিক translation key
  const cv = (obj, key) => tv(obj) || (key ? t(key) : "");
  // অ্যাডমিন ছবি বা স্ট্যাটিক অ্যাসেট
  const ci = (url, fallback) => (url ? imageUrl(url) : fallback);

  const cards =
    Array.isArray(exp.cards) && exp.cards.length
      ? exp.cards.map((card, i) => ({
          title: cv(card.title, STATIC_CARDS[i]?.titleKey),
          text: cv(card.text, STATIC_CARDS[i]?.textKey),
          image: ci(card.image, STATIC_CARDS[i]?.img || ""),
        }))
      : STATIC_CARDS.map((card) => ({
          title: t(card.titleKey),
          text: t(card.textKey),
          image: card.img,
        }));

  const features =
    Array.isArray(feat.items) && feat.items.length
      ? feat.items.map((item) => ({
          label: cv(item.label, ""),
          Icon: FEATURE_ICONS[item.icon] || Star,
        }))
      : STATIC_FEATURES.map((item) => ({
          label: t(item.key),
          Icon: FEATURE_ICONS[item.icon],
        }));

  return (
    <div className="w-full overflow-hidden">
      {/* ══ ১) হিরো ══ */}
      <section
        className="relative w-full"
        style={{ background: "var(--appdl-section-bg)" }}
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
            * তার উপরে নারী ও টেবিল (hero-main, স্বচ্ছ পটভূমি)।
            */}
          <div className="relative w-full lg:w-1/2">
            <img
              src={ci(hero.bgImage, "/assets/app/hero-bg.png")}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 mx-auto h-full w-full max-w-[560px] object-contain"
              draggable="false"
              style={{ left: 0, right: 0 }}
            />
            <img
              src={ci(hero.mainImage, "/assets/app/hero-main.png")}
              alt=""
              className="relative mx-auto w-full max-w-[560px] object-contain"
              draggable="false"
            />
          </div>

          <div className="w-full lg:w-1/2">
            <div className="mb-5 flex items-center gap-4">
              <img
                src={ci(hero.logo, "/assets/app/image_10502.png")}
                alt="BET CHOKKOR"
                className="h-[60px] w-[60px] shrink-0 rounded-[16px] object-cover"
                draggable="false"
              />
              <h1
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "calc(var(--u) * 8)", lineHeight: 1.15 }}
              >
                {cv(hero.title, "appHeroTitle")}
              </h1>
            </div>

            <p
              className="text-[var(--neutral100)]"
              style={{ fontSize: "var(--fs-body)", marginBottom: "calc(var(--u) * 3.2)" }}
            >
              {cv(hero.lead, "appHeroLead")}
            </p>

            <p
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)", lineHeight: 1.7 }}
            >
              {cv(hero.text, "appHeroText")}
            </p>

            <p
              className="mt-6 font-semibold text-[var(--appdl-accent)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {cv(hero.helpNote, "appHelpNeeded")}
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

      {/* ══ ২) অভিজ্ঞতা — সোনালি ══ */}
      <section
        className="relative w-full"
        style={{
          background:
            "linear-gradient(180deg, var(--appdl-band-top) 0%, color-mix(in srgb, var(--appdl-band-top), var(--appdl-band-bottom) 55%) 38%, var(--appdl-band-bottom) 100%)",
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
            {cv(exp.eyebrow, "appExpEyebrow")}
          </p>
          <h2
            className="text-center font-black text-[var(--neutral100)]"
            style={{ fontSize: "calc(var(--u) * 9.333)", lineHeight: 1.2 }}
          >
            {cv(exp.title, "appExpTitle")}
          </h2>
          <p
            className="text-center text-[#ffe9c2]"
            style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u) * 6.4)" }}
          >
            {cv(exp.sub, "appExpSub")}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card, i) => (
              <div
                key={i}
                className="relative flex flex-col justify-start overflow-hidden"
                style={{
                  borderRadius: "calc(var(--u) * 4)",
                  background:
                    "linear-gradient(150deg, var(--appdl-card-bg) 0%, color-mix(in srgb, var(--appdl-card-bg), black 45%) 100%)",
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
                    {card.title}
                  </h3>
                  <p
                    className="mt-1 text-[var(--text-secondary)]"
                    style={{ fontSize: "var(--fs-normal)", lineHeight: 1.5 }}
                  >
                    {card.text}
                  </p>
                </div>

                {card.image ? (
                  <img
                    src={card.image}
                    alt=""
                    className="pointer-events-none absolute bottom-0 right-0 h-[85%] w-auto object-contain"
                    draggable="false"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ৩) ৬টি বৈশিষ্ট্য — কালো, বাঁয়ে ছবি ══ */}
      <section
        className="relative w-full"
        style={{ background: "var(--appdl-section-bg)" }}
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
              src={ci(feat.image, "/assets/app/bottom-main.png")}
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
              {cv(feat.eyebrow, "appFeatEyebrow")}
            </p>
            <h2
              className="font-black text-[var(--neutral100)]"
              style={{ fontSize: "calc(var(--u) * 8.5)", lineHeight: 1.2 }}
            >
              {cv(feat.title, "appFeatTitle")}
            </h2>
            <p
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u) * 4.267)" }}
            >
              {cv(feat.sub, "appFeatSub")}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {features.map((item, i) => {
                const FeatureIcon = item.Icon || Star;

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 text-center"
                    style={{
                      borderRadius: "var(--radius-10)",
                      background: "var(--neutral900)",
                      border: "1px solid var(--neutral800)",
                      padding: "calc(var(--u) * 4.267) calc(var(--u) * 2.667)",
                      minHeight: "calc(var(--u) * 32)",
                    }}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--appdl-accent)]/12 text-[var(--appdl-accent)]">
                      <FeatureIcon size={20} />
                    </span>
                    <span
                      className="text-[var(--neutral100)]"
                      style={{ fontSize: "var(--fs-normal)", lineHeight: 1.4 }}
                    >
                      {item.label}
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
