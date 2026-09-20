import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Trophy,
  CalendarDays,
  Volleyball,
  Dribbble,
  Loader2,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { fetchLiveSports } from "../../features/sports/sportsApi";

/**
 * হোম পেজের লাইভ ম্যাচ-অডস প্যানেল — আসল লাইভ ডেটা।
 *
 * ডেটা আসে সার্ভার প্রক্সি /api/sports/all-live থেকে (বাইরের ফিড)।
 * যেহেতু ডেটা সারাক্ষণ বদলায়, হোম পেজে থাকা অবস্থায় প্রতি ৭ সেকেন্ডে
 * অটো রিফ্রেশ হয়। এই কম্পোনেন্ট শুধু হোম পেজেই বসে, তাই আনমাউন্ট হলে
 * (অন্য পেজে গেলে) ইন্টারভাল বন্ধ হয়ে যায় — অন্য পেজে কল হয় না। ট্যাব
 * লুকানো থাকলেও কল থামে (অকারণ কল বাঁচাতে)।
 *
 * গঠন মূল সাইটের মতোই: বাঁয়ে স্পোর্ট রেল, উপরে লিগ ফিল্টার + তারিখ,
 * ডানে ম্যাচ কার্ডের সারি।
 */
const POLL_MS = 7000;

/** দশমিকের পর সর্বোচ্চ ২ ঘর (1.0833333 → 1.08) */
const odds2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return v ?? "-";
  return String(Math.round(n * 100) / 100);
};

const SPORT_ICON = {
  cricket: { img: "/assets/icons/menu/chrome/icon-sport.png" },
  tennis: { Icon: Volleyball },
  soccer: { Icon: Dribbble },
};

const MatchOdds = () => {
  const { t } = useLanguage();

  const [feed, setFeed] = useState({ date: "", sports: [] });
  const [sport, setSport] = useState("");
  const [league, setLeague] = useState("All");
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (document.hidden) return; // ট্যাব লুকানো থাকলে স্কিপ
      try {
        const data = await fetchLiveSports();
        if (alive) setFeed(data);
      } catch {
        // ব্যর্থ হলে আগের ডেটাই থাকুক
      } finally {
        if (alive) setLoading(false);
      }
    };

    load(); // সাথে সাথে একবার
    timerRef.current = setInterval(load, POLL_MS); // তারপর প্রতি ৭s

    // ট্যাবে ফিরলে সাথে সাথে একবার রিফ্রেশ
    const onVisible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      alive = false;
      clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const sports = feed.sports || [];

  // নির্বাচিত স্পোর্ট — না থাকলে প্রথমটা
  const active = useMemo(
    () => sports.find((s) => s.key === sport) || sports[0] || null,
    [sports, sport],
  );

  // নির্বাচিত স্পোর্টের লিগ (categoryName) তালিকা
  const leagues = useMemo(() => {
    if (!active) return ["All"];
    const set = [];
    active.matches.forEach((m) => {
      if (m.category && !set.includes(m.category)) set.push(m.category);
    });
    return ["All", ...set];
  }, [active]);

  const matches = useMemo(() => {
    if (!active) return [];
    if (league === "All") return active.matches;
    return active.matches.filter((m) => m.category === league);
  }, [active, league]);

  const sportButton = (item) => {
    const isActive = active && item.key === active.key;
    const conf = SPORT_ICON[item.key] || { Icon: Trophy };

    return (
      <button
        key={item.key}
        type="button"
        onClick={() => {
          setSport(item.key);
          setLeague("All");
        }}
        className="flex shrink-0 cursor-pointer items-center"
        style={{ gap: "calc(var(--u) * 2.133)" }}
      >
        {conf.img ? (
          <img
            src={conf.img}
            alt=""
            className={`shrink-0 object-contain ${isActive ? "" : "opacity-50 grayscale"}`}
            style={{ height: "calc(var(--u) * 5.333)", width: "calc(var(--u) * 5.333)" }}
            draggable="false"
          />
        ) : (
          <conf.Icon size={20} className="shrink-0" style={{ color: isActive ? "#ffffff" : "#7e7e77" }} />
        )}

        <span
          className={`truncate tracking-wide ${isActive ? "" : "hidden lg:inline"}`}
          style={{ fontSize: "var(--fs-normal)", color: isActive ? "#ffffff" : "#7e7e77" }}
        >
          {item.label}
        </span>
      </button>
    );
  };

  const teamRow = (team) => (
    <div
      className="flex shrink-0 items-center justify-between"
      style={{ height: "calc(var(--u) * 5.6)" }}
    >
      <span className="flex min-w-0 items-center" style={{ gap: "calc(var(--u) * 1.6)" }}>
        {team.logo ? (
          <img
            src={team.logo}
            alt=""
            className="shrink-0 rounded-full object-cover"
            style={{ height: "calc(var(--u) * 4.267)", width: "calc(var(--u) * 4.267)" }}
            draggable="false"
          />
        ) : (
          <span
            className="shrink-0 rounded-full"
            style={{
              height: "calc(var(--u) * 4.267)",
              width: "calc(var(--u) * 4.267)",
              background: "var(--neutral600)",
            }}
          />
        )}
        <span className="truncate text-white" style={{ fontSize: "var(--fs-larger)" }}>
          {team.name}
        </span>
      </span>

      <span className="shrink-0 ps-2 font-bold text-white" style={{ fontSize: "var(--fs-body)" }}>
        {team.score || "-"}
      </span>
    </div>
  );

  return (
    <section className="match-odds w-full mt-6 px-4 md:px-0">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--mo-bg)] lg:flex-row">
        {/* ── মোবাইল: উপরের স্পোর্ট বার ── */}
        <div
          className="flex shrink-0 items-center justify-between bg-[var(--mo-rail-bg)] lg:hidden"
          style={{ height: "calc(var(--u) * 12)", paddingInline: "calc(var(--u) * 3.2)" }}
        >
          <div className="no-scrollbar flex min-w-0 items-center overflow-x-auto" style={{ gap: "calc(var(--u) * 4.267)" }}>
            {sports.map(sportButton)}
          </div>
          <div className="flex shrink-0 items-center text-[#a8a8a4]" style={{ gap: "calc(var(--u) * 3.2)" }}>
            <Trophy size={16} />
            <CalendarDays size={16} />
          </div>
        </div>

        {/* ── ডেস্কটপ: বাঁ পাশের স্পোর্ট রেল ── */}
        <div
          className="hidden shrink-0 flex-col justify-center bg-[var(--mo-rail-bg)] lg:flex"
          style={{ width: "calc(var(--u) * 30)", gap: "calc(var(--u) * 4.267)", padding: "calc(var(--u) * 3.2)" }}
        >
          {sports.map(sportButton)}
        </div>

        {/* ── ডান পাশ: ফিল্টার + ম্যাচ কার্ড ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div
            className="hidden shrink-0 items-center justify-between lg:flex"
            style={{ height: "calc(var(--u) * 12)", paddingInline: "calc(var(--u) * 3.2)", gap: "calc(var(--u) * 2.133)" }}
          >
            <div className="no-scrollbar flex min-w-0 items-center overflow-x-auto" style={{ gap: "calc(var(--u) * 2.133)" }}>
              {leagues.map((item) => {
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
                      color: isActive ? "var(--mo-bg)" : "#cdcdcb",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            {feed.date ? (
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
                {feed.date}
                <CalendarDays size={14} />
              </span>
            ) : null}
          </div>

          {/* ── ম্যাচ কার্ড ── */}
          {loading && matches.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center gap-2 text-[#a8a8a4]">
              <Loader2 size={18} className="animate-spin" />
              <span style={{ fontSize: "var(--fs-normal)" }}>{t("loading")}</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="flex min-h-0 flex-1 items-center justify-center text-[#7e7e77]" style={{ fontSize: "var(--fs-normal)" }}>
              No live match right now
            </div>
          ) : (
            <div
              className="no-scrollbar flex min-h-0 flex-1 overflow-x-auto"
              style={{ gap: "calc(var(--u) * 2.133)", padding: "0 calc(var(--u) * 3.2) calc(var(--u) * 3.2)" }}
            >
              {matches.map((match) => (
                <article
                  key={match.id}
                  className="match-card flex shrink-0 flex-col overflow-hidden bg-[var(--mo-card-bg)]"
                  style={{ borderRadius: "var(--radius-10)" }}
                >
                  <header
                    className="flex shrink-0 items-center justify-between bg-[var(--mo-card-header)]"
                    style={{ height: "calc(var(--u) * 6.4)", paddingInline: "calc(var(--u) * 2.133)" }}
                  >
                    <p className="truncate font-semibold text-white" style={{ fontSize: "var(--fs-small)" }}>
                      {match.category || "—"}
                    </p>
                    {match.live ? (
                      <span
                        className="flex shrink-0 items-center gap-1 font-bold text-white"
                        style={{ fontSize: "var(--fs-small)" }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--mo-live)]" />
                        LIVE
                      </span>
                    ) : null}
                  </header>

                  <div className="flex min-h-0 flex-1 flex-col" style={{ padding: "calc(var(--u) * 1.6) calc(var(--u) * 2.133)" }}>
                    {teamRow(match.team1)}
                    {teamRow(match.team2)}

                    {match.statusText ? (
                      <p
                        className="truncate font-medium leading-tight text-[var(--mo-status)]"
                        style={{ fontSize: "var(--fs-normal)" }}
                      >
                        {match.statusText}
                      </p>
                    ) : null}

                    <div className="h-px shrink-0 bg-white/10" style={{ marginBlock: "calc(var(--u) * 1.2)" }} />

                    {!match.market || !match.market.selections?.length ? (
                      <div
                        className="mt-auto flex shrink-0 items-center justify-center bg-[var(--mo-odds-bg)] font-medium text-[#cdcdcb]"
                        style={{ height: "calc(var(--u) * 7)", borderRadius: "var(--radius-5)", fontSize: "var(--fs-normal)" }}
                      >
                        No Markets Available
                      </div>
                    ) : (
                      <>
                        <p
                          className="flex shrink-0 items-center truncate font-semibold leading-tight text-white"
                          style={{ gap: "calc(var(--u) * 1.6)", fontSize: "var(--fs-normal)", paddingBottom: "calc(var(--u) * 1.2)" }}
                        >
                          {match.market.name}
                        </p>

                        <div className="mt-auto flex shrink-0" style={{ gap: "calc(var(--u) * 1.6)" }}>
                          {match.market.selections.map((sel, i) => (
                            <button
                              key={i}
                              type="button"
                              className="flex min-w-0 flex-1 cursor-pointer items-center justify-between border border-white/20 bg-[var(--mo-odds-bg)] transition-colors hover:border-[var(--primary500)]"
                              style={{
                                height: "calc(var(--u) * 7)",
                                gap: "calc(var(--u) * 1.6)",
                                paddingInline: "calc(var(--u) * 1.6)",
                                borderRadius: "var(--radius-5)",
                              }}
                            >
                              <span className="truncate text-[#a8a8a4]" style={{ fontSize: "var(--fs-normal)" }}>
                                {sel.name}
                              </span>
                              <span className="shrink-0 font-bold text-white" style={{ fontSize: "var(--fs-normal)" }}>
                                {odds2(sel.odds)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <span className="sr-only">{t("liveMatchOdds")}</span>

      <style>{`
        .match-odds { height: calc(var(--u) * 56.14); }
        .match-card { width: 78%; }
        @media (min-width: 1024px) {
          .match-odds { height: calc(var(--u) * 62.4); }
          .match-card { width: calc((100% - var(--u) * 6.4) / 4); }
        }
      `}</style>
    </section>
  );
};

export default MatchOdds;
