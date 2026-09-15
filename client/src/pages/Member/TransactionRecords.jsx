import React, { useState } from "react";

import MemberPage from "../Deposit/MemberPage";
import HistoryList from "./HistoryList";
import { Line, RowHead, StatusPill, Tabs } from "./historyBits";
import { formatDate, money } from "./historyFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchAutoDepositHistory,
  fetchDepositHistory,
  fetchWithdrawHistory,
} from "../../features/history/historyApi";

/**
 * ট্রানজেকশন রেকর্ডস — টাকা ঢোকা ও বেরোনোর সব হিসাব।
 *
 * মূল সাইটে প্রোফাইল মেনুতে ডিপোজিট আর উইথড্র আলাদা নয়, একসাথে এই
 * এক জায়গায়। ভিতরে তিনটে ট্যাব: ম্যানুয়াল ডিপোজিট, অটো ডিপোজিট আর
 * উইথড্র — কারণ তিনটের সারিতে দেখানোর জিনিস আলাদা।
 */
const TransactionRecords = () => {
  const { t, tv } = useLanguage();

  const [tab, setTab] = useState("deposit");
  const [status, setStatus] = useState("");

  const statusLabel = (value) => {
    const map = {
      pending: t("statusPending"),
      approved: t("statusApproved"),
      rejected: t("statusRejected"),
      paid: t("statusPaid"),
      failed: t("statusFailed"),
      PENDING: t("statusPending"),
      PAID: t("statusPaid"),
      FAILED: t("statusFailed"),
    };

    return map[value] || value || "—";
  };

  const tabs = [
    { key: "deposit", label: t("tabDeposit") },
    { key: "auto", label: t("tabAutoDeposit") },
    { key: "withdraw", label: t("tabWithdraw") },
  ];

  // অটো ডিপোজিটের স্ট্যাটাস বড় হাতের (PENDING/PAID/FAILED), বাকিদের
  // ছোট হাতের — তাই ফিল্টারের তালিকাও ট্যাব অনুযায়ী আলাদা
  const statuses =
    tab === "auto"
      ? [
          { key: "", label: t("filterAll") },
          { key: "PENDING", label: t("statusPending") },
          { key: "PAID", label: t("statusPaid") },
          { key: "FAILED", label: t("statusFailed") },
        ]
      : [
          { key: "", label: t("filterAll") },
          { key: "pending", label: t("statusPending") },
          { key: "approved", label: t("statusApproved") },
          { key: "rejected", label: t("statusRejected") },
        ];

  const changeTab = (key) => {
    setTab(key);
    setStatus("");
  };

  /** ম্যানুয়াল ডিপোজিটের এক সারি */
  const depositRow = (row) => {
    const calc = row?.calc || {};
    const display = row?.display || {};

    return (
      <>
        <RowHead
          title={tv(display.methodName) || row.methodId || t("tabDeposit")}
          subtitle={formatDate(row.createdAt)}
          right={
            <StatusPill status={row.status} label={statusLabel(row.status)} />
          }
        />

        <Line label={t("labelAmount")} value={money(row.amount)} />

        {display.channelName ? (
          <Line label={t("labelChannel")} value={tv(display.channelName)} />
        ) : null}

        {Number(calc.totalBonus) > 0 ? (
          <Line
            label={t("labelBonus")}
            value={`+ ${money(calc.totalBonus)}`}
            tone="var(--status-success)"
          />
        ) : null}

        <Line
          label={t("labelCredited")}
          value={money(calc.creditedAmount ?? row.amount)}
        />

        {Number(calc.targetTurnover) > 0 ? (
          <Line label={t("labelTurnover")} value={money(calc.targetTurnover)} />
        ) : null}
      </>
    );
  };

  /** অটো ডিপোজিটের এক সারি */
  const autoRow = (row) => {
    const calc = row?.calc || {};

    return (
      <>
        <RowHead
          title={t("tabAutoDeposit")}
          subtitle={formatDate(row.createdAt)}
          right={
            <StatusPill status={row.status} label={statusLabel(row.status)} />
          }
        />

        <Line label={t("labelAmount")} value={money(row.amount)} />
        <Line label={t("labelInvoice")} value={row.invoiceNumber || "—"} />

        {Number(calc.totalBonus) > 0 ? (
          <Line
            label={t("labelBonus")}
            value={`+ ${money(calc.totalBonus)}`}
            tone="var(--status-success)"
          />
        ) : null}

        {Number(row.balanceAdded) > 0 ? (
          <Line label={t("labelCredited")} value={money(row.balanceAdded)} />
        ) : null}

        {Number(calc.targetTurnover) > 0 ? (
          <Line label={t("labelTurnover")} value={money(calc.targetTurnover)} />
        ) : null}
      </>
    );
  };

  /** উইথড্রের এক সারি */
  const withdrawRow = (row) => {
    const wallet = row?.walletSnapshot || {};

    return (
      <>
        <RowHead
          title={tv(wallet.methodName) || row.methodId || t("tabWithdraw")}
          subtitle={formatDate(row.createdAt)}
          right={
            <StatusPill status={row.status} label={statusLabel(row.status)} />
          }
        />

        <Line
          label={t("labelAmount")}
          value={`- ${money(row.amount)}`}
          tone="var(--status-danger)"
        />

        {wallet.walletNumber ? (
          <Line label={t("labelWallet")} value={wallet.walletNumber} />
        ) : null}

        {row.balanceAfter !== undefined && row.balanceAfter !== null ? (
          <Line
            label={t("labelBalanceAfter")}
            value={money(row.balanceAfter)}
          />
        ) : null}

        {row.adminNote ? (
          <Line label={t("labelAdminNote")} value={row.adminNote} />
        ) : null}
      </>
    );
  };

  const loaders = {
    deposit: () => fetchDepositHistory({ status }),
    auto: () => fetchAutoDepositHistory({ status }),
    withdraw: () => fetchWithdrawHistory({ status }),
  };

  const rows = {
    deposit: depositRow,
    auto: autoRow,
    withdraw: withdrawRow,
  };

  return (
    <MemberPage title={t("transactionRecords")}>
      <Tabs tabs={tabs} value={tab} onChange={changeTab} />

      <Tabs tabs={statuses} value={status} onChange={setStatus} />

      <HistoryList
        load={loaders[tab]}
        renderRow={rows[tab]}
        deps={[tab, status]}
      />
    </MemberPage>
  );
};

export default TransactionRecords;
