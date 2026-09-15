import React from "react";
import {
  BadgeCheck,
  Banknote,
  Coins,
  Gamepad2,
  Gift,
  Hash,
  Landmark,
  Receipt,
  Repeat,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

import {
  CardFoot,
  CardHead,
  StatBox,
  StatGrid,
  StatusPill,
} from "./historyBits";
import { buildBuckets } from "./turnoverBuckets";
import { formatDate, money } from "./historyFormat";

/**
 * পাঁচ রকম ইতিহাসের কার্ড।
 *
 * প্রতিটাই Bajiman এর মডালের সাজ ধরে: উপরে কী জিনিস আর কী অবস্থায়
 * আছে, মাঝে চারটে ঘরে টাকার হিসাব, নিচে তারিখ। ঘরগুলো সবচেয়ে বেশি
 * যেটা জানতে চাওয়া হয় সেটাই আগে দেখায় — ডিপোজিটে কত দিলাম আর কত
 * পেলাম, বেটে কত হারলাম-জিতলাম।
 */

const ICON = 13;

/* ── ম্যানুয়াল ডিপোজিট ── */
export const DepositRow = ({ row, t, tv, statusLabel }) => {
  const calc = row?.calc || {};
  const display = row?.display || {};
  const fields = row?.fields || {};

  const transaction =
    fields.transactionId ||
    fields.trxId ||
    fields.reference ||
    fields.senderNumber ||
    "";

  return (
    <>
      <CardHead
        title={tv(display.methodName) || row.methodId || t("tabDeposit")}
        lines={[
          display.channelName ? `${t("labelChannel")}: ${tv(display.channelName)}` : "",
          transaction ? `${t("labelTransaction")}: ${transaction}` : "",
        ]}
        right={<StatusPill status={row.status} label={statusLabel(row.status)} />}
      />

      <StatGrid>
        <StatBox
          icon={<Wallet size={ICON} />}
          label={t("labelAmount")}
          value={money(row.amount)}
        />
        <StatBox
          icon={<Gift size={ICON} />}
          label={t("labelBonus")}
          value={money(calc.totalBonus)}
          tone={
            Number(calc.totalBonus) > 0
              ? "var(--status-success)"
              : "var(--text-primary)"
          }
        />
        <StatBox
          icon={<Coins size={ICON} />}
          label={t("labelCredited")}
          value={money(calc.creditedAmount ?? row.amount)}
          tone="var(--primary500)"
        />
        <StatBox
          icon={<Repeat size={ICON} />}
          label={t("labelTurnover")}
          value={`x${calc.turnoverMultiplier ?? 1}`}
        />
      </StatGrid>

      <CardFoot>
        {t("labelDate")}: {formatDate(row.createdAt)}
      </CardFoot>
    </>
  );
};

/* ── অটো ডিপোজিট ── */
export const AutoDepositRow = ({ row, t, statusLabel }) => {
  const calc = row?.calc || {};

  return (
    <>
      <CardHead
        title={t("tabAutoDeposit")}
        lines={[
          row.invoiceNumber ? `${t("labelInvoice")}: ${row.invoiceNumber}` : "",
          row.selectedBonus?.title
            ? `${t("labelBonus")}: ${row.selectedBonus.title}`
            : "",
        ]}
        right={<StatusPill status={row.status} label={statusLabel(row.status)} />}
      />

      <StatGrid>
        <StatBox
          icon={<Wallet size={ICON} />}
          label={t("labelAmount")}
          value={money(row.amount)}
        />
        <StatBox
          icon={<Gift size={ICON} />}
          label={t("labelBonus")}
          value={money(calc.totalBonus)}
          tone={
            Number(calc.totalBonus) > 0
              ? "var(--status-success)"
              : "var(--text-primary)"
          }
        />
        <StatBox
          icon={<Coins size={ICON} />}
          label={t("labelCredited")}
          value={money(row.balanceAdded)}
          tone="var(--primary500)"
        />
        <StatBox
          icon={<Repeat size={ICON} />}
          label={t("labelTurnover")}
          value={`x${calc.turnoverMultiplier ?? 1}`}
        />
      </StatGrid>

      <CardFoot>
        {t("labelDate")}: {formatDate(row.createdAt)}
      </CardFoot>
    </>
  );
};

/* ── উইথড্র ── */
export const WithdrawRow = ({ row, t, tv, statusLabel }) => {
  const wallet = row?.walletSnapshot || {};

  return (
    <>
      <CardHead
        title={tv(wallet.methodName) || row.methodId || t("tabWithdraw")}
        lines={[
          wallet.walletNumber ? `${t("labelWallet")}: ${wallet.walletNumber}` : "",
          row.adminNote ? `${t("labelAdminNote")}: ${row.adminNote}` : "",
        ]}
        right={<StatusPill status={row.status} label={statusLabel(row.status)} />}
      />

      <StatGrid>
        <StatBox
          icon={<Banknote size={ICON} />}
          label={t("labelAmount")}
          value={money(row.amount)}
          tone="var(--status-danger)"
        />
        <StatBox
          icon={<Landmark size={ICON} />}
          label={t("labelMethod")}
          value={wallet.walletType || row.methodId || "—"}
        />
        <StatBox
          icon={<Wallet size={ICON} />}
          label={t("labelBalanceBefore")}
          value={money(row.balanceBefore)}
        />
        <StatBox
          icon={<Coins size={ICON} />}
          label={t("labelBalanceAfter")}
          value={money(row.balanceAfter)}
          tone="var(--primary500)"
        />
      </StatGrid>

      <CardFoot>
        {t("labelDate")}: {formatDate(row.createdAt)}
      </CardFoot>
    </>
  );
};

/* ── বেট ── */
export const BetRow = ({ row, t, providerName, resultLabel }) => {
  const net = Number(row.netAmount || 0);

  return (
    <>
      <CardHead
        title={row.gameName || row.gameUId || "—"}
        lines={[
          `${t("labelProvider")}: ${providerName(row.providerCode)}`,
          `${t("labelRound")}: ${row.gameRound || "—"}`,
        ]}
        right={
          <StatusPill
            status={row.resultType}
            label={resultLabel(row.resultType)}
          />
        }
      />

      <StatGrid>
        <StatBox
          icon={<Wallet size={ICON} />}
          label={t("labelBet")}
          value={money(row.betAmount)}
        />
        <StatBox
          icon={<TrendingUp size={ICON} />}
          label={t("labelWin")}
          value={money(row.winAmount)}
          tone={
            Number(row.winAmount) > 0
              ? "var(--status-success)"
              : "var(--text-primary)"
          }
        />
        <StatBox
          icon={<Gamepad2 size={ICON} />}
          label={t("labelNet")}
          value={net === 0 ? money(0) : `${net > 0 ? "+" : "-"} ${money(Math.abs(net))}`}
          tone={
            net === 0
              ? "var(--text-primary)"
              : net > 0
                ? "var(--status-success)"
                : "var(--status-danger)"
          }
        />
        <StatBox
          icon={<Coins size={ICON} />}
          label={t("labelBalanceAfter")}
          value={money(row.balanceAfter)}
          tone="var(--primary500)"
        />
      </StatGrid>

      <div
        className="bg-[var(--neutral900)]"
        style={{
          borderRadius: "var(--radius-5)",
          fontSize: "var(--fs-small)",
          marginTop: "calc(var(--u) * 2.133)",
          padding: "calc(var(--u) * 2.133)",
        }}
      >
        <p className="flex items-center gap-2 truncate text-[var(--text-muted)]">
          <Hash size={ICON} />
          {t("labelSerial")}:{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            {row.serialNumber || "—"}
          </span>
        </p>
      </div>

      <CardFoot>
        {t("labelDate")}: {formatDate(row.createdAt)}
      </CardFoot>
    </>
  );
};

/* ── টার্নওভার ── */

/** সরু অগ্রগতির বার */
export const Bar = ({ done, quota }) => {
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

export const TurnoverRow = ({ row, t, providers, sourceLabel }) => {
  const buckets = buildBuckets(row, providers, t("anyProvider"));
  const done = row.status === "completed";

  return (
    <>
      <CardHead
        title={sourceLabel(row.sourceType)}
        lines={[
          row.completedAt
            ? `${t("labelCompletedAt")}: ${formatDate(row.completedAt)}`
            : "",
        ]}
        right={
          <StatusPill
            status={row.status}
            label={done ? t("statusCompleted") : t("statusRunning")}
            icon={done ? <BadgeCheck size={ICON} /> : null}
          />
        }
      />

      <StatGrid>
        <StatBox
          icon={<Coins size={ICON} />}
          label={t("labelCredited")}
          value={money(row.creditedAmount)}
        />
        <StatBox
          icon={<Target size={ICON} />}
          label={t("labelRequired")}
          value={money(row.required)}
        />
        <StatBox
          icon={<TrendingUp size={ICON} />}
          label={t("labelProgress")}
          value={money(row.progress)}
          tone="var(--primary500)"
        />
        <StatBox
          icon={<Receipt size={ICON} />}
          label={t("labelLeft")}
          value={money(Math.max(0, Number(row.required || 0) - Number(row.progress || 0)))}
          tone={done ? "var(--status-success)" : "var(--status-pending)"}
        />
      </StatGrid>

      <div style={{ marginTop: "calc(var(--u) * 2.667)" }}>
        <div
          className="flex items-baseline justify-between text-[var(--text-muted)]"
          style={{ fontSize: "var(--fs-small)" }}
        >
          <span>{t("labelProgress")}</span>
          <span className="font-semibold text-[var(--primary500)]">
            {row.percent ?? 0}%
          </span>
        </div>

        <Bar done={Number(row.progress || 0)} quota={Number(row.required || 0)} />
      </div>

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
            <div key={bucket.key} style={{ marginBottom: "calc(var(--u) * 1.6)" }}>
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

      <CardFoot>
        {t("labelDate")}: {formatDate(row.createdAt)}
      </CardFoot>
    </>
  );
};
