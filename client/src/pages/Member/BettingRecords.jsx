import React, { useEffect, useState } from "react";

import MemberPage from "../Deposit/MemberPage";
import HistoryList from "./HistoryList";
import { Line, RowHead, StatusPill, Tabs } from "./historyBits";
import { formatDate, money } from "./historyFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchGameHistory,
  fetchProviderCatalog,
} from "../../features/history/historyApi";

/**
 * বেটিং রেকর্ডস — প্রতিটা রাউন্ডের হিসাব।
 *
 * মাস্টারের কলব্যাক থেকে যা আসে তাই দেখানো হয়: কত বাজি, কত ফেরত, নেট
 * কত আর তার পরে ব্যালেন্স কত দাঁড়াল। শেষের দুটো থাকায় "টাকা কোথায়
 * গেল" প্রশ্নের উত্তর সারিতেই মেলে।
 *
 * সার্ভার এখানে ফিল্টার নেয় না, তাই জেতা/হারার ছাঁকনিটা ব্রাউজারেই।
 */
const BettingRecords = () => {
  const { t } = useLanguage();

  const [result, setResult] = useState("");
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    let alive = true;

    fetchProviderCatalog()
      .then((list) => alive && setProviders(list))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const providerName = (code) => {
    const key = String(code || "").toUpperCase();
    if (!key) return "—";

    const found = providers.find(
      (item) => String(item.providerCode).toUpperCase() === key,
    );

    return found?.providerName || key;
  };

  const resultLabel = (value) =>
    ({
      win: t("resultWin"),
      loss: t("resultLoss"),
      push: t("resultPush"),
    })[value] || value;

  const tabs = [
    { key: "", label: t("filterAll") },
    { key: "win", label: t("resultWin") },
    { key: "loss", label: t("resultLoss") },
  ];

  const load = async () => {
    const rows = await fetchGameHistory({ limit: 50 });

    if (!result) return rows;

    return rows.filter((row) => row.resultType === result);
  };

  const renderRow = (row) => {
    const net = Number(row.netAmount || 0);

    return (
      <>
        <RowHead
          title={providerName(row.providerCode)}
          subtitle={formatDate(row.createdAt)}
          right={
            <StatusPill
              status={row.resultType}
              label={resultLabel(row.resultType)}
            />
          }
        />

        <Line label={t("labelBet")} value={money(row.betAmount)} />
        <Line label={t("labelWin")} value={money(row.winAmount)} />

        <Line
          label={t("labelNet")}
          value={
            // পুশ হলে চিহ্ন বসে না — "+ ০" লেখাটা জেতার মতো দেখায়
            net === 0 ? money(0) : `${net > 0 ? "+" : "-"} ${money(Math.abs(net))}`
          }
          tone={
            net === 0
              ? "var(--text-primary)"
              : net > 0
                ? "var(--status-success)"
                : "var(--status-danger)"
          }
        />

        <Line label={t("labelBalanceAfter")} value={money(row.balanceAfter)} />
        <Line label={t("labelRound")} value={row.gameRound || "—"} />
      </>
    );
  };

  return (
    <MemberPage title={t("bettingRecords")}>
      <Tabs tabs={tabs} value={result} onChange={setResult} />

      <HistoryList load={load} renderRow={renderRow} deps={[result, providers]} />
    </MemberPage>
  );
};

export default BettingRecords;
