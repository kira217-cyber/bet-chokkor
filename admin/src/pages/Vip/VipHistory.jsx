import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  ArrowUpCircle,
  Coins,
  Crown,
  Gift,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { api } from "../../api/axios";
import {
  HistoryHeader,
  Pager,
  StatCard,
  taka,
  UserCell,
} from "../../components/HistoryBits/HistoryBits";

const TABS = [
  { key: "all", label: "All" },
  { key: "upgrade", label: "Upgrade" },
  { key: "convert", label: "Convert" },
  { key: "bonus", label: "Bonus" },
  { key: "adjust", label: "Adjust" },
];

const TYPE_COLOR = {
  upgrade: "var(--primary500)",
  convert: "var(--status-info)",
  bonus: "var(--status-success)",
  adjust: "var(--status-pending)",
  earn: "var(--text-muted)",
};

const fetchHistory = async (type, q, page) => {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (type !== "all") params.set("type", type);
  if (q) params.set("q", q);
  const { data } = await api.get(`/api/vip/admin/history?${params}`);
  return data?.data || { rows: [], summary: {}, meta: {} };
};

/**
 * VIP ইতিহাস (অ্যাডমিন) — লেভেল আপগ্রেড, পয়েন্ট রূপান্তর, বোনাস ও
 * হাতে করা সমন্বয় — সব এক জায়গায়। ডিজাইন বাকি হিস্ট্রি পেজের মতোই।
 */
const VipHistory = () => {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      fetchHistory(tab, search, page)
        .then((data) => {
          if (!alive) return;
          setRows(data.rows || []);
          setSummary(data.summary || {});
          setMeta(data.meta || {});
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

  const load = () => {
    setLoading(true);
    fetchHistory(tab, search, page)
      .then((data) => {
        setRows(data.rows || []);
        setSummary(data.summary || {});
        setMeta(data.meta || {});
      })
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load"),
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <HistoryHeader
        title="VIP History"
        subtitle="Level upgrades, point conversions, bonuses and admin adjustments."
        Icon={Crown}
        onRefresh={load}
        loading={loading}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Upgrades" amount={summary.upgrade || 0} count={summary.upgrade} color="var(--primary500)" Icon={ArrowUpCircle} />
        <StatCard title="Converted" amount={taka(summary.convertAmount)} count={summary.convert} color="var(--status-info)" Icon={Coins} />
        <StatCard title="Bonus paid" amount={taka(summary.bonusAmount)} count={summary.bonus} color="var(--status-success)" Icon={Gift} />
        <StatCard title="Adjustments" amount={summary.adjust || 0} count={summary.adjust} color="var(--status-pending)" Icon={SlidersHorizontal} />
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
              className={`ad-btn ad-btn--sm ${tab === item.key ? "ad-btn--primary" : "ad-btn--ghost"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" />
          <input
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by username"
            style={{ paddingInlineStart: "38px" }}
            className="ad-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Crown size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">Nothing here</p>
        </div>
      ) : (
        <div className="ad-card ad-table-wrap ad-scroll p-0">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Player", "Type", "Level", "XP", "Points", "Amount", "Note", "When"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <UserCell user={r.user} userId={r.userIdText} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-[2px] text-[11px] font-bold capitalize"
                      style={{
                        background: `color-mix(in srgb, ${TYPE_COLOR[r.type] || "var(--text-muted)"}, transparent 86%)`,
                        color: TYPE_COLOR[r.type] || "var(--text-muted)",
                      }}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[var(--neutral100)]">
                    {r.levelFrom ? `LV${r.levelFrom} → ` : ""}LV{r.levelTo || r.user?.vipLevel || "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[var(--text-secondary)]">
                    {r.xp ? (r.xp > 0 ? `+${r.xp}` : r.xp) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: r.points < 0 ? "var(--status-danger)" : "var(--primary500)" }}>
                    {r.points ? (r.points > 0 ? `+${r.points}` : r.points) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-bold text-[var(--status-success)]">
                    {r.amount ? taka(r.amount) : "—"}
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-[12px] text-[var(--text-muted)]">
                    <span className="line-clamp-2">{r.note || "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager
        page={meta.page || 1}
        totalPages={meta.totalPages || 1}
        busy={loading}
        onChange={(next) => {
          setLoading(true);
          setPage(next);
        }}
      />
    </div>
  );
};

export default VipHistory;
