import React, { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { ChevronDown, Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { gameListPage } from "../../data/gameListData";
import { selectGameCategories } from "../../features/globalGame/globalGameSelectors";

/**
 * গেম লিস্ট পেজ — যেকোনো ক্যাটাগরি বা প্রোভাইডারে ক্লিক করলে এখানেই আসে।
 * URL: /games/:category?vendor=<vendorKey>
 *
 * মূল সাইট (/slot?vendor=awcv2_jili) থেকে মাপা:
 *   টুলবার সারি ১৬u উঁচু — আইকন ৫.৩৩u, টাইটেল fs ২০px, তীর-বাটন ৯.০৬৭u
 *   টুল বাটন ৯.০৬৭u বর্গ (bg neutral800, radius --radius-10), ব্যাজ ৫.৩৩u
 *   সার্চ বার ১৩.৩৩u উঁচু · ফিল্টার চিপ ৮u উঁচু, প্যাডিং ০ ২.১৩৩u
 *   গ্রিড gap ২.১৩৩u, কার্ড aspect ১৩৯ / ১৮৪.৯১ (≈৩:৪), ডেস্কটপে ৮ কলাম
 */
const Games = () => {
  const { t, tv } = useLanguage();
  const { category } = useParams();
  const [searchParams] = useSearchParams();

  const categories = useSelector(selectGameCategories);
  const [query, setQuery] = useState("");

  const vendorKey = searchParams.get("vendor") || "";

  const activeCategory =
    categories.find((item) => item.key === category) || categories[0];

  const vendor = activeCategory?.vendors.find((v) => v.key === vendorKey);

  const vendorLabel = vendor ? tv(vendor.name) : gameListPage.vendor.name;

  const games = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return gameListPage.records;
    return gameListPage.records.filter((g) =>
      g.gameName.toLowerCase().includes(text),
    );
  }, [query]);

  const toolButton = (label, children, badge) => (
    <button
      type="button"
      aria-label={label}
      className="relative flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
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

  return (
    <div className="bc-page" style={{ paddingBottom: "calc(var(--u) * 4.267)" }}>
      <div
        className="bc-pad lg:px-0"
        style={{ paddingBlock: "calc(var(--u) * 4.267)" }}
      >
        {/* ── টুলবার ── */}
        <div
          className="flex items-center justify-between"
          style={{ height: "calc(var(--u) * 16)" }}
        >
          <div
            className="flex min-w-0 items-center"
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

            <span
              className="flex shrink-0 items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)]"
              style={{
                height: "calc(var(--u) * 9.067)",
                width: "calc(var(--u) * 9.067)",
                borderRadius: "var(--radius-10)",
              }}
            >
              <ChevronDown size={16} />
            </span>
          </div>

          <div
            className="flex items-center"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {toolButton("filter", <SlidersHorizontal size={16} />, vendor ? 1 : null)}
            {toolButton("sort", <ArrowUpDown size={16} />)}
          </div>
        </div>

        {/* ── সার্চ ── */}
        <div
          className="flex items-center overflow-hidden bg-[var(--form-box-bg)]"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
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

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchGames")}
            className="h-full w-full bg-transparent pe-4 text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
            style={{ fontSize: "var(--fs-larger)" }}
          />
        </div>

        {/* ── ফিল্টার চিপ ── */}
        <div
          className="flex flex-wrap items-center"
          style={{
            gap: "calc(var(--u) * 2.133)",
            paddingBlock: "calc(var(--u) * 2.133)",
          }}
        >
          <span
            className="flex items-center bg-[var(--neutral800)] text-[var(--text-primary)]"
            style={{
              height: "calc(var(--u) * 8)",
              gap: "calc(var(--u) * 1.6)",
              paddingInline: "calc(var(--u) * 2.133)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
            }}
          >
            {vendorLabel}
            <Link to={`/games/${activeCategory?.key || "slot"}`} aria-label="clear filter">
              <X size={14} className="text-[var(--text-muted)]" />
            </Link>
          </span>
        </div>

        {/* ── গেম গ্রিড ── */}
        {games.length ? (
          <div
            className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {games.map((game) => (
              <Link
                key={game.gameId}
                to={`/play-game/${game.gameCode}`}
                className="group relative block overflow-hidden"
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
              </Link>
            ))}
          </div>
        ) : (
          <p
            className="text-center text-[var(--text-muted)]"
            style={{
              fontSize: "var(--fs-larger)",
              paddingBlock: "calc(var(--u) * 13.333)",
            }}
          >
            {t("noGamesFound")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Games;
