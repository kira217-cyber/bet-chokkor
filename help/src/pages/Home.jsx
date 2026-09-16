import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Dice5,
  Gift,
  Lightbulb,
  Search,
  Trophy,
  User,
  Wallet,
} from "lucide-react";

import { useLang } from "../LangContext.jsx";
import { UI, TOPICS } from "../data.js";

const ICONS = {
  user: User,
  wallet: Wallet,
  lightbulb: Lightbulb,
  gift: Gift,
  trophy: Trophy,
  dice: Dice5,
};

/**
 * সাহায্য কেন্দ্রের হোম — help-cazvip.com এর মতো।
 *
 * উপরে সোনালি স্বাগত শিরোনাম, তারপর "কীভাবে সাহায্য করি" + সার্চ,
 * তারপর ছয়টা সোনালি টপিক কার্ড। সার্চে লিখলে প্রশ্নগুলো ফিল্টার হয়ে
 * সরাসরি ফল দেখায়, তাই খুঁজতে টপিক ঘাঁটতে হয় না।
 */
const Home = () => {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    const hits = [];
    TOPICS.forEach((topic) => {
      topic.faqs.forEach((faq, index) => {
        const text = `${t(faq.q)} ${t(faq.a)}`.toLowerCase();
        if (text.includes(q)) hits.push({ topic, faq, index });
      });
    });
    return hits;
  }, [query, t]);

  return (
    <>
      {/* ── স্বাগত হিরো ── */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url(/assets/home-bg-scaled.webp)" }}
      >
        <div className="hv-container py-16 text-center md:py-20">
          <h1 className="text-[28px] font-extrabold leading-tight text-[var(--gold)] md:text-[36px]">
            {t(UI.heroTitle)}
          </h1>
          <p className="mx-auto mt-4 max-w-[880px] text-[14px] leading-relaxed text-[var(--text-soft)] md:text-[15px]">
            {t(UI.heroText)}
          </p>
        </div>
      </section>

      {/* ── সার্চ ── */}
      <section className="hv-container py-12">
        <h2 className="text-center text-[22px] font-extrabold text-white md:text-[26px]">
          {t(UI.helpLead)}
          <span className="text-[var(--gold-bright)]">{t(UI.helpWord)}</span>
          {t(UI.helpTail)}
        </h2>

        <div className="relative mx-auto mt-6 max-w-[1000px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(UI.searchPlaceholder)}
            className="h-14 w-full rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] pe-14 ps-5 text-[15px] text-white outline-none placeholder:text-[var(--text-mute)] focus:border-[var(--gold)]"
          />
          <Search
            size={20}
            className="absolute end-5 top-1/2 -translate-y-1/2 text-[var(--gold)]"
          />
        </div>

        {/* ── সার্চের ফল ── */}
        {results ? (
          <div className="mx-auto mt-6 max-w-[1000px]">
            {results.length === 0 ? (
              <p className="py-8 text-center text-[15px] text-[var(--text-mute)]">
                {t(UI.noResult)}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {results.map((hit) => (
                  <Link
                    key={hit.topic.key + hit.index}
                    to={`/topic/${hit.topic.key}`}
                    className="block rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--gold)]"
                  >
                    <p className="text-[15px] font-semibold text-white">
                      {t(hit.faq.q)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--text-mute)]">
                      {t(hit.faq.a)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* ── টপিক ── */}
      {!results ? (
        <section className="hv-container pb-16">
          <div className="mb-5 flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h3 className="text-[18px] font-bold text-white">{t(UI.topics)}</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((topic) => {
              const Icon = ICONS[topic.icon] || User;

              return (
                <Link
                  key={topic.key}
                  to={`/topic/${topic.key}`}
                  className="hv-topic group flex items-center gap-4 rounded-xl p-6 transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black/15 text-black/80">
                    <Icon size={28} />
                  </span>
                  <span className="text-[18px] font-bold text-black">
                    {t(topic.name)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
};

export default Home;
