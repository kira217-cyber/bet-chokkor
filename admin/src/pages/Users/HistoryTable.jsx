import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import { api } from "../../api/axios";

/**
 * বিস্তারিত পেজের একেকটা ইতিহাসের অংশ।
 *
 * প্রতিটা নিজের পাতা নিজে ঘোরায়, তাই একটা ইতিহাস ঘাঁটলে বাকিগুলো
 * আবার লোড হয় না। কোন কলাম কীভাবে দেখাবে সেটা `columns` বলে দেয়।
 */
const HistoryTable = ({ title, userId, path, columns, statuses }) => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({});
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const params = new URLSearchParams({ page: String(page), limit: "10" });

    if (status !== "all") params.set("status", status);

    api
      .get(`/api/admin/manage/${userId}/history/${path}?${params}`)
      .then(({ data }) => {
        if (!alive) return;

        setRows(data?.data?.rows || []);
        setMeta(data?.data?.meta || {});
      })
      .catch((error) =>
        toast.error(error?.response?.data?.message || `Failed to load ${title}`),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [userId, path, page, status, title]);

  return (
    <div className="ad-card mt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {title}
          {meta.total > 0 && (
            <span className="ml-2 text-[13px] font-normal text-[var(--text-muted)]">
              {meta.total}
            </span>
          )}
        </h2>

        {statuses && (
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setLoading(true);
                  setStatus(item.key);
                  setPage(1);
                }}
                className={`ad-btn ad-btn--sm ${
                  status === item.key ? "ad-btn--primary" : "ad-btn--ghost"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
          <Loader2 size={14} className="animate-spin" />
          Loading…
        </p>
      ) : rows.length === 0 ? (
        <p className="text-[13px] text-[var(--text-disabled)]">Nothing yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-white/[0.05] last:border-0"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 text-[13px] text-[var(--text-secondary)]"
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
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
    </div>
  );
};

export default HistoryTable;
