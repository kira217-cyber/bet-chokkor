import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { useComingSoon } from "../../Context/comingSoonContext";
import { useGameList } from "../../features/globalGame/useGameList";
import { selectGameCategories } from "../../features/globalGame/globalGameSelectors";

/**
 * গেম লিস্ট পেজ — যেকোনো ক্যাটাগরি বা প্রোভাইডারে ক্লিক করলে এখানেই আসে।
 * URL: /games/:category?vendor=<key>[,<key>...]&sort=<key>
 *
 * মূল সাইট (/casino?vendor=awcv2_evolution) থেকে মাপা:
 *   টুলবার সারি ১৬u উঁচু — আইকন ৫.৩৩u, টাইটেল fs ২০px, তীর-বাটন ৯.০৬৭u
 *   টুল বাটন ৯.০৬৭u বর্গ (bg neutral800, radius --radius-10), ব্যাজ ৫.৩৩u
 *   সার্চ বার ১৩.৩৩u উঁচু · ফিল্টার চিপ ৮u উঁচু, প্যাডিং ০ ২.১৩৩u
 *   গ্রিড gap ২.১৩৩u, কার্ড aspect ১৩৯ / ১৮৪.৯১ (≈৩:৪), ডেস্কটপে ৮ কলাম
 *   "Load more" এর নিচে সোনালি প্রোগ্রেস বার, তারপর গণনার লাইন
 */

const RECENT_KEY = "bc_recent_searches";
const MIN_SEARCH = 3;

const SORTS = [
  { key: "recommend", bn: "সুপারিশ", en: "Recommend" },
  { key: "az", bn: "A - Z", en: "A - Z" },
  { key: "za", bn: "Z - A", en: "Z - A" },
  { key: "new", bn: "নতুন - পুরোনো", en: "New - Old" },
  { key: "old", bn: "পুরোনো - নতুন", en: "Old - New" },
];

const readRecent = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(raw) ? raw.slice(0, 8) : [];
  } catch {
    return [];
  }
};

const writeRecent = (list) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {
    // প্রাইভেট উইন্ডোতে লিখতে না পারলেও সার্চ কাজ করবে
  }
};

const Games = () => {
  const { t, tv } = useLanguage();
  const { openComingSoon } = useComingSoon();
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categories = useSelector(selectGameCategories);

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [recent, setRecent] = useState(readRecent);

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [providersOpen, setProvidersOpen] = useState(true);

  const searchRef = useRef(null);
  const toolbarRef = useRef(null);

  const activeCategory =
    categories.find((item) => item.key === category) || categories[0];

  const vendorKeys = (searchParams.get("vendor") || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const sortKey = searchParams.get("sort") || "recommend";

  // ড্রয়ার খোলার সময়ের বাছাই — Apply চাপলে তবেই URL এ যায়।
  // ড্রয়ার খোলার মুহূর্তে এখনকার বাছাই দিয়ে ভরা হয়, effect এ নয়।
  const [draft, setDraft] = useState(vendorKeys);

  const vendors = activeCategory?.vendors || [];

  const selectedVendors = vendors.filter((item) =>
    vendorKeys.includes(item.key),
  );

  // একটাই প্রোভাইডার বাছাই করলে সার্ভার থেকেই শুধু তার গেম আসে।
  // একাধিক হলে পুরো ক্যাটাগরি এনে নিচে ছেঁকে নেওয়া হয়।
  const singleVendor = selectedVendors.length === 1 ? selectedVendors[0] : null;

  const { records, total, hasMore, loading, loadMore, isLive } = useGameList({
    categoryId: activeCategory?.id,
    providerId: singleVendor?.id,
  });

  const games = useMemo(() => {
    let list = records;

    if (selectedVendors.length > 1) {
      const names = new Set(
        selectedVendors.map((item) => tv(item.name).toLowerCase()),
      );
      list = list.filter((game) =>
        names.has(String(game.vendorName || "").toLowerCase()),
      );
    }

    if (sortKey === "az" || sortKey === "za") {
      list = [...list].sort((a, b) =>
        String(a.gameName || "").localeCompare(String(b.gameName || "")),
      );
      if (sortKey === "za") list.reverse();
    } else if (sortKey === "old") {
      list = [...list].reverse();
    }

    return list;
  }, [records, selectedVendors, sortKey, tv]);

  // সার্চের ফল — মূল গ্রিড নয়, ড্রপডাউনের ভিতরে দেখানো হয়
  const searchText = query.trim().toLowerCase();
  const searching = searchText.length >= MIN_SEARCH;

  const searchResults = useMemo(() => {
    if (!searching) return [];

    return records.filter((game) =>
      String(game.gameName || "").toLowerCase().includes(searchText),
    );
  }, [records, searching, searchText]);

  // বাইরে ক্লিক করলে খোলা মেনুগুলো বন্ধ
  useEffect(() => {
    const onDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setCategoryOpen(false);
        setSortOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = filterOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen]);

  const go = (nextVendors, nextSort = sortKey) => {
    const params = new URLSearchParams();
    if (nextVendors.length) params.set("vendor", nextVendors.join(","));
    if (nextSort && nextSort !== "recommend") params.set("sort", nextSort);

    const qs = params.toString();
    navigate(`/games/${activeCategory?.key || "slot"}${qs ? `?${qs}` : ""}`);
  };

  const rememberSearch = (value) => {
    const text = value.trim();
    if (text.length < MIN_SEARCH) return;

    const next = [text, ...recent.filter((item) => item !== text)];
    setRecent(next);
    writeRecent(next);
  };

  /** এই প্রোভাইডারের কতগুলো গেম এখন হাতে আছে */
  const vendorCount = (item) => {
    const name = tv(item.name).toLowerCase();
    return records.filter(
      (game) => String(game.vendorName || "").toLowerCase() === name,
    ).length;
  };

  const toolButton = (label, children, badge, onClick, active) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`relative flex shrink-0 cursor-pointer items-center justify-center transition-colors ${
        active
          ? "bg-[var(--primary500)] text-[var(--neutral900)]"
          : "bg-[var(--neutral800)] text-[var(--text-primary)] hover:bg-[var(--neutral700)]"
      }`}
      style={{
        height: "calc(var(--u) * 9.067)",
        width: "calc(var(--u) * 9.067)",
        borderRadius: "var(--radius-10)",
      }}
    >
      {children}

      {badge ? (
        <span
          className="absolute flex items-center justify-center rounded-full bg-[var(--status-danger)] font-bold text-[var(--neutral1000)]"
          style={{
            top: "calc(var(--u) * -0.9)",
            right: "calc(var(--u) * -0.9)",
            height: "calc(var(--u) * 5.333)",
            width: "calc(var(--u) * 5.333)",
            fontSize: "var(--fs-normal)",
          }}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );

  const menuPanel = (children, extra = {}) => (
    <div
      className="absolute z-40 flex flex-col bg-[var(--neutral900)]"
      style={{
        top: "calc(100% + var(--u) * 1.6)",
        minWidth: "calc(var(--u) * 42.667)",
        padding: "calc(var(--u) * 1.6)",
        gap: "calc(var(--u) * 1.6)",
        borderRadius: "var(--radius-10)",
        boxShadow: "0 18px 40px rgba(0,0,0,.5)",
        ...extra,
      }}
    >
      {children}
    </div>
  );

  const shown = games.length;
  const totalShown = selectedVendors.length > 1 ? shown : total;
  /** মূল সাইটের মতো সোনালি বার + "কতটির মধ্যে কতটি" */
  const countBar = (count, outOf) => (
    <div
      className="flex flex-col items-center"
      style={{ gap: "calc(var(--u) * 3.2)" }}
    >
      <div
        className="overflow-hidden bg-[var(--neutral800)]"
        style={{
          height: "calc(var(--u) * 0.8)",
          width: "calc(var(--u) * 53.333)",
          maxWidth: "100%",
          borderRadius: "999px",
        }}
      >
        <div
          className="h-full bg-[var(--primary500)] transition-[width] duration-300"
          style={{ width: `${(outOf ? Math.min(1, count / outOf) : 0) * 100}%` }}
        />
      </div>

      <p
        className="text-[var(--text-muted)]"
        style={{ fontSize: "var(--fs-larger)" }}
      >
        {tv({
          bn: `${outOf}টি গেমের মধ্যে ${count}টি`,
          en: `Shown ${count} of ${outOf} games`,
        })}
      </p>
    </div>
  );

  /** গেম কার্ড — মূল গ্রিড আর সার্চ দুই জায়গাতেই */
  const gameCard = (game) => (
    // গেম খেলা এখনো চালু হয়নি — ক্লিকে "শীঘ্রই আসছে" মডাল
    <button
      key={game.gameId}
      type="button"
      onClick={() =>
        openComingSoon({
          name: game.gameName,
          image: game.icon,
          vendor: game.vendorName,
        })
      }
      className="group relative block w-full cursor-pointer overflow-hidden"
      style={{
        aspectRatio: "139 / 184.91",
        borderRadius: "var(--radius-10)",
      }}
    >
      <img
        src={game.icon}
        alt={game.gameName}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        draggable="false"
      />
    </button>
  );

  return (
    <div className="bc-page" style={{ paddingBottom: "calc(var(--u) * 4.267)" }}>
      {/* মূল সাইটে হেডারের নিচে ৪৭px ফাঁকা তারপর টুলবার — মেপে নেওয়া */}
      <div
        className="bc-pad lg:px-0"
        style={{
          paddingTop: "calc(var(--u) * 12.533)",
          paddingBottom: "calc(var(--u) * 4.267)",
        }}
      >
        {/* ── টুলবার ── */}
        <div
          ref={toolbarRef}
          className="relative flex items-center justify-between"
          style={{ height: "calc(var(--u) * 16)" }}
        >
          <div
            className="relative flex min-w-0 items-center"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {activeCategory && (
              <img
                src={activeCategory.activeIcon}
                alt=""
                className="shrink-0 object-contain"
                style={{
                  height: "calc(var(--u) * 5.333)",
                  width: "calc(var(--u) * 5.333)",
                }}
                draggable="false"
              />
            )}

            <h1
              className="truncate font-semibold text-[var(--neutral100)]"
              style={{ fontSize: "calc(var(--u) * 5.333)" }}
            >
              {activeCategory ? tv(activeCategory.name) : ""}
            </h1>

            <button
              type="button"
              aria-label="categories"
              onClick={() => {
                setCategoryOpen((prev) => !prev);
                setSortOpen(false);
              }}
              className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
              style={{
                height: "calc(var(--u) * 9.067)",
                width: "calc(var(--u) * 9.067)",
                borderRadius: "var(--radius-10)",
              }}
            >
              {categoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* ক্যাটাগরি ড্রপডাউন */}
            {categoryOpen &&
              menuPanel(
                // স্পোর্টসের আলাদা গেম লিস্ট পেজ নেই, তাই মূল সাইটের
                // মতোই এই ড্রপডাউনে সেটা দেখানো হয় না
                categories
                  .filter((item) => item.key !== "sports")
                  .map((item) => {
                  const isActive = item.key === activeCategory?.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setCategoryOpen(false);
                        navigate(`/games/${item.key}`);
                      }}
                      className={`flex cursor-pointer items-center transition-colors ${
                        isActive
                          ? "bg-[var(--neutral700)] text-[var(--neutral100)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--neutral800)]"
                      }`}
                      style={{
                        height: "calc(var(--u) * 12.8)",
                        gap: "calc(var(--u) * 2.133)",
                        paddingInline: "calc(var(--u) * 3.2)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                      }}
                    >
                      <img
                        src={item.activeIcon || item.icon}
                        alt=""
                        className="shrink-0 object-contain"
                        style={{
                          height: "calc(var(--u) * 5.333)",
                          width: "calc(var(--u) * 5.333)",
                        }}
                        draggable="false"
                      />
                      {tv(item.name)}
                    </button>
                  );
                  }),
                { left: 0 },
              )}
          </div>

          <div
            className="relative flex items-center"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {toolButton(
              "filter",
              <SlidersHorizontal size={16} />,
              selectedVendors.length || null,
              () => {
                setDraft(vendorKeys);
                setFilterOpen(true);
              },
            )}

            {toolButton(
              "sort",
              <ArrowUpDown size={16} />,
              null,
              () => {
                setSortOpen((prev) => !prev);
                setCategoryOpen(false);
              },
              sortOpen,
            )}

            {/* সর্ট ড্রপডাউন */}
            {sortOpen &&
              menuPanel(
                SORTS.map((item) => {
                  const isActive = item.key === sortKey;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setSortOpen(false);
                        go(vendorKeys, item.key);
                      }}
                      className={`flex cursor-pointer items-center transition-colors ${
                        isActive
                          ? "bg-[var(--neutral700)] text-[var(--neutral100)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--neutral800)]"
                      }`}
                      style={{
                        height: "calc(var(--u) * 12.8)",
                        paddingInline: "calc(var(--u) * 3.2)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                      }}
                    >
                      {tv(item)}
                    </button>
                  );
                }),
                { right: 0 },
              )}
          </div>
        </div>

        {/* ── সার্চ ──
            মূল সাইটে সার্চ বার গ্রিডের চেয়ে দুই পাশে ৮px করে ভিতরে */}
        <div
          ref={searchRef}
          className="relative"
          // মূল সাইটে সার্চ বারের বাঁ দিক গ্রিডের সাথে মেলানো, শুধু
          // ডানে ১৬px কম — কেন্দ্রে বসানো নয়
          style={{ width: "calc(100% - var(--u) * 4.267)" }}
        >
          <div
            className="flex items-center overflow-hidden bg-[var(--form-box-bg)] transition-shadow"
            style={{
              height: "calc(var(--u) * 13.333)",
              borderRadius: "var(--radius-10)",
              boxShadow: searchOpen
                ? "0 0 0 1px var(--primary500)"
                : "none",
            }}
          >
            <span
              className="flex shrink-0 items-center justify-center text-[var(--text-primary)]"
              style={{
                height: "calc(var(--u) * 13.333)",
                width: "calc(var(--u) * 13.333)",
              }}
            >
              <Search size={18} />
            </span>

            {/* type="search" দিলে ব্রাউজার নিজের ক্লিয়ার × বসায় — তখন
                দুটো × দেখা যেত, তাই সাধারণ text */}
            <input
              type="text"
              value={query}
              // ফোকাস থাকা অবস্থায় আবার ক্লিক করলে onFocus চলে না, তাই
              // onClick ও লাগে — নইলে Enter এর পর প্যানেল আর খোলে না
              onFocus={() => setSearchOpen(true)}
              onClick={() => setSearchOpen(true)}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  rememberSearch(query);
                  setSearchOpen(false);
                }
              }}
              placeholder={t("searchGames")}
              className="h-full w-full bg-transparent text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              style={{ fontSize: "var(--fs-larger)" }}
            />

            {query ? (
              <button
                type="button"
                aria-label={t("close")}
                onClick={() => setQuery("")}
                className="flex shrink-0 cursor-pointer items-center justify-center text-[var(--text-muted)] transition-colors hover:text-[var(--neutral100)]"
                style={{
                  height: "calc(var(--u) * 13.333)",
                  width: "calc(var(--u) * 13.333)",
                }}
              >
                <X size={18} />
              </button>
            ) : null}
          </div>

          {/* সার্চ ড্রপডাউন — মূল সাইটের মতো */}
          {searchOpen && (
            <div
              className="absolute z-40 w-full bg-[var(--neutral900)]"
              style={{
                top: "calc(100% + var(--u) * 1.067)",
                padding: "calc(var(--u) * 4.267)",
                borderRadius: "var(--radius-10)",
                boxShadow: "0 18px 40px rgba(0,0,0,.5)",
              }}
            >
              {searching ? (
                // ── ফলাফল ── মূল সাইটে ফল ড্রপডাউনের ভিতরেই দেখায়
                searchResults.length ? (
                  <div
                    className="flex flex-col"
                    style={{ gap: "calc(var(--u) * 5.333)" }}
                  >
                    <div
                      className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8"
                      style={{ gap: "calc(var(--u) * 2.133)" }}
                    >
                      {searchResults.map(gameCard)}
                    </div>

                    {countBar(searchResults.length, searchResults.length)}
                  </div>
                ) : (
                  <p
                    className="text-center text-[var(--text-muted)]"
                    style={{
                      fontSize: "var(--fs-larger)",
                      paddingBlock: "calc(var(--u) * 8)",
                    }}
                  >
                    {t("noGamesFound")}
                  </p>
                )
              ) : (
                <>
              <p
                className="font-semibold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {tv({
                  bn: `সার্চ করতে অন্তত ${MIN_SEARCH} অক্ষর লাগবে।`,
                  en: `Search requires at least ${MIN_SEARCH} characters.`,
                })}
              </p>

              <div
                className="flex items-center justify-between"
                style={{ marginTop: "calc(var(--u) * 4.267)" }}
              >
                <span
                  className="font-semibold text-[var(--neutral100)]"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {t("recentSearches")}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setRecent([]);
                    writeRecent([]);
                  }}
                  className="cursor-pointer text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {t("clearAll")} ({recent.length})
                </button>
              </div>

              {recent.length ? (
                <div
                  className="flex flex-wrap"
                  style={{
                    gap: "calc(var(--u) * 2.133)",
                    marginTop: "calc(var(--u) * 3.2)",
                  }}
                >
                  {recent.map((item) => (
                    <span
                      key={item}
                      className="flex items-center bg-[var(--neutral800)] text-[var(--text-primary)]"
                      style={{
                        height: "calc(var(--u) * 8)",
                        gap: "calc(var(--u) * 1.6)",
                        paddingInline: "calc(var(--u) * 2.133)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setQuery(item)}
                        className="cursor-pointer"
                      >
                        {item}
                      </button>

                      <button
                        type="button"
                        aria-label={t("close")}
                        onClick={() => {
                          const next = recent.filter((one) => one !== item);
                          setRecent(next);
                          writeRecent(next);
                        }}
                        className="cursor-pointer"
                      >
                        <X size={14} className="text-[var(--text-muted)]" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── বাছাই করা প্রোভাইডারের চিপ ── */}
        {selectedVendors.length ? (
          <div
            className="flex flex-wrap items-center"
            style={{
              gap: "calc(var(--u) * 2.133)",
              paddingBlock: "calc(var(--u) * 2.133)",
            }}
          >
            {selectedVendors.map((item) => (
              <span
                key={item.key}
                className="flex items-center bg-[var(--neutral800)] text-[var(--text-primary)]"
                style={{
                  height: "calc(var(--u) * 8)",
                  gap: "calc(var(--u) * 1.6)",
                  paddingInline: "calc(var(--u) * 2.133)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                {tv(item.name)}

                <button
                  type="button"
                  aria-label={t("close")}
                  onClick={() =>
                    go(vendorKeys.filter((key) => key !== item.key))
                  }
                  className="cursor-pointer"
                >
                  <X size={14} className="text-[var(--text-muted)]" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div style={{ height: "calc(var(--u) * 2.133)" }} />
        )}

        {/* ── গেম গ্রিড ── */}
        {games.length ? (
          <div
            className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {games.map(gameCard)}
          </div>
        ) : (
          <p
            className="text-center text-[var(--text-muted)]"
            style={{
              fontSize: "var(--fs-larger)",
              paddingBlock: "calc(var(--u) * 13.333)",
            }}
          >
            {loading ? t("loading") : t("noGamesFound")}
          </p>
        )}

        {/* ── আরও লোড + প্রোগ্রেস + গণনা ── */}
        {games.length ? (
          <div
            className="flex flex-col items-center"
            style={{
              gap: "calc(var(--u) * 3.2)",
              paddingBlock: "calc(var(--u) * 6.4)",
            }}
          >
            {hasMore && isLive ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="cursor-pointer bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  height: "calc(var(--u) * 11.733)",
                  paddingInline: "calc(var(--u) * 8.533)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                {loading ? t("loading") : t("loadMore")}
              </button>
            ) : null}

            {countBar(shown, totalShown)}
          </div>
        ) : null}
      </div>

      {/* ── ফিল্টার ড্রয়ার ── */}
      <div
        className="fixed inset-0 z-[120] bg-black/60 transition-opacity duration-200"
        onClick={() => setFilterOpen(false)}
        style={{
          opacity: filterOpen ? 1 : 0,
          visibility: filterOpen ? "visible" : "hidden",
          pointerEvents: filterOpen ? "auto" : "none",
        }}
      />

      <aside
        className="fixed inset-y-0 end-0 z-[121] flex flex-col bg-[var(--neutral900)] transition-transform duration-300"
        style={{
          width: "calc(var(--u) * 88)",
          maxWidth: "88vw",
          transform: filterOpen ? "translateX(0)" : "translateX(110%)",
        }}
      >
        <div
          className="flex shrink-0 items-center justify-between"
          style={{
            height: "calc(var(--u) * 16)",
            paddingInline: "calc(var(--u) * 4.267)",
          }}
        >
          <span
            className="font-semibold text-[var(--neutral100)]"
            style={{ fontSize: "calc(var(--u) * 5.333)" }}
          >
            {t("filter")}
          </span>

          <button
            type="button"
            aria-label={t("close")}
            onClick={() => setFilterOpen(false)}
            className="cursor-pointer text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{ padding: "calc(var(--u) * 4.267)", paddingTop: 0 }}
        >
          <div
            className="bg-[var(--neutral800)]"
            style={{
              borderRadius: "var(--radius-10)",
              padding: "calc(var(--u) * 2.133)",
            }}
          >
            <button
              type="button"
              onClick={() => setProvidersOpen((prev) => !prev)}
              className="flex w-full cursor-pointer items-center justify-between text-[var(--neutral100)]"
              style={{
                height: "calc(var(--u) * 10.667)",
                paddingInline: "calc(var(--u) * 2.133)",
                fontSize: "var(--fs-larger)",
              }}
            >
              {t("providers")}
              {providersOpen ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {providersOpen && (
              <div className="flex flex-col">
                {vendors.map((item) => {
                  const checked = draft.includes(item.key);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() =>
                        setDraft((prev) =>
                          prev.includes(item.key)
                            ? prev.filter((key) => key !== item.key)
                            : [...prev, item.key],
                        )
                      }
                      className="flex cursor-pointer items-center text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
                      style={{
                        height: "calc(var(--u) * 11.733)",
                        gap: "calc(var(--u) * 2.667)",
                        paddingInline: "calc(var(--u) * 2.133)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                      }}
                    >
                      <span
                        className="flex shrink-0 items-center justify-center"
                        style={{
                          height: "calc(var(--u) * 5.333)",
                          width: "calc(var(--u) * 5.333)",
                          borderRadius: "calc(var(--u) * 1.067)",
                          background: checked
                            ? "var(--primary500)"
                            : "var(--neutral700)",
                          color: "var(--neutral900)",
                        }}
                      >
                        {checked ? <Check size={13} strokeWidth={3} /> : null}
                      </span>

                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt=""
                          className="shrink-0 object-contain"
                          style={{
                            height: "calc(var(--u) * 5.333)",
                            width: "calc(var(--u) * 5.333)",
                          }}
                          draggable="false"
                        />
                      ) : null}

                      <span className="truncate">{tv(item.name)}</span>

                      <span
                        className="ms-auto shrink-0 text-[var(--text-muted)]"
                        style={{ fontSize: "var(--fs-larger)" }}
                      >
                        {vendorCount(item)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className="flex shrink-0 items-center"
          style={{
            gap: "calc(var(--u) * 2.667)",
            padding: "calc(var(--u) * 4.267)",
          }}
        >
          <button
            type="button"
            onClick={() => setDraft([])}
            className="flex-1 cursor-pointer bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
            style={{
              height: "calc(var(--u) * 11.733)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
            }}
          >
            {t("clearAll")}
          </button>

          <button
            type="button"
            onClick={() => {
              setFilterOpen(false);
              go(draft);
            }}
            className="flex-1 cursor-pointer bg-[var(--primary500)] font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-[1.06]"
            style={{
              height: "calc(var(--u) * 11.733)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
            }}
          >
            {t("applyFilters")}
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Games;
