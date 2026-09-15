import React, { useEffect, useState } from "react";
import { Search, Users, X } from "lucide-react";

import {
  Card,
  Empty,
  Loading,
  Pager,
  Stat,
  TableWrap,
} from "../../components/Panel/Panel";
import { money, when } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchMyUsers } from "../../features/affiliate/affiliateApi";

const FILTERS = [
  { key: "all", label: "filterAll" },
  { key: "active", label: "statusActive" },
  { key: "inactive", label: "statusInactive" },
];

/**
 * নিজের আনা খেলোয়াড়েরা।
 *
 * শুধু নামের তালিকা নয় — কে কত জমা দিয়েছেন আর কত খেলেছেন সেটাও, কারণ
 * কমিশন ওখান থেকেই আসে। নাম দেখে কে সক্রিয় বোঝা যায় না।
 */
const MyUsers = () => {
  const { t } = useLanguage();

  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ rows: [], summary: {}, meta: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchMyUsers({ page, q: query, status: status === "all" ? "" : status })
      .then((next) => alive && setData(next))
      .catch(() => alive && setData({ rows: [], summary: {}, meta: {} }))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [page, query, status]);

  const search = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(term.trim());
  };

  const clear = () => {
    setTerm("");
    setQuery("");
    setStatus("all");
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t("statTotalPlayers")} value={data.summary.count ?? 0} Icon={Users} />
        <Stat
          label={t("statPlayerDeposit")}
          value={money(data.summary.deposit)}
          tone="var(--primary500)"
        />
        <Stat
          label={t("statTurnover")}
          value={money(data.summary.turnover)}
          tone="var(--status-success)"
        />
      </div>

      <Card title={t("navMyUsers")} subtitle={t("myUsersText")}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
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

          <form onSubmit={search} className="ms-auto flex min-w-[220px] flex-1 gap-2 sm:flex-none">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]"
              />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t("searchPlayer")}
                className="h-9 w-full rounded-[10px] bg-[var(--neutral800)] ps-9 pe-3 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              />
            </div>

            {query || status !== "all" ? (
              <button
                type="button"
                onClick={clear}
                aria-label={t("close")}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-white/[0.07] text-[var(--text-muted)]"
              >
                <X size={14} />
              </button>
            ) : null}
          </form>
        </div>

        {loading ? (
          <Loading label={t("loading")} />
        ) : data.rows.length === 0 ? (
          <Empty label={t("noPlayersYet")} Icon={Users} />
        ) : (
          <TableWrap minWidth={720}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["thPlayer", "thJoined", "thDeposit", "thTurnover", "thLastLogin", "thStatus"].map(
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
                {data.rows.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="px-3 py-3">
                      <p className="text-[14px] font-semibold text-[var(--text-primary)]">
                        {row.userId}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">
                        {row.phone}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                      {when(row.createdAt)}
                    </td>

                    <td className="px-3 py-3 text-[14px] text-[var(--primary500)]">
                      {money(row.totalDeposit)}
                    </td>

                    <td className="px-3 py-3 text-[14px] text-[var(--text-primary)]">
                      {money(row.totalTurnover)}
                    </td>

                    <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                      {row.lastLoginAt ? when(row.lastLoginAt) : "—"}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className="text-[12px] font-bold"
                        style={{
                          color: row.isActive
                            ? "var(--status-success)"
                            : "var(--text-disabled)",
                        }}
                      >
                        {t(row.isActive ? "statusActive" : "statusInactive")}
                      </span>
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
    </div>
  );
};

export default MyUsers;
