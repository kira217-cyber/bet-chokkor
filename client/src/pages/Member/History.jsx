import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  BanknoteArrowDown,
  Gamepad2,
  Inbox,
  Landmark,
  Loader2,
  RotateCcw,
  Wallet,
} from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { Pager, SummaryHead, Tabs } from "./historyBits";
import {
  AutoDepositRow,
  BetRow,
  DepositRow,
  TurnoverRow,
  WithdrawRow,
} from "./historyRows";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchAutoDepositHistory,
  fetchDepositHistory,
  fetchGameHistory,
  fetchProviderCatalog,
  fetchTurnoverHistory,
  fetchWithdrawHistory,
} from "../../features/history/historyApi";

/**
 * ইতিহাসের পাতা — পাঁচটা ট্যাব এক জায়গায়।
 *
 * Bajiman এ এগুলো একটা মডালের পাঁচটা ট্যাব; মূল সাইটে প্রোফাইল মেনু
 * থেকে তিনটে নামে ঢোকা যায় (ট্রানজেকশন / বেটিং / টার্নওভার)। দুটোই
 * রাখা হয়েছে — URL এ কোন ট্যাব সেটা থাকে, কিন্তু ভিতরে পাঁচটা ট্যাবই
 * হাতের কাছে, তাই ডিপোজিট থেকে উইথড্রে যেতে পিছিয়ে আসতে হয় না।
 */

/**
 * `short` ট্যাবের বড়িতে, `long` পাতার শিরোনামে ও সারাংশে।
 *
 * পাঁচটা পুরো নাম ("ডিপোজিট হিস্টোরি"…) ৬১৮px কলামে ধরে না, শেষেরটা
 * কেটে যায়। তাই বড়িতে ছোট নাম, আর কী দেখছি সেটা উপরে পুরো নামে।
 */
const TAB_LIST = [
  { key: "deposit", Icon: Wallet, short: "tabDeposit" },
  { key: "auto-deposit", Icon: Landmark, short: "tabAutoDeposit" },
  { key: "withdraw", Icon: BanknoteArrowDown, short: "tabWithdraw" },
  { key: "bet", Icon: Gamepad2, short: "tabBet" },
  { key: "turnover", Icon: RotateCcw, short: "tabTurnover" },
];

const longLabel = (key) => `tab_${key.replace("-", "_")}`;

const LOADERS = {
  deposit: fetchDepositHistory,
  "auto-deposit": fetchAutoDepositHistory,
  withdraw: fetchWithdrawHistory,
  bet: fetchGameHistory,
  turnover: fetchTurnoverHistory,
};

/** ট্যাব অনুযায়ী ছাঁকনির তালিকা — সার্ভার যে মানগুলো চেনে সেগুলোই */
const FILTERS = {
  deposit: ["", "pending", "approved", "rejected"],
  // অটো ডিপোজিটের স্ট্যাটাস বড় হাতের, বাকিদের ছোট হাতের
  "auto-deposit": ["", "PENDING", "PAID", "FAILED"],
  withdraw: ["", "pending", "approved", "rejected"],
  bet: ["", "win", "loss", "push"],
  turnover: ["", "running", "completed"],
};

const History = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const { tab: tabParam } = useParams();

  const tab = LOADERS[tabParam] ? tabParam : "deposit";

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [providers, setProviders] = useState([]);

  // হাতে থাকা ফলটা এখনকার ট্যাব-ছাঁকনি-পাতার কিনা, সেটাই বলে দেয়
  // লোড চলছে কিনা — আলাদা loading state লাগে না
  const key = `${tab}|${status}|${page}|${reload}`;
  const [result, setResult] = useState({ key: null, rows: [], meta: {} });

  const loading = result.key !== key;

  useEffect(() => {
    let alive = true;

    fetchProviderCatalog()
      .then((list) => alive && setProviders(list))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    LOADERS[tab]({ status, page })
      .then((data) => alive && setResult({ key, ...data }))
      .catch(() => alive && setResult({ key, rows: [], meta: {} }));

    return () => {
      alive = false;
    };
  }, [key, tab, status, page]);

  const changeTab = (next) => {
    setStatus("");
    setPage(1);
    navigate(`/member/history/${next}`, { replace: true });
  };

  const changeStatus = (next) => {
    setStatus(next);
    setPage(1);
  };

  const statusLabel = (value) =>
    ({
      "": t("filterAll"),
      pending: t("statusPending"),
      approved: t("statusApproved"),
      rejected: t("statusRejected"),
      PENDING: t("statusPending"),
      PAID: t("statusPaid"),
      FAILED: t("statusFailed"),
      running: t("statusRunning"),
      completed: t("statusCompleted"),
      win: t("resultWin"),
      loss: t("resultLoss"),
      push: t("resultPush"),
    })[value] || value;

  const sourceLabel = (value) =>
    ({
      deposit: t("sourceDeposit"),
      "auto-deposit": t("sourceAutoDeposit"),
      "register-bonus": t("sourceRegisterBonus"),
      "admin-manual-deposit": t("sourceAdminDeposit"),
    })[value] || value || "—";

  const providerName = (code) => {
    const upper = String(code || "").toUpperCase();
    if (!upper) return "—";

    return (
      providers.find(
        (item) => String(item.providerCode).toUpperCase() === upper,
      )?.providerName || upper
    );
  };

  const tabs = TAB_LIST.map((item) => {
    const TabIcon = item.Icon;

    return {
      key: item.key,
      label: t(item.short),
      icon: <TabIcon size={14} />,
    };
  });

  const filters = FILTERS[tab].map((value) => ({
    key: value,
    label: value ? statusLabel(value) : t("filterAll"),
  }));

  const renderRow = (row) => {
    const shared = { row, t, tv, statusLabel };

    if (tab === "deposit") return <DepositRow {...shared} />;
    if (tab === "auto-deposit") return <AutoDepositRow {...shared} />;
    if (tab === "withdraw") return <WithdrawRow {...shared} />;

    if (tab === "bet") {
      return (
        <BetRow
          row={row}
          t={t}
          providerName={providerName}
          resultLabel={statusLabel}
        />
      );
    }

    return (
      <TurnoverRow
        row={row}
        t={t}
        providers={providers}
        sourceLabel={sourceLabel}
      />
    );
  };

  const active = TAB_LIST.find((item) => item.key === tab);
  const ActiveIcon = active.Icon;

  return (
    <MemberPage title={t(longLabel(tab))} maxWidth="1000px">
      <div className="flex flex-col" style={{ gap: "calc(var(--u) * 3.2)" }}>
        <Tabs tabs={tabs} value={tab} onChange={changeTab} />

        <SummaryHead
          icon={<ActiveIcon size={19} />}
          title={t(longLabel(tab))}
          total={result.meta?.total ?? 0}
          totalLabel={t("labelTotal")}
          onRefresh={() => setReload((prev) => prev + 1)}
          busy={loading}
        />

        <Tabs
          tabs={filters}
          value={status}
          onChange={changeStatus}
          size="small"
        />

        {loading ? (
          <div
            className="flex items-center justify-center text-[var(--text-muted)]"
            style={{
              gap: "calc(var(--u) * 2.133)",
              paddingBlock: "calc(var(--u) * 10.667)",
            }}
          >
            <Loader2 size={18} className="animate-spin" />
            {t("loading")}
          </div>
        ) : !result.rows.length ? (
          <div
            className="flex flex-col items-center text-center"
            style={{
              gap: "calc(var(--u) * 3.2)",
              paddingBlock: "calc(var(--u) * 10.667)",
            }}
          >
            <Inbox size={28} className="text-[var(--text-disabled)]" />
            <p
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {t("nothingYet")}
            </p>
          </div>
        ) : (
          /*
           * ছোট পর্দায় এক কলাম, ল্যাপটপ থেকে দুই।
           *
           * কার্ডগুলো শুধু চওড়া করে টানলে ভিতরের লেখা দুপাশে ছিটকে
           * যেত; পাশাপাশি দুটো বসালে জায়গাটা কাজে লাগে আর এক পর্দায়
           * বেশি সারি দেখা যায়।
           */
          <div
            className="grid grid-cols-1 lg:grid-cols-2"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            {result.rows.map((row) => (
              <div
                key={row._id}
                className="bg-[var(--neutral800)]"
                style={{
                  borderRadius: "var(--radius-10)",
                  padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
                }}
              >
                {renderRow(row)}
              </div>
            ))}
          </div>
        )}

        <Pager
          page={result.meta?.page || 1}
          totalPages={result.meta?.totalPages || 1}
          total={result.meta?.total || 0}
          busy={loading}
          onChange={setPage}
          labels={{
            page: t("labelPage"),
            of: t("labelOf"),
            total: t("labelTotal"),
            prev: t("labelPrev"),
            next: t("next"),
          }}
        />
      </div>
    </MemberPage>
  );
};

export default History;
