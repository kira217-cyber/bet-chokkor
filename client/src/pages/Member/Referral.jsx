import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Copy, Gift, Loader2, Share2, Users } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { Tabs } from "./historyBits";
import { money, formatDate } from "./historyFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import {
  claimReferral,
  fetchDownline,
  fetchReferral,
  fetchReferralRewards,
} from "../../features/referral/referralApi";

const box = {
  borderRadius: "var(--radius-10)",
  padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
};

/** এক নজরের সংখ্যা */
const Stat = ({ label, value, tone }) => (
  <div className="min-w-0 bg-[var(--neutral900)]" style={box}>
    <p
      className="truncate text-[var(--text-muted)]"
      style={{ fontSize: "var(--fs-small)" }}
    >
      {label}
    </p>
    <p
      className="truncate font-black"
      style={{
        color: tone || "var(--text-primary)",
        fontSize: "var(--fs-h4)",
        marginTop: "calc(var(--u) * 0.8)",
      }}
    >
      {value}
    </p>
  </div>
);

/**
 * রেফারেল প্রোগ্রাম — "মাই রেফারেল"।
 *
 * মূল সাইটের মতো তিন ট্যাব: তথ্য (নিয়ম কী), বিস্তারিত (আমার অবস্থা ও
 * মাইলফলক) আর পুরস্কার (কী কী পেয়েছি)।
 *
 * দুই রকম আয়: বন্ধুর খেলার শতাংশ (কমিশন), আর এক মাসে কতজন এনেছেন তার
 * থোক বোনাস (মাইলফলক)। দুটোর নিয়মই অ্যাডমিন ঠিক করেন, তাই এখানে যা
 * দেখানো হয় সবই সার্ভার থেকে আসা।
 */
const Referral = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const user = useSelector(selectUser);

  const [tab, setTab] = useState("details");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reload, setReload] = useState(0);

  const [rewards, setRewards] = useState([]);
  const [downline, setDownline] = useState([]);

  useEffect(() => {
    let alive = true;

    fetchReferral()
      .then((next) => alive && setData(next))
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [reload]);

  useEffect(() => {
    let alive = true;

    if (tab === "rewards") {
      fetchReferralRewards({ limit: 20 })
        .then((next) => alive && setRewards(next.rows || []))
        .catch(() => alive && setRewards([]));
    }

    if (tab === "details") {
      fetchDownline({ limit: 20 })
        .then((next) => alive && setDownline(next.rows || []))
        .catch(() => alive && setDownline([]));
    }

    return () => {
      alive = false;
    };
  }, [tab, reload]);

  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে কোডটা পর্দাতেই দেখা যাচ্ছে
    }
  };

  const claim = async () => {
    try {
      setBusy(true);

      const result = await claimReferral();

      if (result) {
        dispatch(updateUser({ ...user, balance: result.balance }));

        showAlert({
          title: t("referralClaimed"),
          message: `${t("referralClaimedText")} ${money(result.claimed)}`,
        });
      }

      setReload((prev) => prev + 1);
    } catch (error) {
      showAlert({
        title: t("somethingWrong"),
        message: error?.response?.data?.message || t("somethingWrong"),
      });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <MemberPage title={t("menuReferral")}>
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
      </MemberPage>
    );
  }

  const setting = data?.setting || {};

  if (!setting.isActive) {
    return (
      <MemberPage title={t("menuReferral")} onBack={() => navigate("/member/profile")}>
        <div
          className="flex flex-col items-center bg-[var(--neutral800)] text-center"
          style={{
            ...box,
            gap: "calc(var(--u) * 3.2)",
            paddingBlock: "calc(var(--u) * 10.667)",
          }}
        >
          <Gift size={30} className="text-[var(--text-disabled)]" />
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("referralOff")}
          </p>
        </div>
      </MemberPage>
    );
  }

  const overview = data?.overview || {};
  const achievement = data?.achievement || {};

  const code = data?.referralCode || user?.referralCode || "—";
  const link = `${window.location.origin}/register?ref=${code}`;

  const periodLabel = {
    daily: t("periodDaily"),
    weekly: t("periodWeekly"),
    monthly: t("periodMonthly"),
  }[achievement.period || setting.achievement?.period] || "";

  const tabs = [
    { key: "info", label: t("refTabInfo") },
    { key: "details", label: t("refTabDetails") },
    { key: "rewards", label: t("refTabRewards") },
  ];

  return (
    <MemberPage title={t("menuReferral")} onBack={() => navigate("/member/profile")}>
      <div className="flex flex-col" style={{ gap: "calc(var(--u) * 3.2)" }}>
        <Tabs tabs={tabs} value={tab} onChange={setTab} />

        {/* ── কোড ও লিংক — সব ট্যাবেই ── */}
        <div className="bg-[var(--neutral800)] text-center" style={box}>
          <p
            className="text-[var(--text-muted)]"
            style={{ fontSize: "var(--fs-small)" }}
          >
            {t("yourReferralCode")}
          </p>

          <p
            className="font-black text-[var(--primary500)]"
            style={{
              fontSize: "var(--fs-h3)",
              letterSpacing: "0.08em",
              marginBlock: "calc(var(--u) * 1.6)",
            }}
          >
            {code}
          </p>

          <div
            className="flex justify-center"
            style={{ gap: "calc(var(--u) * 2.133)" }}
          >
            <button
              type="button"
              onClick={() => copy(link)}
              className="flex cursor-pointer items-center font-semibold text-[var(--text-secondary)]"
              style={{
                border: "1px solid var(--neutral600)",
                borderRadius: "var(--radius-10)",
                fontSize: "var(--fs-normal)",
                gap: "calc(var(--u) * 1.6)",
                padding: "calc(var(--u) * 2.133) calc(var(--u) * 4.267)",
              }}
            >
              <Copy size={14} />
              {copied ? t("copied") : t("copyLink")}
            </button>

            <button
              type="button"
              onClick={() => copy(code)}
              className="flex cursor-pointer items-center font-bold text-[var(--btn-primary-txt)]"
              style={{
                backgroundColor: "var(--primary500)",
                borderRadius: "var(--radius-10)",
                fontSize: "var(--fs-normal)",
                gap: "calc(var(--u) * 1.6)",
                padding: "calc(var(--u) * 2.133) calc(var(--u) * 4.267)",
              }}
            >
              <Share2 size={14} />
              {t("copyCode")}
            </button>
          </div>
        </div>

        {/* ── তথ্য ── */}
        {tab === "info" ? (
          <>
            <div className="bg-[var(--neutral900)]" style={box}>
              <p
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {t("refHowItWorks")}
              </p>

              <p
                className="text-[var(--text-secondary)]"
                style={{
                  fontSize: "var(--fs-normal)",
                  marginTop: "calc(var(--u) * 1.6)",
                }}
              >
                {tv(setting.rules) || t("refHowItWorksText")}
              </p>
            </div>

            {/* কমিশনের ধাপ */}
            <div className="bg-[var(--neutral900)]" style={box}>
              <p
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {t("refCommissionTable")}
              </p>

              <div
                className="overflow-x-auto [scrollbar-width:thin]"
                style={{ marginTop: "calc(var(--u) * 2.667)" }}
              >
                <table className="w-full min-w-[280px] border-collapse text-left">
                  <thead>
                    <tr>
                      <th
                        className="text-[var(--text-muted)]"
                        style={{
                          fontSize: "var(--fs-small)",
                          paddingBottom: "calc(var(--u) * 1.6)",
                        }}
                      >
                        {t("refTurnoverFrom")}
                      </th>

                      {Array.from({ length: setting.maxTier || 3 }).map((_, index) => (
                        <th
                          key={index}
                          className="text-right text-[var(--text-muted)]"
                          style={{
                            fontSize: "var(--fs-small)",
                            paddingBottom: "calc(var(--u) * 1.6)",
                          }}
                        >
                          {t("refTier")} {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {(setting.commissionBands || []).map((band) => (
                      <tr key={band.requireTurnover}>
                        <td
                          className="text-[var(--text-primary)]"
                          style={{
                            fontSize: "var(--fs-normal)",
                            paddingBlock: "calc(var(--u) * 1.067)",
                          }}
                        >
                          {money(band.requireTurnover)}
                        </td>

                        {Array.from({ length: setting.maxTier || 3 }).map((_, index) => {
                          const tier = band.tiers?.find(
                            (item) => item.tier === index + 1,
                          );

                          return (
                            <td
                              key={index}
                              className="text-right font-semibold text-[var(--primary500)]"
                              style={{
                                fontSize: "var(--fs-normal)",
                                paddingBlock: "calc(var(--u) * 1.067)",
                              }}
                            >
                              {tier ? `${tier.percent}%` : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p
                className="text-[var(--text-muted)]"
                style={{
                  fontSize: "var(--fs-small)",
                  marginTop: "calc(var(--u) * 2.133)",
                }}
              >
                {t("refTierNote")}
              </p>
            </div>
          </>
        ) : null}

        {/* ── বিস্তারিত ── */}
        {tab === "details" ? (
          <>
            <div
              className="grid grid-cols-2"
              style={{ gap: "calc(var(--u) * 2.133)" }}
            >
              <Stat
                label={t("refActiveDownline")}
                value={overview.activeDownlineCount ?? 0}
              />
              <Stat
                label={t("refDownlineTurnover")}
                value={money(overview.activeDownlineTurnover)}
              />
              <Stat
                label={t("refClaimable")}
                value={money(overview.claimable)}
                tone="var(--status-success)"
              />
              <Stat
                label={t("refClaimed")}
                value={money(overview.claimed)}
                tone="var(--primary500)"
              />
            </div>

            {Number(overview.claimable) > 0 ? (
              <button
                type="button"
                onClick={claim}
                disabled={busy}
                className="flex w-full cursor-pointer items-center justify-center font-bold text-[var(--btn-primary-txt)] transition-[filter] hover:brightness-105 disabled:opacity-60"
                style={{
                  backgroundColor: "var(--primary500)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                  gap: "calc(var(--u) * 2.133)",
                  height: "calc(var(--u) * 13.333)",
                }}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                {t("refClaimNow")} {money(overview.claimable)}
              </button>
            ) : null}

            {/* মাইলফলক */}
            <div className="bg-[var(--neutral900)]" style={box}>
              <div className="flex items-baseline justify-between gap-3">
                <p
                  className="font-bold text-[var(--neutral100)]"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {t("refMilestones")}
                </p>

                <span
                  className="text-[var(--text-muted)]"
                  style={{ fontSize: "var(--fs-small)" }}
                >
                  {periodLabel} · {t("refInvited")} {achievement.activeCount ?? 0}
                </span>
              </div>

              <div
                className="overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1"
                style={{ marginTop: "calc(var(--u) * 2.667)" }}
              >
                <div className="flex min-w-max" style={{ gap: "calc(var(--u) * 2.133)" }}>
                  {(achievement.milestones || []).map((item) => {
                    const done = item.given;
                    const reached = item.reached;

                    return (
                      <div
                        key={item.count}
                        className="shrink-0 text-center"
                        style={{
                          backgroundColor: reached
                            ? "var(--primary500)"
                            : "var(--neutral800)",
                          borderRadius: "var(--radius-10)",
                          minWidth: "calc(var(--u) * 24)",
                          padding: "calc(var(--u) * 2.667) calc(var(--u) * 3.2)",
                        }}
                      >
                        <p
                          style={{
                            color: reached
                              ? "var(--neutral1000)"
                              : "var(--text-muted)",
                            fontSize: "var(--fs-small)",
                          }}
                        >
                          {t("refInvite")}
                        </p>

                        <p
                          className="font-black"
                          style={{
                            color: reached
                              ? "var(--neutral1000)"
                              : "var(--text-primary)",
                            fontSize: "var(--fs-h4)",
                          }}
                        >
                          {item.count}
                        </p>

                        <p
                          className="font-bold"
                          style={{
                            color: reached
                              ? "var(--neutral1000)"
                              : "var(--primary500)",
                            fontSize: "var(--fs-normal)",
                            marginTop: "calc(var(--u) * 0.8)",
                          }}
                        >
                          +{money(item.amount)}
                        </p>

                        {done ? (
                          <p
                            style={{
                              color: "var(--neutral1000)",
                              fontSize: "var(--fs-mini)",
                              marginTop: "calc(var(--u) * 0.533)",
                            }}
                          >
                            {t("refGiven")}
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* কাকে কাকে এনেছি */}
            <div className="bg-[var(--neutral900)]" style={box}>
              <p
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {t("refMyDownline")} ({overview.downlineCount ?? 0})
              </p>

              {downline.length === 0 ? (
                <p
                  className="text-[var(--text-disabled)]"
                  style={{
                    fontSize: "var(--fs-normal)",
                    marginTop: "calc(var(--u) * 2.133)",
                  }}
                >
                  {t("refNoDownline")}
                </p>
              ) : (
                <div style={{ marginTop: "calc(var(--u) * 2.133)" }}>
                  {downline.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3"
                      style={{
                        borderTop: "1px solid var(--neutral800)",
                        paddingBlock: "calc(var(--u) * 2.133)",
                      }}
                    >
                      <div className="min-w-0">
                        <p
                          className="truncate font-semibold text-[var(--text-primary)]"
                          style={{ fontSize: "var(--fs-normal)" }}
                        >
                          {item.userId}
                        </p>
                        <p
                          className="text-[var(--text-muted)]"
                          style={{ fontSize: "var(--fs-small)" }}
                        >
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <span
                        className="shrink-0 font-semibold text-[var(--primary500)]"
                        style={{ fontSize: "var(--fs-normal)" }}
                      >
                        {money(item.totalTurnover)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* ── পুরস্কার ── */}
        {tab === "rewards" ? (
          <div className="bg-[var(--neutral900)]" style={box}>
            {rewards.length === 0 ? (
              <div
                className="flex flex-col items-center text-center"
                style={{
                  gap: "calc(var(--u) * 2.133)",
                  paddingBlock: "calc(var(--u) * 6.4)",
                }}
              >
                <Users size={26} className="text-[var(--text-disabled)]" />
                <p
                  className="text-[var(--text-secondary)]"
                  style={{ fontSize: "var(--fs-normal)" }}
                >
                  {t("nothingYet")}
                </p>
              </div>
            ) : (
              rewards.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start justify-between gap-3"
                  style={{
                    borderTop: "1px solid var(--neutral800)",
                    paddingBlock: "calc(var(--u) * 2.133)",
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="truncate font-semibold text-[var(--text-primary)]"
                      style={{ fontSize: "var(--fs-normal)" }}
                    >
                      {item.type === "commission"
                        ? `${t("refCommission")} · ${t("refTier")} ${item.tier}`
                        : `${t("refMilestone")} · ${item.milestoneCount}`}
                    </p>

                    <p
                      className="text-[var(--text-muted)]"
                      style={{ fontSize: "var(--fs-small)" }}
                    >
                      {item.type === "commission"
                        ? `${item.fromUserIdText} · ${item.percent}% × ${money(item.wager)}`
                        : item.periodKey}
                      {" · "}
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className="font-bold text-[var(--status-success)]"
                      style={{ fontSize: "var(--fs-normal)" }}
                    >
                      +{money(item.amount)}
                    </p>
                    <p
                      style={{
                        color:
                          item.status === "claimed"
                            ? "var(--text-muted)"
                            : "var(--status-pending)",
                        fontSize: "var(--fs-small)",
                      }}
                    >
                      {item.status === "claimed" ? t("refClaimed") : t("refPending")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </MemberPage>
  );
};

export default Referral;
