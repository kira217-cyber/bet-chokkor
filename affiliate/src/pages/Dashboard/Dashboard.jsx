import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  BanknoteArrowDown,
  Coins,
  Copy,
  Dices,
  Percent,
  Share2,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { Card, Empty, Loading, Row, Stat } from "../../components/Panel/Panel";
import { day, money } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import {
  fetchAffiliate,
  fetchMyUsers,
} from "../../features/affiliate/affiliateApi";

/**
 * অ্যাফিলিয়েটের প্রথম পাতা।
 *
 * উপরে একটা চওড়া ব্যানার — নাম, ব্যালেন্স, আর রেফারেল লিংক একসাথে।
 * অ্যাফিলিয়েট লগইন করে সবার আগে এই তিনটাই খোঁজেন, তাই স্ক্রল করার
 * আগেই যাতে চোখে পড়ে। QR টা ব্যানারেই বসানো — ফোন বাড়িয়ে ধরলেই
 * কাজ, লিংক টাইপ করতে হয় না।
 *
 * তারপর চারটে সংখ্যা, কমিশনের ভাগ, খেলার হিসাব আর শেষ কয়েকজন
 * খেলোয়াড়।
 *
 * কমিশনের শেষ হিসাব = (রেফার + ডিপোজিট + খেলোয়াড়ের হার) − খেলোয়াড়ের
 * জেতা। জেতার ভাগটা বাদ যায় বলে সংখ্যাটা ঋণাত্মকও হতে পারে — সেটাই
 * স্বাভাবিক, আর অ্যাডমিন হিসাব মেলানোর সময় এটাই ব্যালেন্সে বসে।
 */
const Dashboard = () => {
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    Promise.all([
      fetchAffiliate(),
      fetchMyUsers({ page: 1, limit: 5 }).catch(() => ({ rows: [] })),
    ])
      .then(([next, players]) => {
        if (!alive) return;

        setData(next);
        setRecent(players.rows || []);
      })
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label={t("loading")} />;

  if (!data) return <Card>{t("somethingWrong")}</Card>;

  const { commission, players, games } = data;

  const link = `${window.location.origin}/register?ref=${data.referralCode}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে লিংকটা পর্দাতেই দেখা যাচ্ছে
    }
  };

  /**
   * শেয়ার — ফোনে সিস্টেমের শেয়ার শিট, ডেস্কটপে কপি।
   *
   * `navigator.share` সব ব্রাউজারে নেই, তাই না পেলে চুপচাপ কপিতেই
   * নেমে আসে — বোতামটা কোথাও নিষ্ক্রিয় দেখায় না।
   */
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: t("brand"), url: link });
        return;
      } catch {
        return;
      }
    }

    await copy();
  };

  const netTone =
    Number(commission.net) >= 0
      ? "var(--status-success)"
      : "var(--status-danger)";

  return (
    <div className="flex flex-col gap-4">
      {/* ── ব্যানার ── */}
      <div className="relative overflow-hidden rounded-[20px] border border-[var(--primary500)]/25 bg-[var(--neutral900)] p-5 lg:p-6">
        {/* পেছনের আলো — কার্ডটা যেন সমতল না লাগে */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-[260px] w-[260px] rounded-full opacity-[0.16] blur-[70px]"
          style={{ background: "var(--primary500)" }}
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-[var(--text-muted)]">
              {t("welcomeBack")}
            </p>

            <h1 className="mt-1 truncate text-[24px] font-black text-[var(--text-primary)] lg:text-[30px]">
              {data.user?.userId}
            </h1>

            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              {t("dashSubtitle")}
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-[12px] uppercase tracking-wider text-[var(--text-disabled)]">
                  {t("availableBalance")}
                </p>
                <p className="text-[32px] font-black leading-tight text-[var(--primary500)] lg:text-[38px]">
                  {money(data.user?.balance)}
                </p>
              </div>

              <div>
                <p className="text-[12px] uppercase tracking-wider text-[var(--text-disabled)]">
                  {t("cmNet")}
                </p>
                <p
                  className="text-[20px] font-black leading-tight"
                  style={{ color: netTone }}
                >
                  {money(commission.net)}
                </p>
              </div>
            </div>

            <p className="mt-2 text-[12px] text-[var(--text-disabled)]">
              {t("affBalanceText")}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/dashboard/withdraw"
                className="aff-btn aff-btn--primary aff-btn--sm"
              >
                <BanknoteArrowDown size={15} />
                {t("navWithdraw")}
              </Link>

              <Link
                to="/dashboard/my-users"
                className="aff-btn aff-btn--ghost aff-btn--sm"
              >
                <Users size={15} />
                {t("navMyUsers")}
              </Link>

              <Link
                to="/dashboard/commission"
                className="aff-btn aff-btn--ghost aff-btn--sm"
              >
                <Percent size={15} />
                {t("navCommissionStatus")}
              </Link>
            </div>
          </div>

          {/* ── রেফারেল লিংক ও QR ── */}
          <div className="w-full shrink-0 rounded-[16px] border border-white/[0.07] bg-[var(--neutral1000)] p-4 lg:w-[300px]">
            <p className="text-center text-[12px] text-[var(--text-muted)]">
              {t("scanToJoin")}
            </p>

            <div className="mt-3 flex justify-center">
              <span className="flex h-[136px] w-[136px] items-center justify-center rounded-[12px] bg-white p-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(link)}`}
                  alt={data.referralCode}
                  className="h-full w-full object-contain"
                  draggable="false"
                />
              </span>
            </div>

            <p className="mt-3 text-center text-[22px] font-black tracking-[0.2em] text-[var(--primary500)]">
              {data.referralCode}
            </p>

            <p className="mt-2 break-all rounded-[10px] bg-[var(--neutral800)] p-2.5 text-center text-[11px] text-[var(--text-secondary)]">
              {link}
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={copy}
                className="aff-btn aff-btn--primary aff-btn--sm flex-1"
              >
                <Copy size={14} />
                {copied ? t("copied") : t("copyLink")}
              </button>

              <button
                type="button"
                onClick={share}
                className="aff-btn aff-btn--ghost aff-btn--sm flex-1"
              >
                <Share2 size={14} />
                {t("shareLink")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── এক নজরের সংখ্যা ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label={t("statTotalPlayers")}
          value={players.total}
          sub={`${t("statActive")}: ${players.active}`}
          Icon={Users}
        />
        <Stat
          label={t("statThisMonth")}
          value={players.joinedThisMonth}
          sub={t("statNewPlayers")}
          Icon={UserCheck}
        />
        <Stat
          label={t("statPlayerDeposit")}
          value={money(players.depositTotal)}
          sub={`${players.depositCount} ${t("statDeposits")}`}
          tone="var(--primary500)"
          Icon={Wallet}
        />
        <Stat
          label={t("statNetCommission")}
          value={money(commission.net)}
          sub={Number(commission.net) >= 0 ? t("statPayable") : t("statOwed")}
          tone={netTone}
          Icon={Coins}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={t("commissionBalances")}
          subtitle={t("commissionBalancesText")}
        >
          <Row label={t("cmRefer")} value={money(commission.balances.refer)} />
          <Row
            label={t("cmDeposit")}
            value={money(commission.balances.deposit)}
          />
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
          <Row label={t("cmNet")} value={money(commission.net)} tone={netTone} />
        </Card>

        <Card title={t("commissionRates")} subtitle={t("commissionRatesText")}>
          <Row label={t("cmRefer")} value={`${commission.rates.refer}`} />
          <Row label={t("cmDeposit")} value={`${commission.rates.deposit}%`} />
          <Row label={t("cmGameLoss")} value={`${commission.rates.gameLoss}%`} />
          <Row label={t("cmGameWin")} value={`${commission.rates.gameWin}%`} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("gameSummary")} subtitle={t("gameSummaryText")}>
          <Row label={t("statRounds")} value={games.rounds} />
          <Row
            label={t("statTurnover")}
            value={money(games.turnover)}
            tone="var(--primary500)"
          />
          <Row
            label={t("statGameCommission")}
            value={money(games.commission)}
            tone="var(--status-success)"
          />
          <Row
            label={t("statMonthCommission")}
            value={money(data.thisMonthCommission)}
          />
        </Card>

        {/* ── শেষ কয়েকজন খেলোয়াড় ── */}
        <Card
          title={t("recentPlayers")}
          subtitle={t("myUsersText")}
          action={
            <Link
              to="/dashboard/my-users"
              className="flex h-9 items-center rounded-[10px] bg-[var(--primary500)]/10 px-3 text-[13px] font-semibold text-[var(--primary500)] transition hover:bg-[var(--primary500)]/20"
            >
              {t("viewAll")}
            </Link>
          }
        >
          {recent.length === 0 ? (
            <Empty label={t("noPlayersYet")} Icon={Users} />
          ) : (
            <div className="flex flex-col gap-2">
              {recent.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between gap-3 rounded-[12px] border border-white/[0.05] bg-[var(--neutral1000)] px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[var(--text-primary)]">
                      {player.userId}
                    </p>
                    <p className="truncate text-[12px] text-[var(--text-muted)]">
                      {t("joinedOn")}: {day(player.createdAt)}
                    </p>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-2.5 py-[3px] text-[11px] font-bold"
                    style={{
                      background: `color-mix(in srgb, ${
                        player.isActive
                          ? "var(--status-success)"
                          : "var(--text-disabled)"
                      }, transparent 86%)`,
                      color: player.isActive
                        ? "var(--status-success)"
                        : "var(--text-disabled)",
                    }}
                  >
                    {t(player.isActive ? "statusActive" : "statusInactive")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <p className="flex items-start gap-2 text-[13px] text-[var(--text-muted)]">
          <Dices size={15} className="mt-0.5 shrink-0 text-[var(--primary500)]" />
          {t("dashboardNote")}
        </p>

        <p className="mt-2 flex items-start gap-2 text-[12px] text-[var(--text-disabled)]">
          <TrendingUp size={13} className="mt-0.5 shrink-0" />
          {t("myReferralHint")}
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
