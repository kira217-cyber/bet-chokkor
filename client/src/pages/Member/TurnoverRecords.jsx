import React, { useEffect, useState } from "react";

import MemberPage from "../Deposit/MemberPage";
import HistoryList from "./HistoryList";
import { Line, RowHead, StatusPill, Tabs } from "./historyBits";
import { formatDate, money } from "./historyFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchProviderCatalog,
  fetchTurnoverHistory,
} from "../../features/history/historyApi";

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/**
 * একটা টার্নওভারকে প্রোভাইডার অনুযায়ী ভাগ করে দেখায়।
 *
 * প্রতিটা eligible প্রোভাইডারের শতাংশ হলো তার নিজের বাধ্যতামূলক অংশ।
 * সব শতাংশ যোগ করে ১০০ না হলে বাকিটুকু "খোলা" — যেকোনো প্রোভাইডারে
 * খেললেই ভরে। সার্ভারের হিসাব (utils/turnoverProgress.js) এর হুবহু
 * প্রতিচ্ছবি, নইলে পাতায় দেখা অগ্রগতি আর আসল অগ্রগতি মিলত না।
 */
const buildBuckets = (row, providers, openLabel) => {
  const eligible = Array.isArray(row?.eligibleProviders)
    ? row.eligibleProviders
    : [];

  if (!eligible.length) return [];

  const required = Number(row?.required || 0);
  const progressList = Array.isArray(row?.providerProgress)
    ? row.providerProgress
    : [];

  const nameOf = (code) =>
    providers.find(
      (item) => String(item.providerCode).toUpperCase() === code,
    )?.providerName || code;

  const buckets = eligible.map((item) => {
    const code = String(item?.providerCode || "").toUpperCase();
    const percent = Number(item?.percent ?? 100);

    const entry = progressList.find(
      (p) => String(p?.providerCode || "").toUpperCase() === code,
    );

    const quota = round2((required * percent) / 100);

    return {
      key: code,
      name: nameOf(code),
      quota,
      done: round2(Math.min(quota, Number(entry?.progress || 0))),
    };
  });

  const usedPercent = Math.min(
    100,
    eligible.reduce((sum, item) => sum + Number(item?.percent ?? 100), 0),
  );
  const openPercent = Math.max(0, 100 - usedPercent);

  if (openPercent > 0) {
    const dedicated = progressList.reduce(
      (sum, entry) => sum + Number(entry?.progress || 0),
      0,
    );
    const openQuota = round2((required * openPercent) / 100);
    const openDone = round2(Math.max(0, Number(row?.progress || 0) - dedicated));

    buckets.push({
      key: "__open__",
      name: openLabel,
      quota: openQuota,
      done: round2(Math.min(openQuota, openDone)),
    });
  }

  return buckets;
};

/** সরু অগ্রগতির বার */
const Bar = ({ done, quota }) => {
  const percent = quota > 0 ? Math.min(100, (done / quota) * 100) : 100;

  return (
    <div
      className="overflow-hidden bg-[var(--neutral700)]"
      style={{
        height: "calc(var(--u) * 1.067)",
        borderRadius: "var(--radius-70)",
        marginTop: "calc(var(--u) * 1.067)",
      }}
    >
      <div
        className="h-full bg-[var(--primary500)]"
        style={{ width: `${percent}%`, borderRadius: "var(--radius-70)" }}
      />
    </div>
  );
};

/**
 * টার্নওভারের পাতা।
 *
 * বোনাসের টাকা ব্যালেন্সে আগেই ঢোকে, কিন্তু টার্নওভার শেষ না হলে তোলা
 * যায় না — তাই কোন বোনাসের কতটুকু বাকি সেটা এখানে খোলাখুলি দেখানো।
 */
const TurnoverRecords = () => {
  const { t } = useLanguage();

  const [status, setStatus] = useState("");
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

  const tabs = [
    { key: "", label: t("filterAll") },
    { key: "running", label: t("statusRunning") },
    { key: "completed", label: t("statusCompleted") },
  ];

  const sourceLabel = (value) =>
    ({
      deposit: t("sourceDeposit"),
      "auto-deposit": t("sourceAutoDeposit"),
      "register-bonus": t("sourceRegisterBonus"),
      "admin-manual-deposit": t("sourceAdminDeposit"),
    })[value] || value || "—";

  const renderRow = (row) => {
    const buckets = buildBuckets(row, providers, t("anyProvider"));

    return (
      <>
        <RowHead
          title={sourceLabel(row.sourceType)}
          subtitle={formatDate(row.createdAt)}
          right={
            <StatusPill
              status={row.status}
              label={
                row.status === "completed"
                  ? t("statusCompleted")
                  : t("statusRunning")
              }
            />
          }
        />

        <Line label={t("labelRequired")} value={money(row.required)} />
        <Line
          label={t("labelProgress")}
          value={`${money(row.progress)} (${row.percent ?? 0}%)`}
          tone="var(--primary500)"
        />

        <Bar done={Number(row.progress || 0)} quota={Number(row.required || 0)} />

        {row.completedAt ? (
          <Line
            label={t("labelCompletedAt")}
            value={formatDate(row.completedAt)}
          />
        ) : null}

        {buckets.length ? (
          <div
            style={{
              marginTop: "calc(var(--u) * 2.667)",
              paddingTop: "calc(var(--u) * 2.667)",
              borderTop: "1px solid var(--neutral700)",
            }}
          >
            <p
              className="text-[var(--text-muted)]"
              style={{
                fontSize: "var(--fs-small)",
                marginBottom: "calc(var(--u) * 1.6)",
              }}
            >
              {t("providerBreakdown")}
            </p>

            {buckets.map((bucket) => (
              <div
                key={bucket.key}
                style={{ marginBottom: "calc(var(--u) * 1.6)" }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span
                    className="truncate text-[var(--text-secondary)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {bucket.name}
                  </span>

                  <span
                    className="shrink-0 font-semibold text-[var(--text-primary)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {money(bucket.done)} / {money(bucket.quota)}
                  </span>
                </div>

                <Bar done={bucket.done} quota={bucket.quota} />
              </div>
            ))}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <MemberPage title={t("turnoverRecords")}>
      <Tabs tabs={tabs} value={status} onChange={setStatus} />

      <HistoryList
        load={() => fetchTurnoverHistory({ status, limit: 50 })}
        renderRow={renderRow}
        deps={[status, providers]}
      />
    </MemberPage>
  );
};

export default TurnoverRecords;
