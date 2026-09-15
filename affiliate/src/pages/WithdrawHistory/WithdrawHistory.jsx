import React, { useEffect, useState } from "react";
import { Receipt } from "lucide-react";

import {
  Card,
  Empty,
  Loading,
  Pager,
  TableWrap,
} from "../../components/Panel/Panel";
import { money, when } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchMyWithdraws } from "../../features/affiliate/affiliateApi";

const FILTERS = [
  { key: "all", label: "filterAll" },
  { key: "pending", label: "statusPending" },
  { key: "approved", label: "statusApproved" },
  { key: "rejected", label: "statusRejected" },
];

const TONE = {
  pending: "var(--status-pending)",
  approved: "var(--status-success)",
  rejected: "var(--status-danger)",
};

/** নিজের তোলা টাকার ইতিহাস */
const WithdrawHistory = () => {
  const { t, tv } = useLanguage();

  /**
   * ঘরের নামটা আবেদনের সাথেই তুলে রাখা আছে।
   *
   * অ্যাডমিন পরে উপায়টা বদলে ফেললেও পুরোনো আবেদনে যা চাওয়া হয়েছিল
   * সেই নামই দেখা যায়।
   */
  const labelOf = (row, key) => {
    const field = (row.methodSnapshot?.fields || []).find((f) => f.key === key);
    return field ? tv(field.label) : key;
  };

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ requests: [], meta: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchMyWithdraws({ page, status: status === "all" ? "" : status })
      .then((next) => alive && setData(next))
      .catch(() => alive && setData({ requests: [], meta: {} }))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [page, status]);

  return (
    <Card title={t("navWithdrawHistory")} subtitle={t("withdrawHistoryText")}>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => {
              setStatus(item.key);
              setPage(1);
            }}
            className="h-9 cursor-pointer rounded-[10px] px-3 text-[13px] transition"
            style={{
              background:
                status === item.key ? "var(--primary500)" : "var(--neutral800)",
              color:
                status === item.key
                  ? "var(--neutral1000)"
                  : "var(--text-secondary)",
              fontWeight: status === item.key ? 700 : 400,
            }}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading label={t("loading")} />
      ) : data.requests.length === 0 ? (
        <Empty label={t("noWithdrawYet")} Icon={Receipt} />
      ) : (
        <TableWrap minWidth={760}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["thWhen", "thMethod", "thDetails", "thAmount", "thAfter", "thStatus"].map(
                  (key) => (
                    <th
                      key={key}
                      className="px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                    >
                      {t(key)}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {data.requests.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-white/[0.05] last:border-0"
                >
                  <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                    {when(row.createdAt)}
                  </td>

                  <td className="px-3 py-3 text-[13px] text-[var(--text-secondary)]">
                    {tv(row.methodSnapshot?.name) || row.methodId}
                  </td>

                  {/* অ্যাডমিনের চাওয়া ঘরগুলো যেভাবে ভরা হয়েছিল */}
                  <td className="max-w-[240px] px-3 py-3 text-[12px] text-[var(--text-primary)]">
                    {Object.entries(row.fields || {}).length === 0
                      ? "—"
                      : Object.entries(row.fields).map(([key, value]) => (
                          <span key={key} className="block truncate">
                            {labelOf(row, key)}: {value}
                          </span>
                        ))}
                  </td>

                  <td className="px-3 py-3 text-[14px] font-bold text-[var(--primary500)]">
                    {money(row.amount)}
                  </td>

                  <td className="px-3 py-3 text-[13px] text-[var(--text-muted)]">
                    {money(row.balanceAfter)}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className="text-[12px] font-bold uppercase"
                      style={{ color: TONE[row.status] }}
                    >
                      {row.status}
                    </span>

                    {row.adminNote ? (
                      <p className="mt-0.5 text-[11px] text-[var(--text-disabled)]">
                        {row.adminNote}
                      </p>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}

      <Pager
        page={data.meta.page || 1}
        totalPages={data.meta.totalPages || 1}
        busy={loading}
        onChange={setPage}
        labels={{ prev: t("labelPrev"), next: t("labelNext") }}
      />
    </Card>
  );
};

export default WithdrawHistory;
