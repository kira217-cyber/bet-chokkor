import axios from "axios";

import GameApiKeySetting from "../models/GameApiKeySetting.js";

/**
 * খেলা গেমের `gameUId` থেকে প্রোভাইডারের কোড বের করা।
 *
 * টার্নওভারে প্রোভাইডারের শর্ত থাকলে জানতে হয় কোন প্রোভাইডারে খেলা
 * হয়েছে। আমাদের নিজের কাছে শুধু অ্যাডমিনের বাছাই করা গেমগুলো থাকে
 * (hot, featured) — পুরো তালিকা নয়, তাই খেলা গেমটা প্রায়ই সেখানে
 * মেলে না। মাস্টারের `client/game-list` এ পুরো তালিকা আছে আর প্রতিটা
 * গেমের সাথে প্রোভাইডারের কোডও থাকে।
 *
 * তালিকাটা কয়েক হাজার গেমের, তাই প্রতি কলব্যাকে না এনে একবার এনে
 * ক্যাশে রাখা হয়।
 */
const CACHE_TTL_MS = 10 * 60 * 1000;
const FETCH_LIMIT = 100;
const MAX_PAGES = 60;

let cache = { map: new Map(), fetchedAt: 0 };
let inflight = null;

const text = (value) => String(value ?? "").trim();

const masterBaseUrl = () =>
  text(process.env.MASTER_API_URL).replace(/\/+$/, "");

/**
 * গেমের প্রোভাইডার দুইভাবে আসতে পারে।
 *
 * সরাসরি তালিকায় `provider.providerCode`, আর hot/popular এর মোড়কে
 * এক ধাপ নিচে `game.provider.providerCode` — দুটোই দেখা হয়।
 */
const addToMap = (map, games) => {
  (Array.isArray(games) ? games : []).forEach((item) => {
    const uid = text(item?.gameUId || item?.game?.gameUId);
    const code = text(
      item?.provider?.providerCode || item?.game?.provider?.providerCode,
    ).toUpperCase();

    if (uid && code) map.set(uid, code);
  });
};

const fetchCatalog = async () => {
  const setting = await GameApiKeySetting.findOne()
    .sort({ createdAt: -1 })
    .select("+apiKey");

  if (!setting?.apiKey || !setting.isActive || !setting.isVerified) {
    throw new Error("Game API key is not ready");
  }

  const base = masterBaseUrl();

  if (!base) throw new Error("MASTER_API_URL is missing in .env");

  const headers = {
    "x-api-key": setting.apiKey,
    "Content-Type": "application/json",
  };

  const map = new Map();
  let page = 1;
  let totalPages = 1;

  // পাতার সংখ্যায় ছাদ রাখা — মাস্টার ভুল meta দিলে যেন অসীম না ঘোরে
  while (page <= totalPages && page <= MAX_PAGES) {
    const { data } = await axios.get(
      `${base}/api/master/bc-global/client/game-list`,
      { headers, timeout: 20000, params: { page, limit: FETCH_LIMIT } },
    );

    const payload = data?.data || data;

    addToMap(map, payload?.games || payload?.items || payload);

    const meta = payload?.meta || payload?.pagination || {};

    totalPages = Number(meta.totalPages || meta.pages || 1) || 1;
    page += 1;
  }

  return map;
};

const refresh = async () => {
  if (inflight) return inflight;

  inflight = fetchCatalog()
    .then((map) => {
      cache = { map, fetchedAt: Date.now() };
      return map;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};

/**
 * এক গেমের প্রোভাইডার কোড।
 *
 * না পেলে `null` — তখন কলার ধরে নেয় প্রোভাইডার অজানা, আর শর্তওয়ালা
 * টার্নওভারে সেই বাজিটা গোনা হয় না। মাস্টার ধরা না গেলে পুরো কলব্যাক
 * ভেঙে ফেলার চেয়ে এটাই নিরাপদ।
 */
export const resolveProviderCode = async (gameUId) => {
  const uid = text(gameUId);

  if (!uid) return null;

  const fresh = Date.now() - cache.fetchedAt < CACHE_TTL_MS;

  if (fresh && cache.map.has(uid)) return cache.map.get(uid);

  if (!fresh) {
    try {
      const map = await refresh();
      return map.get(uid) || null;
    } catch {
      // পুরোনো ক্যাশ থাকলে সেটাই ভালো, কিছু না থাকার চেয়ে
      return cache.map.get(uid) || null;
    }
  }

  // ক্যাশ তাজা কিন্তু গেমটা নেই — নতুন গেম যোগ হয়ে থাকতে পারে
  try {
    const map = await refresh();
    return map.get(uid) || null;
  } catch {
    return null;
  }
};

/**
 * ক্যাশে থাকলে দাও, না থাকলে খালি — মাস্টারে কল করে না।
 *
 * ইতিহাসে প্রোভাইডারের নামটা থাকলে ভালো, কিন্তু সেটার জন্য প্রতিটা
 * রাউন্ডে পুরো তালিকা টেনে আনা বাড়াবাড়ি। তাই ওখানে এটাই ব্যবহার হয়।
 */
export const peekProviderCode = (gameUId) =>
  cache.map.get(text(gameUId)) || "";

/** পরীক্ষা ও অ্যাডমিন টুলের জন্য */
export const catalogStatus = () => ({
  size: cache.map.size,
  fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt) : null,
});

export const clearCatalogCache = () => {
  cache = { map: new Map(), fetchedAt: 0 };
};
