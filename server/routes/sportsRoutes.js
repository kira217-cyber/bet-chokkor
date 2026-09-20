import express from "express";
import axios from "axios";

import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const SOURCE_URL =
  process.env.SPORTS_FEED_URL || "https://vip-api.oraclegames.live/api/all-sports";

const SPORT_META = {
  1: { key: "soccer", label: "SOCCER" },
  5: { key: "tennis", label: "TENNIS" },
  21: { key: "cricket", label: "CRICKET" },
};

/*
 * ছোট ইন-মেমরি ক্যাশ (~৫ সেকেন্ড)।
 *
 * হোম পেজ থেকে প্রতি ৭ সেকেন্ডে অনেক ব্যবহারকারী একসাথে কল করলেও যাতে
 * বাইরের ফিডে বারবার আঘাত না লাগে — ৫ সেকেন্ডের মধ্যে আগেরটাই ফেরত।
 */
let cache = { at: 0, payload: null };
const TTL = 5000;

const text = (v) => (v == null ? "" : String(v));

/** দশমিকের পর সর্বোচ্চ ২ ঘর — 1.0833333 → 1.08, 1.10 → 1.1, 5 → 5 */
const round2 = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return text(v);
  return String(Math.round(n * 100) / 100);
};

const normalize = (raw) => {
  const data = raw?.data || {};
  const sports = Array.isArray(data.sports) ? data.sports : [];

  const out = sports
    .map((sport) => {
      const meta = SPORT_META[sport.sportId] || {
        key: `sport-${sport.sportId}`,
        label: `SPORT ${sport.sportId}`,
      };

      const eventList = sport?.data?.eventList || {};

      const matches = Object.entries(eventList)
        .filter(([, ev]) => ev && ev.display !== false)
        .map(([id, ev]) => {
          const sb = ev.scoreboard || {};
          // খেলা-নির্দিষ্ট স্কোরবোর্ড (soccer/tennis/cricket…) থেকে সময়
          const inner = Object.values(sb).find(
            (v) => v && typeof v === "object" && !Array.isArray(v),
          );
          const timeStr =
            inner?.matchTime || inner?.currentOver || inner?.over || "";
          const statusText = [sb.stage, timeStr].filter(Boolean).join(" · ");

          // ওডস মার্কেট — openMarketTypes এর প্রথমটা
          let market = null;
          const mt = (ev.openMarketTypes || [])[0];
          const arr =
            ev.market2 && mt != null ? ev.market2[String(mt)] : null;

          if (Array.isArray(arr) && arr[0]) {
            const m = arr[0];
            market = {
              name: text(m.marketName),
              selections: (m.selections || [])
                .slice(0, 3)
                .map((s) => ({
                  name: text(s.selectionName),
                  odds: s.odds != null ? round2(s.odds) : "-",
                })),
            };
          }

          return {
            id,
            category: text(ev.categoryName),
            live: ev.eventStatus === 1,
            statusText,
            redirectUrl: text(ev.redirectUrl),
            team1: {
              name: text(ev.team1?.name),
              logo: text(ev.team1?.logoURL),
              score: text(sb.team1Score),
            },
            team2: {
              name: text(ev.team2?.name),
              logo: text(ev.team2?.logoURL),
              score: text(sb.team2Score),
            },
            market,
          };
        })
        // লাইভ আগে, তারপর যত আছে (সর্বোচ্চ ৩০টা প্রতি স্পোর্ট)
        .sort((a, b) => Number(b.live) - Number(a.live))
        .slice(0, 30);

      return { sportId: sport.sportId, key: meta.key, label: meta.label, matches };
    })
    .filter((s) => s.matches.length);

  return { date: text(data.date), sports: out };
};

/** হোম পেজের লাইভ ম্যাচ-অডস ফিড (পাবলিক) */
router.get("/all-live", async (req, res) => {
  try {
    const now = Date.now();
    if (cache.payload && now - cache.at < TTL) {
      return successResponse(res, "Live sports (cached)", cache.payload);
    }

    const { data } = await axios.get(SOURCE_URL, {
      timeout: 8000,
      headers: { Accept: "application/json" },
    });

    const payload = normalize(data);
    cache = { at: now, payload };

    return successResponse(res, "Live sports", payload);
  } catch (error) {
    // ব্যর্থ হলে আগের ক্যাশ থাকলে সেটাই দেওয়া, নইলে খালি
    if (cache.payload) {
      return successResponse(res, "Live sports (stale)", cache.payload);
    }
    return errorResponse(res, error.message, 502);
  }
});

export default router;
