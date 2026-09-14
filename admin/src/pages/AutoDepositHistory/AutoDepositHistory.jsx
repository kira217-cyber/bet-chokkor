import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Receipt, RefreshCw, Search } from "lucide-react";

import { api } from "../../api/axios";

const fetchDeposits = async (status, q) => {
  const params = new URLSearchParams();

  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);

  const { data } = await api.get(`/api/auto-deposit/deposits/admin?${params}`);
  return data?.data || { deposits: [], summary: {} };
};

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "PAID", label: "Paid" },
  { key: "FAILED", label: "Failed" },
  { key: "all", label: "All" },
];

const STATUS_COLOR = {
  PENDING: "var(--status-pending)",
  PAID: "var(--status-success)",
  FAILED: "var(--status-danger)",
};

/**
 * অটো ডিপোজিটের ইতিহাস।
 *
 * এখানে কিছু অনুমোদন করার নেই — গেটওয়েই সিদ্ধান্ত নেয়। PENDING মানে
 * ব্যবহারকারী পেমেন্ট শুরু করেছিলেন কিন্তু গেটওয়ে থেকে নিশ্চিতকরণ
 * আসেনি, তাই টাকাও যায়নি।
 */
const AutoDepositHistory = () => {
  const [tab, setTab] = useState("PAID");
  const [search, setSearch] = useState("");
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const timer = setTimeout(() => {
      fetchDeposits(tab, search)
        .then((data) => {
          if (!alive) return;

          setDeposits(data.deposits || []);
          setSummary(data.summary || {});
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
  }, [tab, search]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchDeposits(tab, search);

      setDeposits(data.deposits || []);
      setSummary(data.summary || {});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">
            Auto Deposit History
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Payments that went through the gateway.
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

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {["PENDING", "PAID", "FAILED"].map((key) => (
          <div key={key} className="ad-card py-4">
            <p className="text-[13px] capitalize text-[var(--text-muted)]">
              {key.toLowerCase()}
            </p>
            <p
              className="mt-1 text-[24px] font-black"
              style={{ color: STATUS_COLOR[key] }}
            >
              {summary[key] ?? 0}
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
              }}
              className={`ad-btn ad-btn--sm ${
                tab === item.key ? "ad-btn--primary" : "ad-btn--ghost"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto min-w-[220px] flex-1 sm:flex-none">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
          />
          <input
            value={search}
            onChange={(e) => {
              setLoading(true);
              setSearch(e.target.value);
            }}
            placeholder="Search by username"
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
      ) : deposits.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Receipt size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">
            Nothing here
          </p>
          <p className="text-[13px] text-[var(--text-muted)]">
            No auto deposit to show.
          </p>
        </div>
      ) : (
        <div className="ad-card overflow-x-auto p-0">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {[
                  "Player",
                  "Invoice",
                  "Amount",
                  "Bonus",
                  "Credited",
                  "When",
                  "Status",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-3 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {deposits.map((deposit) => (
                <tr
                  key={deposit._id}
                  className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-[14px] font-semibold text-[var(--neutral100)]">
                    {deposit.user?.userId || deposit.userIdText || "—"}
                  </td>

                  <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">
                    {deposit.invoiceNumber}
                  </td>

                  <td className="px-4 py-3 text-[14px] text-[var(--neutral100)]">
                    {deposit.amount}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-[var(--status-success)]">
                    {deposit.calc?.bonusAmount || 0}
                  </td>

                  <td className="px-4 py-3 text-[14px] font-bold text-[var(--primary500)]">
                    {deposit.calc?.creditedAmount || deposit.amount}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-[var(--text-muted)]">
                    {new Date(deposit.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-[2px] text-[11px] font-bold"
                      style={{
                        background: `color-mix(in srgb, ${
                          STATUS_COLOR[deposit.status]
                        }, transparent 88%)`,
                        color: STATUS_COLOR[deposit.status],
                      }}
                    >
                      {deposit.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AutoDepositHistory;
