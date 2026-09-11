import React, { useState } from "react";
import {
  Trophy,
  CalendarDays,
  ChevronDown,
  Volleyball,
  Dribbble,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * হোম পেজের লাইভ ম্যাচ-অডস প্যানেল।
 *
 * মূল সাইটে এটা একটা থার্ড-পার্টি স্কোর উইজেট। আপাতত স্ট্যাটিক ডেটা দিয়ে
 * একই লেআউট — server যুক্ত হলে এখানে লাইভ ফিড বসবে।
 *
 * গঠন (মূল সাইট থেকে): ডেস্কটপে বাঁ পাশে স্পোর্ট রেল (CRICKET / TENNIS /
 * SOCCER) ও উপরে লিগ ফিল্টার পিল + তারিখ; মোবাইলে সেটাই উপরের বারে
 * (ট্রফি ও ক্যালেন্ডার আইকনসহ)। ডানে ম্যাচ কার্ডের সারি।
 * উচ্চতা মাপা: মোবাইলে ২১৮.৯৫px (৫৬.১৪u), ডেস্কটপে ২৩৪px (৬২.৪u)।
 */
const SPORTS = [
  { key: "cricket", label: "CRICKET", icon: "/assets/icons/menu/chrome/icon-sport.png" },
  { key: "tennis", label: "TENNIS", Icon: Volleyball },
  { key: "soccer", label: "SOCCER", Icon: Dribbble },
];

const LEAGUES = ["All", "Caribbean Premier League"];

const MATCHES = [
  {
    key: "muscat-royal",
    country: "Oman",
    league: "D50 League",
    status: "1 INN, 35.1 OV",
    teams: [
      { name: "Muscat Thunderers", score: "181/10", badge: "#3d4fa8" },
      { name: "Royal Oman Stallions", score: "157/6", badge: "#3d4fa8" },
    ],
    noMarket: true,
  },
  {
    key: "sl-pak",
    country: "International",
    league: "T20 Asia Cup, Women",
    status: "1 INN, 18.2 OV",
    market: "Match Odds",
    badges: ["M", "F", "B"],
    teams: [
      { name: "Sri Lanka", score: "127/6", badge: "#d4462e" },
      { name: "Pakistan", score: "130/5", badge: "#1e6b3a" },
    ],
    odds: [
      { name: "-", value: "1.01", pair: true },
      { name: "1000", value: "-", pair: true, up: true },
    ],
  },
  {
    key: "eng-sl",
    country: "International",
    league: "T20 Internationals",
    status: "1 INN, 3.3 OV",
    market: "4 Over SL",
    marketBadge: "F",
    badges: ["F", "B", "P"],
    teams: [
      { name: "England Lions", score: "0/0", badge: "#c8102e" },
      { name: "Sri Lanka", score: "28/4", badge: "#d4462e" },
    ],
    odds: [{ name: "31", value: "32", sub: "100", pair: true }],
  },
];

// মূল সাইটে ম্যাচের ধরন অনুযায়ী ব্যাজের রঙ
const BADGE_COLORS = {
  M: "#f0a500",
  F: "#3ba55d",
  B: "#4a8ef0",
  P: "#c060e0",
};

const MatchOdds = () => {
  const { t } = useLanguage();

  const [sport, setSport] = useState("cricket");
  const [league, setLeague] = useState("All");

  const sportButton = (item, isActive) => (
    <button
      key={item.key}
      type="button"
      onClick={() => setSport(item.key)}
      className="flex shrink-0 cursor-pointer items-center"
      style={{ gap: "calc(var(--u) * 2.133)" }}
    >
      {item.icon ? (
        <img
          src={item.icon}
          alt=""
          className={`shrink-0 object-contain ${
            isActive ? "" : "opacity-50 grayscale"
          }`}
          style={{
            height: "calc(var(--u) * 5.333)",
            width: "calc(var(--u) * 5.333)",
          }}
          draggable="false"
        />
      ) : (
        <item.Icon
          size={20}
          className="shrink-0"
          style={{ color: isActive ? "#ffffff" : "#7e7e77" }}
        />
      )}

      {/* মোবাইলের বারে শুধু অ্যাক্টিভ স্পোর্টের নাম, রেলে সবগুলোর */}
      <span
        className={`truncate tracking-wide ${isActive ? "" : "hidden lg:inline"}`}
        style={{
          fontSize: "var(--fs-normal)",
          color: isActive ? "#ffffff" : "#7e7e77",
        }}
      >
        {item.label}
      </span>
    </button>
  );

  // মূল সাইটে ওডস দুই রকম: নাম+মান জোড়া, অথবা নীল/গোলাপি back-lay জোড়া
  const oddsCell = (odd, index) => {
    const half = (text, sub, bg) => (
      <span
        className="relative flex flex-1 flex-col items-center justify-center font-bold text-[#1c1c1a]"
        style={{ height: "calc(var(--u) * 7)", background: bg }}
      >
        <span style={{ fontSize: "var(--fs-normal)", lineHeight: 1.05 }}>
          {text}
        </span>

        {sub ? (
          <span style={{ fontSize: "var(--fs-mini)", lineHeight: 1 }}>{sub}</span>
        ) : null}
      </span>
    );

    if (odd.pair) {
      return (
        <span
          key={index}
          className="odds-pair relative flex min-w-0 flex-1 overflow-hidden"
          style={{ borderRadius: "var(--radius-5)" }}
        >
          {half(odd.name, odd.sub, "#8ac6f5")}
          {half(odd.value, odd.sub, "#f5a7bd")}

          {/* দাম বাড়ার সবুজ কোণ-চিহ্ন */}
          {odd.up ? <span className="odds-pair__up" /> : null}
        </span>
      );
    }

    return (
      <button
        key={index}
        type="button"
        className="flex min-w-0 flex-1 cursor-pointer items-center justify-between border border-white/20 bg-[#262626] transition-colors hover:border-[var(--primary500)]"
        style={{
          height: "calc(var(--u) * 7)",
          gap: "calc(var(--u) * 1.6)",
          paddingInline: "calc(var(--u) * 1.6)",
          borderRadius: "var(--radius-5)",
        }}
      >
        <span
          className="truncate text-[#a8a8a4]"
          style={{ fontSize: "var(--fs-normal)" }}
        >
          {odd.name}
        </span>
        <span
          className="shrink-0 font-bold text-white"
          style={{ fontSize: "var(--fs-normal)" }}
        >
          {odd.value}
        </span>
      </button>
    );
  };

  return (
    <section className="match-odds w-full mt-6 px-4 md:px-0">
      <div
        className="flex h-full w-full flex-col overflow-hidden bg-[#1c1c1a] lg:flex-row"
      >
        {/* ── মোবাইল: উপরের স্পোর্ট বার ── */}
        <div
          className="flex shrink-0 items-center justify-between bg-[#141413] lg:hidden"
          style={{
            height: "calc(var(--u) * 12)",
            paddingInline: "calc(var(--u) * 3.2)",
          }}
        >
          <div
            className="flex items-center"
            style={{ gap: "calc(var(--u) * 4.267)" }}
          >
            {SPORTS.map((item) => sportButton(item, item.key === sport))}
          </div>

          <div
            className="flex items-center text-[#a8a8a4]"
            style={{ gap: "calc(var(--u) * 3.2)" }}
          >
            <Trophy size={16} />
            <CalendarDays size={16} />
          </div>
        </div>

        {/* ── ডেস্কটপ: বাঁ পাশের স্পোর্ট রেল ── */}
        <div
          className="hidden shrink-0 flex-col justify-center bg-[#141413] lg:flex"
          style={{
            width: "calc(var(--u) * 30)",
            gap: "calc(var(--u) * 4.267)",
            padding: "calc(var(--u) * 3.2)",
          }}
        >
          {SPORTS.map((item) => sportButton(item, item.key === sport))}
        </div>

        {/* ── ডান পাশ: ফিল্টার সারি + ম্যাচ কার্ড ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="hidden shrink-0 items-center justify-between lg:flex"
            style={{
              height: "calc(var(--u) * 12)",
              paddingInline: "calc(var(--u) * 3.2)",
              gap: "calc(var(--u) * 2.133)",
            }}
          >
            <div
              className="no-scrollbar flex min-w-0 items-center overflow-x-auto"
              style={{ gap: "calc(var(--u) * 2.133)" }}
            >
              {LEAGUES.map((item) => {
                const isActive = item === league;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLeague(item)}
                    className="shrink-0 cursor-pointer whitespace-nowrap transition-colors"
                    style={{
                      height: "calc(var(--u) * 7)",
                      paddingInline: "calc(var(--u) * 3.2)",
                      borderRadius: "var(--radius-70)",
                      fontSize: "var(--fs-normal)",
                      background: isActive ? "#ffffff" : "#3d3d39",
                      color: isActive ? "#1c1c1a" : "#cdcdcb",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <span
              className="flex shrink-0 items-center border border-white/15 text-[#cdcdcb]"
              style={{
                height: "calc(var(--u) * 7)",
                gap: "calc(var(--u) * 1.6)",
                paddingInline: "calc(var(--u) * 2.133)",
                borderRadius: "var(--radius-5)",
                fontSize: "var(--fs-normal)",
              }}
            >
              2026-09-11
              <CalendarDays size={14} />
            </span>
          </div>

          <div
            className="no-scrollbar flex min-h-0 flex-1 overflow-x-auto"
            style={{
              gap: "calc(var(--u) * 2.133)",
              padding: "0 calc(var(--u) * 3.2) calc(var(--u) * 3.2)",
            }}
          >
            {MATCHES.map((match) => (
              <article
                key={match.key}
                className="match-card flex shrink-0 flex-col overflow-hidden bg-[#1e1e1e]"
                style={{ borderRadius: "var(--radius-10)" }}
              >
                <header
                  className="flex shrink-0 items-center justify-between bg-[#1d2ab8]"
                  style={{
                    height: "calc(var(--u) * 6.4)",
                    paddingInline: "calc(var(--u) * 2.133)",
                  }}
                >
                  <p
                    className="truncate text-white"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    <span className="font-bold">{match.country}</span>
                    <span className="mx-1.5 opacity-60">|</span>
                    <span className="font-semibold">{match.league}</span>
                  </p>

                  <span
                    className="flex shrink-0 items-center gap-1 font-bold text-white"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00b585]" />
                    LIVE
                  </span>
                </header>

                <div
                  className="flex min-h-0 flex-1 flex-col"
                  style={{
                    padding: "calc(var(--u) * 1.6) calc(var(--u) * 2.133)",
                  }}
                >
                  {match.teams.map((team) => (
                    <div
                      key={team.name}
                      className="flex shrink-0 items-center justify-between"
                      style={{ height: "calc(var(--u) * 5.6)" }}
                    >
                      <span
                        className="flex min-w-0 items-center"
                        style={{ gap: "calc(var(--u) * 1.6)" }}
                      >
                        <span
                          className="shrink-0 rounded-full"
                          style={{
                            height: "calc(var(--u) * 4.267)",
                            width: "calc(var(--u) * 4.267)",
                            background: team.badge || "var(--neutral600)",
                          }}
                        />

                        <span
                          className="truncate text-white"
                          style={{ fontSize: "var(--fs-larger)" }}
                        >
                          {team.name}
                        </span>
                      </span>

                      <span
                        className="shrink-0 ps-2 font-bold text-white"
                        style={{ fontSize: "var(--fs-body)" }}
                      >
                        {team.score}
                      </span>
                    </div>
                  ))}

                  <div
                    className="flex shrink-0 items-center justify-between"
                    style={{ gap: "calc(var(--u) * 1.6)" }}
                  >
                    <p
                      className="truncate font-medium leading-tight text-[#7b8cff]"
                      style={{ fontSize: "var(--fs-normal)" }}
                    >
                      {match.status}
                    </p>

                    {/* ম্যাচের ধরন বোঝানো রঙিন ব্যাজ (M/F/B/P) */}
                    {match.badges && (
                      <span
                        className="flex shrink-0 items-center"
                        style={{ gap: "calc(var(--u) * 0.8)" }}
                      >
                        {match.badges.map((badge) => (
                          <span
                            key={badge}
                            className="flex items-center justify-center rounded-full font-bold text-[#1c1c1a]"
                            style={{
                              height: "calc(var(--u) * 3.73)",
                              width: "calc(var(--u) * 3.73)",
                              fontSize: "var(--fs-mini)",
                              background: BADGE_COLORS[badge],
                            }}
                          >
                            {badge}
                          </span>
                        ))}

                        <ChevronDown size={12} className="text-[#a8a8a4]" />
                      </span>
                    )}
                  </div>

                  <div
                    className="h-px shrink-0 bg-white/10"
                    style={{ marginBlock: "calc(var(--u) * 1.2)" }}
                  />

                  {match.noMarket ? (
                    <div
                      className="mt-auto flex shrink-0 items-center justify-center bg-[#333333] font-medium text-[#cdcdcb]"
                      style={{
                        height: "calc(var(--u) * 7)",
                        borderRadius: "var(--radius-5)",
                        fontSize: "var(--fs-normal)",
                      }}
                    >
                      No Markets Available
                    </div>
                  ) : (
                    <>
                      <p
                        className="flex shrink-0 items-center truncate font-semibold leading-tight text-white"
                        style={{
                          gap: "calc(var(--u) * 1.6)",
                          fontSize: "var(--fs-normal)",
                          paddingBottom: "calc(var(--u) * 1.2)",
                        }}
                      >
                        {match.marketBadge ? (
                          <span
                            className="flex shrink-0 items-center justify-center rounded-full font-bold text-[#1c1c1a]"
                            style={{
                              height: "calc(var(--u) * 3.73)",
                              width: "calc(var(--u) * 3.73)",
                              fontSize: "var(--fs-mini)",
                              background: BADGE_COLORS[match.marketBadge],
                            }}
                          >
                            {match.marketBadge}
                          </span>
                        ) : null}
                        {match.market}
                      </p>

                      <div
                        className="mt-auto flex shrink-0"
                        style={{ gap: "calc(var(--u) * 1.6)" }}
                      >
                        {match.odds.map(oddsCell)}
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <span className="sr-only">
        {t("liveMatchOdds")}
      </span>

      <style>{`
        .match-odds {
          height: calc(var(--u) * 56.14);
        }

        .match-card {
          width: 78%;
        }

        /* দাম বাড়ার সবুজ কোণ-চিহ্ন (উপরে-ডানে) */
        .odds-pair__up {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-top: calc(var(--u) * 2.4) solid #1fa463;
          border-left: calc(var(--u) * 2.4) solid transparent;
        }

        @media (min-width: 1024px) {
          .match-odds {
            height: calc(var(--u) * 62.4);
          }

          .match-card {
            width: calc((100% - var(--u) * 6.4) / 4);
          }
        }
      `}</style>
    </section>
  );
};

export default MatchOdds;
