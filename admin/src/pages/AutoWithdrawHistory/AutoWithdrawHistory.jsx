import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Banknote, Loader2, RefreshCw, Search, X } from "lucide-react";

import { api } from "../../api/axios";
import { Pager, UserCell } from "../../components/HistoryBits/HistoryBits";

const fetchWithdrawals = async (status, q, page) => {
  const params = new URLSearchParams({ page: String(page), limit: "20" });

  if (status !== "all") params.set("status", status);
  if (q) params.set("q", q);

  const { data } = await api.get(`/api/auto-withdraw/withdrawals/admin?${params}`);
  return data?.data || { withdrawals: [], summary: {} };
};

const TABS = [
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "COMPLETED", label: "Completed" },
  { key: "REJECTED", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_COLOR = {
  PENDING: "var(--status-pending)",
  PROCESSING: "var(--status-pending)",
  COMPLETED: "var(--status-success)",
  REJECTED: "var(--status-danger)",
};

/**
 * অটো উইথড্রয়ের ইতিহাস।
 *
 * গেটওয়ে নিজেই টাকা পাঠায়; PENDING/PROCESSING মানে এখনো চলছে, COMPLETED
 * এ প্রমাণ ছবি থাকে, REJECTED এ টাকা খেলোয়াড়ের কাছে ফেরত গেছে। কোনো
 * উইথড্র ঝুলে থাকলে অ্যাডমিন হাতে বাতিল করে টাকা ফেরত দিতে পারে।
 */
const AutoWithdrawHistory = () => {
  const [tab, setTab] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState("");

  useEffect(() => {
    let alive = true;

    const timer = setTimeout(() => {
      fetchWithdrawals(tab, search, page)
        .then((data) => {
          if (!alive) return;

          setRows(data.withdrawals || []);
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

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchWithdrawals(tab, search, page);

      setRows(data.withdrawals || []);
      setSummary(data.summary || {});
      setMeta(data.meta || {});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const reject = async (row) => {
    try {
      setActing(row._id);
      const { data } = await api.post(
        `/api/auto-withdraw/withdrawals/${row._id}/reject`,
      );
      toast.success(data?.message || "Rejected");
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action failed");
    } finally {
      setActing("");
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">
            Auto Withdraw History
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Payouts that went through the gateway.
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
        {["PENDING", "PROCESSING", "COMPLETED", "REJECTED"].map((key) => (
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
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Banknote size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">
            Nothing here
          </p>
          <p className="text-[13px] text-[var(--text-muted)]">
            No auto withdraw to show.
          </p>
        </div>
      ) : (
        <div className="ad-card ad-table-wrap ad-scroll p-0">
          <table className="w-full min-w-[960px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {[
                  "Player",
                  "Method",
                  "Wallet",
                  "Amount",
                  "Fee",
                  "Proof",
                  "When",
                  "Status",
                  "Action",
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
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <UserCell user={row.user} userId={row.userIdText} />
                  </td>

                  <td className="px-4 py-3 text-[13px] capitalize text-[var(--neutral100)]">
                    {row.paymentMethod || "—"}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-[var(--text-muted)]">
                    {row.accountNumber || "—"}
                  </td>

                  <td className="px-4 py-3 text-[14px] font-bold text-[var(--neutral100)]">
                    {row.amount}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-[var(--text-muted)]">
                    {row.feeAmount ? `${row.feeAmount} (${row.feePercentage}%)` : "—"}
                  </td>

                  <td className="px-4 py-3">
                    {row.proofImages?.length ? (
                      <div className="flex gap-1">
                        {row.proofImages.slice(0, 3).map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            <img
                              src={url}
                              alt="proof"
                              className="h-9 w-9 rounded-md object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-[var(--text-disabled)]">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-[13px] text-[var(--text-muted)]">
                    {new Date(row.createdAt).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="rounded-full px-2 py-[2px] text-[11px] font-bold"
                      style={{
                        background: `color-mix(in srgb, ${
                          STATUS_COLOR[row.status]
                        }, transparent 88%)`,
                        color: STATUS_COLOR[row.status],
                      }}
                    >
                      {row.status}
                    </span>
                    {row.status === "REJECTED" && row.reason ? (
                      <p className="mt-1 max-w-[160px] text-[11px] text-[var(--text-disabled)]">
                        {row.reason}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-4 py-3">
                    {["PENDING", "PROCESSING"].includes(row.status) ? (
                      <button
                        type="button"
                        onClick={() => reject(row)}
                        disabled={Boolean(acting)}
                        className="ad-btn ad-btn--danger ad-btn--sm"
                        title="Reject & refund"
                      >
                        {acting === row._id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <X size={13} />
                        )}
                      </button>
                    ) : (
                      <span className="text-[12px] text-[var(--text-disabled)]">
                        —
                      </span>
                    )}
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

export default AutoWithdrawHistory;
