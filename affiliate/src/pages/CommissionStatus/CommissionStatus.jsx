import React, { useEffect, useState } from "react";
import { Dices, Percent, Wallet } from "lucide-react";

import {
  Card,
  Empty,
  Loading,
  Pager,
  Row,
  Stat,
  TableWrap,
} from "../../components/Panel/Panel";
import { money, when } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchCommissionHistory,
  fetchCommissionStatus,
} from "../../features/affiliate/affiliateApi";

const TYPES = [
  { key: "all", label: "filterAll" },
  { key: "game-loss", label: "cmGameLoss" },
  { key: "game-win", label: "cmGameWin" },
];

/**
 * কমিশনের হার, জমা আর কোথা থেকে এল।
 *
 * শুধু একটা যোগফল দেখালে বিশ্বাস করতে হতো; নিচের তালিকায় কোন খেলোয়াড়ের
 * কোন রাউন্ড থেকে কত এসেছে সেটাও থাকে।
 */
const CommissionStatus = () => {
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState({ rows: [], meta: {} });
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchCommissionStatus()
      .then((next) => alive && setData(next))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    fetchCommissionHistory({ page, type: type === "all" ? "" : type })
      .then((next) => alive && setHistory(next))
      .catch(() => alive && setHistory({ rows: [], meta: {} }))
      .finally(() => alive && setLoadingHistory(false));

    return () => {
      alive = false;
    };
  }, [page, type]);

  if (loading) return <Loading label={t("loading")} />;
  if (!data) return <Card>{t("somethingWrong")}</Card>;

  const { commission } = data;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={t("mainBalance")}
          value={money(data.balance)}
          sub={t("mainBalanceText")}
          tone="var(--primary500)"
          Icon={Wallet}
        />
        <Stat
          label={t("cmGross")}
          value={money(commission.gross)}
          sub={t("cmGrossText")}
          Icon={Percent}
        />
        <Stat
          label={t("cmNet")}
          value={money(commission.net)}
          sub={Number(commission.net) >= 0 ? t("statPayable") : t("statOwed")}
          tone={
            Number(commission.net) >= 0
              ? "var(--status-success)"
              : "var(--status-danger)"
          }
          Icon={Dices}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("commissionRates")} subtitle={t("commissionRatesText")}>
          <Row label={t("cmRefer")} value={`${commission.rates.refer}`} />
          <Row label={t("cmDeposit")} value={`${commission.rates.deposit}%`} />
          <Row label={t("cmGameLoss")} value={`${commission.rates.gameLoss}%`} />
          <Row label={t("cmGameWin")} value={`${commission.rates.gameWin}%`} />
        </Card>

        <Card title={t("commissionBalances")} subtitle={t("commissionBalancesText")}>
          <Row label={t("cmRefer")} value={money(commission.balances.refer)} />
          <Row label={t("cmDeposit")} value={money(commission.balances.deposit)} />
          <Row
            label={t("cmGameLoss")}
            value={money(commission.balances.gameLoss)}
            tone="var(--status-success)"
          />
          <Row
            label={t("cmGameWin")}
            value={`- ${money(commission.balances.gameWin)}`}
            tone="var(--status-danger)"
          />
          <Row
            label={t("cmNet")}
            value={money(commission.net)}
            tone={
              Number(commission.net) >= 0
                ? "var(--status-success)"
                : "var(--status-danger)"
            }
          />
        </Card>
      </div>

      <Card title={t("commissionHistory")} subtitle={t("commissionHistoryText")}>
        <div className="mb-4 flex flex-wrap gap-2">
          {TYPES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setType(item.key);
                setPage(1);
              }}
              className="h-9 cursor-pointer rounded-[10px] px-3 text-[13px] transition"
              style={{
                background:
                  type === item.key ? "var(--primary500)" : "var(--neutral800)",
                color:
                  type === item.key
                    ? "var(--neutral1000)"
                    : "var(--text-secondary)",
                fontWeight: type === item.key ? 700 : 400,
              }}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        {loadingHistory ? (
          <Loading label={t("loading")} />
        ) : history.rows.length === 0 ? (
          <Empty label={t("noCommissionYet")} Icon={Percent} />
        ) : (
          <TableWrap minWidth={820}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["thWhen", "thPlayer", "thGame", "thBet", "thResult", "thCommission"].map(
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
                {history.rows.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-white/[0.05] last:border-0"
                  >
                    <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                      {when(row.createdAt)}
                    </td>

                    <td className="px-3 py-3 text-[14px] font-semibold text-[var(--text-primary)]">
                      {row.userId}
                    </td>

                    <td className="max-w-[190px] px-3 py-3">
                      <p className="truncate text-[13px] text-[var(--text-secondary)]">
                        {row.gameName || "—"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[var(--text-disabled)]">
                        {row.providerCode || "—"}
                      </p>
                    </td>

                    <td className="px-3 py-3 text-[13px] text-[var(--text-primary)]">
                      {money(row.betAmount)}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className="text-[12px] font-bold uppercase"
                        style={{
                          color:
                            row.resultType === "win"
                              ? "var(--status-success)"
                              : row.resultType === "loss"
                                ? "var(--status-danger)"
                                : "var(--text-muted)",
                        }}
                      >
                        {row.resultType}
                      </span>
                    </td>

                    <td
                      className="px-3 py-3 text-[13px] font-bold"
                      style={{
                        color:
                          row.affiliateCommissionType === "game-loss"
                            ? "var(--status-success)"
                            : "var(--status-danger)",
                      }}
                    >
                      {row.affiliateCommissionType === "game-loss" ? "+" : "-"}
                      {money(row.affiliateCommissionAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}

        <Pager
          page={history.meta.page || 1}
          totalPages={history.meta.totalPages || 1}
          busy={loadingHistory}
          onChange={setPage}
          labels={{ prev: t("labelPrev"), next: t("labelNext") }}
        />
      </Card>

      <Card>
        <p className="text-[13px] text-[var(--text-muted)]">
          {t("commissionSettleNote")}
        </p>
      </Card>
    </div>
  );
};

export default CommissionStatus;
