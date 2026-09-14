import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Dices, Loader2, RefreshCw, Search } from "lucide-react";

import { api } from "../../api/axios";

const fetchRows = async (result, q, page) => {
  const params = new URLSearchParams({ page: String(page), limit: "20" });

  if (result !== "all") params.set("resultType", result);
  if (q) params.set("q", q);

  const { data } = await api.get(`/api/game-history/admin?${params}`);
  return data?.data || { rows: [], meta: {}, totals: {} };
};

const money = (value) => Number(value || 0).toFixed(2);

const TABS = [
  { key: "all", label: "All" },
  { key: "win", label: "Win" },
  { key: "loss", label: "Loss" },
  { key: "push", label: "Push" },
];

const RESULT_COLOR = {
  win: "var(--status-success)",
  loss: "var(--status-danger)",
  push: "var(--text-muted)",
};

/**
 * খেলার ইতিহাস।
 *
 * প্রতিটা রাউন্ড white-label মাস্টারের কলব্যাক থেকে আসে — বাজি,
 * ফলাফল, আগে-পরে ব্যালেন্স, টার্নওভারে গোনা হলো কিনা আর অ্যাফিলিয়েট
 * কত কমিশন পেলেন।
 */
const GameHistory = () => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const timer = setTimeout(() => {
      fetchRows(tab, search, page)
        .then((data) => {
          if (!alive) return;

          setRows(data.rows || []);
          setMeta(data.meta || {});
          setTotals(data.totals || {});
        })
        .catch((error) =>
          toast.error(error?.response?.data?.message || "Failed to load"),
        )
        .finally(() => alive && setLoading(false));
    }, 300);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [tab, search, page]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchRows(tab, search, page);

      setRows(data.rows || []);
      setMeta(data.meta || {});
      setTotals(data.totals || {});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Game History</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Every round the game platform reports back.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ad-btn ad-btn--ghost ad-btn--sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {[
          ["Rounds", meta.total ?? 0, "var(--text-primary)"],
          ["Total bet", money(totals.bet), "var(--primary500)"],
          ["Total win", money(totals.win), "var(--status-success)"],
          [
            "Player net",
            money(totals.net),
            Number(totals.net) > 0
              ? "var(--status-success)"
              : Number(totals.net) < 0
                ? "var(--status-danger)"
                : "var(--text-muted)",
          ],
        ].map(([label, value, color]) => (
          <div key={label} className="ad-card py-4">
            <p className="text-[13px] text-[var(--text-muted)]">{label}</p>
            <p className="mt-1 text-[22px] font-black" style={{ color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="ad-card mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setLoading(true);
                setTab(item.key);
                setPage(1);
              }}
              className={`ad-btn ad-btn--sm ${
                tab === item.key ? "ad-btn--primary" : "ad-btn--ghost"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[240px] flex-1 sm:flex-none">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
          />
          <input
            value={search}
            onChange={(event) => {
              setLoading(true);
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Username, game id or round"
            style={{ paddingInlineStart: "38px" }}
            className="ad-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Dices size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">
            No rounds yet
          </p>
          <p className="max-w-[460px] text-[13px] text-[var(--text-muted)]">
            Rounds appear here once the game platform starts calling back.
          </p>
        </div>
      ) : (
        <div className="ad-card overflow-x-auto p-0">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {[
                  "When",
                  "Player",
                  "Game",
                  "Provider",
                  "Bet",
                  "Win",
                  "Net",
                  "Balance after",
                  "Turnover",
                  "Commission",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-3 py-3 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>

                  <td className="px-3 py-3 text-[14px] font-semibold text-[var(--neutral100)]">
                    {row.userId}
                  </td>

                  <td className="px-3 py-3 text-[12px] text-[var(--text-secondary)]">
                    {row.gameUId}
                  </td>

                  <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                    {row.providerCode || "—"}
                  </td>

                  <td className="px-3 py-3 text-[13px] text-[var(--text-primary)]">
                    {money(row.betAmount)}
                  </td>

                  <td className="px-3 py-3 text-[13px] text-[var(--text-primary)]">
                    {money(row.winAmount)}
                  </td>

                  <td
                    className="px-3 py-3 text-[13px] font-bold"
                    style={{ color: RESULT_COLOR[row.resultType] }}
                  >
                    {money(row.netAmount)}
                  </td>

                  <td className="px-3 py-3 text-[13px] text-[var(--primary500)]">
                    {money(row.balanceAfter)}
                  </td>

                  <td className="px-3 py-3 text-[12px]">
                    <span
                      style={{
                        color: row.turnoverApplied
                          ? "var(--status-success)"
                          : "var(--text-disabled)",
                      }}
                    >
                      {row.turnoverApplied ? "counted" : "—"}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                    {row.affiliateCommissionType === "none"
                      ? "—"
                      : `${money(row.affiliateCommissionAmount)} (${
                          row.affiliateCommissionType === "game-loss"
                            ? "loss"
                            : "win"
                        })`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => {
              setLoading(true);
              setPage((prev) => prev - 1);
            }}
            className="ad-btn ad-btn--ghost ad-btn--sm"
          >
            Previous
          </button>

          <span className="text-[13px] text-[var(--text-muted)]">
            {meta.page} / {meta.totalPages}
          </span>

          <button
            type="button"
            disabled={page >= meta.totalPages || loading}
            onClick={() => {
              setLoading(true);
              setPage((prev) => prev + 1);
            }}
            className="ad-btn ad-btn--ghost ad-btn--sm"
          >
            Next
          </button>
        </div>
      )}

      <p className="mt-4 text-[12px] text-[var(--text-disabled)]">
        Turnover moves from here — each bet counts towards whatever conditions
        that player has running, with the provider rules each one was created
        with.
      </p>
    </div>
  );
};

export default GameHistory;
