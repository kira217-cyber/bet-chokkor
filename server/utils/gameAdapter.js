/**
 * white-label master এর ডেটা → ক্লায়েন্ট সাইট যে আকারে চায়।
 *
 * পুরো অনুবাদটা এই এক ফাইলেই। ক্লায়েন্টের কম্পোনেন্ট master এর কাঁচা
 * ফিল্ড কখনো দেখে না, তাই master কোনোদিন ফিল্ডের নাম বদলালে শুধু
 * এখানেই হাত দিতে হবে — Home, Categories, Games কিছুই ছুঁতে হবে না।
 *
 * ক্লায়েন্ট যে আকার আশা করে (src/data/gameData.js এর মতোই):
 *   gameCategories: [{ key, name:{bn,en}, icon, activeIcon, vendors:[...] }]
 *   homeProviders:  [{ key, name, icon }]
 *   featuredGames:  [{ key, name, vendor, image }]
 *   events:         [{ key, name, image }]
 */

const text = (value) => String(value ?? "").trim();

/** নাম থেকে URL-এ বসানোর মতো key */
export const slugify = (value, fallback = "") => {
  const slug = text(value)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || text(fallback);
};

/** master একেক জায়গায় একেক ফিল্ডে ছবি দেয় — প্রথম যেটা পাওয়া যায় */
const pickImage = (...candidates) => {
  for (const candidate of candidates) {
    const value = text(candidate);
    if (value) return value;
  }
  return "";
};

/** {bn, en} অথবা সাধারণ string — দুটোই আসতে পারে */
const pickLangText = (value, fallback = "") => {
  if (value && typeof value === "object") {
    const bn = text(value.bn) || text(value.en) || text(fallback);
    const en = text(value.en) || text(value.bn) || text(fallback);
    return { bn, en };
  }

  const single = text(value) || text(fallback);
  return { bn: single, en: single };
};

const isActive = (item) =>
  !item?.status || String(item.status).toLowerCase() === "active";

/* ──────────────────────────────────────────────
   প্রোভাইডার
   ────────────────────────────────────────────── */

const adaptProvider = (provider = {}) => {
  const name = text(provider.providerName) || text(provider.providerCode);

  return {
    key: slugify(provider.providerCode || name, provider._id),
    id: text(provider._id),
    code: text(provider.providerCode),
    name: { bn: name, en: name },
    icon: pickImage(
      provider.providerIconUrl,
      provider.providerIcon,
      provider.iconImageUrl,
      provider.iconImage,
    ),
  };
};

/* ──────────────────────────────────────────────
   ক্যাটাগরি + তার ভেন্ডর
   ────────────────────────────────────────────── */

const adaptCategory = (category = {}, providersByCategory = {}, sports = []) => {
  const categoryId = text(category._id);
  const name = pickLangText(category.categoryName, category.categoryTitle);

  const icon = pickImage(
    category.iconImageUrl,
    category.iconImage,
    category.imageUrl,
  );

  const providers = Array.isArray(providersByCategory[categoryId])
    ? providersByCategory[categoryId]
    : [];

  // Sports ক্যাটাগরি প্রোভাইডার নয়, স্পোর্টস এন্ট্রি দিয়ে ভরে
  const isSports = slugify(name.en) === "sports";

  return {
    key: slugify(name.en, categoryId),
    id: categoryId,
    name,
    title: pickLangText(category.categoryTitle, category.categoryName),
    icon,
    // master আলাদা active আইকন দেয় না — একই ছবি, CSS ই পার্থক্য দেখায়
    activeIcon: icon,
    order: Number(category.order) || 0,
    vendors: isSports
      ? sports.map(adaptSport).filter((item) => item.name.en)
      : providers.filter(isActive).map(adaptProvider),
  };
};

/**
 * স্পোর্টস এন্ট্রি → ভেন্ডর কার্ডের আকার।
 *
 * Sports ক্যাটাগরিতে কোনো প্রোভাইডার থাকে না; white-label এর
 * "Add Sports Game" থেকে আসা এন্ট্রিগুলোই ওখানে কার্ড হয়ে বসে —
 * মূল সাইটেও ক্রিকেট / FB Sports / SV388 এভাবেই দেখায়।
 */
const adaptSport = (sport = {}) => {
  const name = pickLangText(sport.name);

  return {
    key: slugify(name.en, sport._id),
    id: text(sport._id),
    code: text(sport.gameId),
    name,
    icon: pickImage(sport.iconImageUrl, sport.iconImage),
  };
};

/* ──────────────────────────────────────────────
   গেম
   ────────────────────────────────────────────── */

/** hot/popular তালিকার আইটেম ভিতরে আসল গেমটা নিয়ে আসতে পারে */
const innerGame = (item = {}) => item.game || item.oracleGame || {};

export const adaptGame = (item = {}) => {
  const game = innerGame(item);

  const name =
    text(item.gameName) ||
    text(game.gameName) ||
    text(pickLangText(item.gameTitle).en) ||
    text(item.name) ||
    text(game.name);

  const image = pickImage(
    item.customImageUrl,
    item.imageUrl,
    item.image,
    item.oracleImageUrl,
    item.gameIconPath,
    game.imageUrl,
    game.thumbnail,
    game.original,
  );

  const gameId = text(item.gameId) || text(game.gameId) || text(item._id);

  return {
    key: slugify(name, gameId),
    gameId,
    gameUId: text(item.gameUId) || text(game.gameUId) || text(item.gameCode),
    name,
    vendor: text(item.vendorName) || text(item.providerName) || text(game.vendorName),
    image,
    categoryId: text(item.categoryId) || text(game.categoryId),
    providerId: text(item.providerDbId) || text(game.providerDbId),
  };
};

/* ──────────────────────────────────────────────
   পুরো game-data
   ────────────────────────────────────────────── */

/**
 * master এর /client/game-data → ক্লায়েন্টের gameData।
 *
 * `fallback` হলো ক্লায়েন্টের স্ট্যাটিক ডেটা নয় — master যদি কোনো অংশ
 * খালি পাঠায় (যেমন events), তখন সেই অংশটুকু আগের মতোই খালি থাকে।
 */
export const adaptGameData = (payload = {}) => {
  const data = payload?.data || payload || {};

  const categories = Array.isArray(data.categories) ? data.categories : [];
  const providers = Array.isArray(data.providers) ? data.providers : [];
  const providersByCategory = data.providersByCategory || {};

  // master providersByCategory না পাঠালে providers থেকে নিজেরাই বানাই
  const groupedProviders = Object.keys(providersByCategory).length
    ? providersByCategory
    : providers.reduce((acc, provider) => {
        const categoryId = text(provider?.categoryId);
        if (!categoryId) return acc;

        if (!acc[categoryId]) acc[categoryId] = [];
        acc[categoryId].push(provider);
        return acc;
      }, {});

  const sports = (Array.isArray(data.sports) ? data.sports : []).filter(
    (item) => item?.isActive !== false,
  );

  const gameCategories = categories
    .filter(isActive)
    .map((category) => adaptCategory(category, groupedProviders, sports))
    .sort((a, b) => a.order - b.order);

  const homeProviderList = Array.isArray(data.homeProviders)
    ? data.homeProviders
    : providers.filter((provider) => provider?.isHome);

  const homeProviders = homeProviderList.filter(isActive).map((provider) => {
    const adapted = adaptProvider(provider);

    return {
      key: adapted.key,
      name: adapted.name.en,
      icon: adapted.icon,
    };
  });

  // হোম পেজের "ফিচার্ড গেমস" সারি — master এর একটাই তালিকা
  const featuredGames = (
    Array.isArray(data.featuredGames) ? data.featuredGames : []
  )
    .filter(isActive)
    .map(adaptGame)
    .filter((game) => game.name && game.image);

  return {
    gameCategories,
    homeProviders,
    featuredGames,
    // master ইভেন্ট দেয় না — ক্লায়েন্ট নিজের স্ট্যাটিক তালিকাই রাখে
    events: [],
    meta: {
      totalCategories: gameCategories.length,
      totalProviders: providers.length,
      totalSports: sports.length,
      totalGames: Array.isArray(data.games) ? data.games.length : 0,
      totalFeatured: featuredGames.length,
    },
  };
};

/* ──────────────────────────────────────────────
   game-list (এক ক্যাটাগরি/ভেন্ডরের গেম, পেজ করে)
   ────────────────────────────────────────────── */

export const adaptGameList = (payload = {}) => {
  const data = payload?.data || payload || {};

  const rawGames = Array.isArray(data.games)
    ? data.games
    : Array.isArray(data.records)
      ? data.records
      : [];

  const meta = data.meta || data.pageInfo || {};

  return {
    records: rawGames.map(adaptGame).filter((game) => game.name),
    pageInfo: {
      currentPage: Number(meta.currentPage || meta.page) || 1,
      totalPage: Number(meta.totalPages || meta.totalPage) || 1,
      totalRecords: Number(meta.totalRecords || meta.total) || rawGames.length,
      perPageSize: Number(meta.perPageSize || meta.limit) || rawGames.length,
    },
  };
};
