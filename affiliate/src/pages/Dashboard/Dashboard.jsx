import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Coins,
  Copy,
  Dices,
  Percent,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import {
  Card,
  Loading,
  Row,
  Stat,
} from "../../components/Panel/Panel";
import { money } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import { fetchAffiliate } from "../../features/affiliate/affiliateApi";

/**
 * অ্যাফিলিয়েটের প্রথম পাতা।
 *
 * উপরে চারটে সংখ্যা, তারপর কমিশনের চার ভাগ আর নিজের রেফারেল লিংক।
 *
 * কমিশনের শেষ হিসাব = (রেফার + ডিপোজিট + খেলোয়াড়ের হার) − খেলোয়াড়ের
 * জেতা। জেতার ভাগটা বাদ যায় বলে সংখ্যাটা ঋণাত্মকও হতে পারে — সেটাই
 * স্বাভাবিক, আর অ্যাডমিন হিসাব মেলানোর সময় এটাই ব্যালেন্সে বসে।
 */
const Dashboard = () => {
  const { t } = useLanguage();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    fetchAffiliate()
      .then((next) => alive && setData(next))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loading label={t("loading")} />;

  if (!data) {
    return <Card>{t("somethingWrong")}</Card>;
  }

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

  return (
    <div className="flex flex-col gap-4">
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
          sub={
            Number(commission.net) >= 0 ? t("statPayable") : t("statOwed")
          }
          tone={
            Number(commission.net) >= 0
              ? "var(--status-success)"
              : "var(--status-danger)"
          }
          Icon={Coins}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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

        <Card title={t("commissionRates")} subtitle={t("commissionRatesText")}>
          <Row label={t("cmRefer")} value={`${commission.rates.refer}`} />
          <Row label={t("cmDeposit")} value={`${commission.rates.deposit}%`} />
          <Row label={t("cmGameLoss")} value={`${commission.rates.gameLoss}%`} />
          <Row label={t("cmGameWin")} value={`${commission.rates.gameWin}%`} />

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/dashboard/commission"
              className="flex h-10 items-center rounded-[10px] border border-white/[0.07] px-4 text-[13px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <Percent size={14} className="me-2" />
              {t("navCommissionStatus")}
            </Link>

            <Link
              to="/dashboard/my-users"
              className="flex h-10 items-center rounded-[10px] border border-white/[0.07] px-4 text-[13px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
            >
              <Users size={14} className="me-2" />
              {t("navMyUsers")}
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={t("gameSummary")} subtitle={t("gameSummaryText")}>
          <Row
            label={t("statRounds")}
            value={games.rounds}
          />
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
          <Row label={t("statMonthCommission")} value={money(data.thisMonthCommission)} />
        </Card>

        <Card title={t("myReferralLink")} subtitle={t("myReferralLinkText")}>
          <p className="text-center text-[26px] font-black tracking-widest text-[var(--primary500)]">
            {data.referralCode}
          </p>

          <p className="mt-3 break-all rounded-[10px] bg-[var(--neutral800)] p-3 text-center text-[13px] text-[var(--text-secondary)]">
            {link}
          </p>

          <button
            type="button"
            onClick={copy}
            className="aff-btn aff-btn--primary mt-4 w-full"
          >
            <Copy size={15} className="me-2" />
            {copied ? t("copied") : t("copyLink")}
          </button>

          <p className="mt-3 flex items-center gap-2 text-[12px] text-[var(--text-disabled)]">
            <TrendingUp size={13} />
            {t("myReferralHint")}
          </p>
        </Card>
      </div>

      <Card>
        <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
          <Dices size={15} className="shrink-0 text-[var(--primary500)]" />
          {t("dashboardNote")}
        </p>
      </Card>
    </div>
  );
};

export default Dashboard;
