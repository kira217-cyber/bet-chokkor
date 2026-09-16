import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Copy, Gift, Loader2, Share2, Users } from "lucide-react";

import {
  BigNumber,
  CashRatio,
  DarkPanel,
  DarkStat,
  GoldPanel,
  MilestoneStrip,
  PrizeSteps,
} from "./referralBits";
import { formatDate, money } from "./historyFormat";
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

/**
 * রেফারেল প্রোগ্রাম — "মাই রেফারেল"।
 *
 * মূল সাইট (betchokkor.com/bd/bn/referral-program/details) থেকে মেপে:
 *   কনটেন্ট ১২০০px — বাঁয়ে কোডের কার্ড ৩১৯px, ডানে প্যানেল ৮১৭px, ফাঁক ২৪px
 *   ট্যাব সারি ৪৪px, প্রতিটা ২০০px, সক্রিয়টায় ২px সোনালি আন্ডারলাইন
 *   সোনালি প্যানেলে ঢাল বাঁ থেকে ডানে, ভিতরের ঘর #383835 radius ৩px
 *   মাইলফলকের টালি ৮০×৯০, সংখ্যা ২০px/৬০০ রঙ #ffdf1a
 *
 * মোবাইলে সবই এক কলামে নামে, ঠিক মূল সাইটের মতো।
 */

/** ট্যাব সারি — বড়ি নয়, নিচে দাগ (মূল সাইটের মতো) */
const TabBar = ({ tabs, value, onChange }) => (
  <div
    className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    style={{ borderBottom: "1px solid var(--neutral700)" }}
  >
    <div className="flex min-w-max">
      {tabs.map((tab) => {
        const active = tab.key === value;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className="shrink-0 cursor-pointer text-center transition-colors"
            style={{
              borderBottom: `2px solid ${active ? "var(--primary500)" : "transparent"}`,
              color: active ? "var(--neutral200)" : "var(--text-muted)",
              fontSize: "14px",
              fontWeight: active ? 600 : 400,
              height: "44px",
              minWidth: "120px",
              paddingInline: "calc(var(--u) * 4.267)",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  </div>
);

const Referral = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const user = useSelector(selectUser);

  /*
   * কোন ট্যাব খুলবে সেটা URL এ (?tab=info) থাকতে পারে — সাইডবারের
   * "রেফারেল প্রোগ্রাম" সরাসরি তথ্য পাতায় নিয়ে আসে। না থাকলে নিজের
   * ড্যাশবোর্ড (details) খোলে।
   */
  const [params] = useSearchParams();
  const initialTab = ["info", "details", "rewards"].includes(params.get("tab"))
    ? params.get("tab")
    : "details";

  const [tab, setTab] = useState(initialTab);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [reload, setReload] = useState(0);

  // ক্যাশ রেশিওর কোন ব্যান্ডটা এখন দেখাচ্ছে (তীর দিয়ে বদলায়)
  const [bandIndex, setBandIndex] = useState(0);

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

  const copy = async (value, which) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
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

        // অভিনন্দন মডাল — অটো যোগ হলে চোখেই পড়ত না, তাই নিজে ক্লেইম
        // করলে সবুজ টিকসহ পরিষ্কার করে জানানো হয়
        showAlert({
          type: "success",
          title: t("refCongratsTitle"),
          message: `${t("refCongratsText")} ${user?.currency || "BDT"} ${money(result.claimed)}`,
          okText: t("refCongratsOk"),
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

  /** পাতার খোলস — শিরোনাম আর কেন্দ্রীভূত কলাম */
  const shell = (children) => (
    <div
      className="mx-auto w-full"
      style={{
        maxWidth: "1200px",
        paddingInline: "calc(var(--u) * 4.267)",
        paddingBottom: "calc(var(--u) * 6.4)",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: "calc(var(--u) * 4.267)",
          paddingBlock: "calc(var(--u) * 6.4)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/member/profile")}
          aria-label="back"
          className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
          style={{
            height: "calc(var(--u) * 9.067)",
            width: "calc(var(--u) * 9.067)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <h1
          className="font-semibold text-[var(--neutral100)]"
          style={{ fontSize: "calc(var(--u) * 5.333)" }}
        >
          {t("menuReferral")}
        </h1>
      </div>

      {children}
    </div>
  );

  if (loading) {
    return shell(
      <div
        className="flex items-center justify-center text-[var(--text-muted)]"
        style={{
          gap: "calc(var(--u) * 2.133)",
          paddingBlock: "calc(var(--u) * 10.667)",
        }}
      >
        <Loader2 size={18} className="animate-spin" />
        {t("loading")}
      </div>,
    );
  }

  const setting = data?.setting || {};

  if (!setting.isActive) {
    return shell(
      <div
        className="flex flex-col items-center bg-[var(--neutral800)] text-center"
        style={{
          borderRadius: "var(--radius-10)",
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
      </div>,
    );
  }

  const overview = data?.overview || {};
  const achievement = data?.achievement || {};

  const code = data?.referralCode || user?.referralCode || "—";
  const link = `${window.location.origin}/register?ref=${code}`;

  const periodLabel =
    {
      daily: t("periodDaily"),
      weekly: t("periodWeekly"),
      monthly: t("periodMonthly"),
    }[achievement.period || setting.achievement?.period] || "";

  const tabs = [
    { key: "info", label: t("refTabInfo") },
    { key: "details", label: t("refTabDetails") },
    { key: "rewards", label: t("refTabRewards") },
  ];

  /* ── বাঁ পাশের কোডের কার্ড ── */
  const codeCard = (
    <div
      className="shrink-0 bg-[var(--neutral800)] text-center"
      style={{
        borderRadius: "5px",
        padding: "calc(var(--u) * 5.333) calc(var(--u) * 4.267)",
        width: "100%",
      }}
    >
      <div
        className="mx-auto flex items-center justify-center bg-white"
        style={{ height: "112px", padding: "6px", width: "112px" }}
      >
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`}
          alt={code}
          className="h-full w-full object-contain"
          draggable="false"
        />
      </div>

      <p
        className="text-[var(--text-secondary)]"
        style={{ fontSize: "14px", marginTop: "calc(var(--u) * 4.267)" }}
      >
        {t("yourReferralCode")}
      </p>

      <div
        className="flex items-center justify-center"
        style={{ gap: "calc(var(--u) * 2.133)", marginTop: "calc(var(--u) * 1.6)" }}
      >
        <span
          className="font-semibold text-[var(--neutral100)]"
          style={{ fontSize: "20px" }}
        >
          {code}
        </span>

        <button
          type="button"
          onClick={() => copy(code, "code")}
          aria-label={t("copyCode")}
          className="cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--primary500)]"
        >
          <Copy size={15} />
        </button>
      </div>

      <div
        className="flex"
        style={{ gap: "calc(var(--u) * 2.133)", marginTop: "calc(var(--u) * 4.267)" }}
      >
        <button
          type="button"
          onClick={() => copy(link, "link")}
          className="flex flex-1 cursor-pointer items-center justify-center text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
          style={{
            border: "1px solid var(--neutral600)",
            borderRadius: "var(--radius-10)",
            fontSize: "16px",
            gap: "calc(var(--u) * 1.6)",
            height: "50px",
          }}
        >
          <Copy size={15} />
          {copied === "link" ? t("copied") : t("copyLink")}
        </button>

        <button
          type="button"
          onClick={() => copy(link, "share")}
          className="flex flex-1 cursor-pointer items-center justify-center font-semibold transition-[filter] hover:brightness-105"
          style={{
            backgroundColor: "var(--primary500)",
            borderRadius: "var(--radius-10)",
            color: "var(--btn-primary-txt)",
            fontSize: "16px",
            gap: "calc(var(--u) * 1.6)",
            height: "50px",
          }}
        >
          <Share2 size={15} />
          {copied === "share" ? t("copied") : t("shareIt")}
        </button>
      </div>
    </div>
  );

  return shell(
    <div className="flex flex-col" style={{ gap: "calc(var(--u) * 4.267)" }}>
      <TabBar tabs={tabs} value={tab} onChange={setTab} />

      <div className="flex flex-col lg:flex-row" style={{ gap: "24px" }}>
        {/* বাঁ পাশ — ডেস্কটপে ৩১৯px স্থির */}
        <div className="w-full lg:w-[319px] lg:shrink-0">{codeCard}</div>

        {/* ডান পাশ */}
        <div
          className="flex min-w-0 flex-1 flex-col"
          style={{ gap: "calc(var(--u) * 4.267)" }}
        >
          {tab === "details" ? (
            <>
              <GoldPanel title={t("refProgramStatus")}>
                <div
                  className="flex flex-col items-stretch sm:flex-row sm:items-center"
                  style={{ gap: "calc(var(--u) * 3.2)" }}
                >
                  <BigNumber
                    value={overview.activeDownlineCount ?? 0}
                    label={t("refActiveDownline")}
                  />

                  <div
                    className="flex min-w-0 flex-1 flex-wrap"
                    style={{ gap: "calc(var(--u) * 3.2)" }}
                  >
                    <DarkStat
                      label={t("refTotalReward")}
                      value={money(
                        Number(overview.claimable || 0) +
                          Number(overview.claimed || 0),
                      )}
                    />
                    <DarkStat
                      label={t("refDownlineTurnover")}
                      value={money(overview.activeDownlineTurnover)}
                    />
                    <DarkStat
                      label={t("refClaimable")}
                      value={money(overview.claimable)}
                      tone="var(--status-success)"
                    />
                  </div>
                </div>

                {Number(overview.claimable) > 0 ? (
                  <button
                    type="button"
                    onClick={claim}
                    disabled={busy}
                    className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] hover:brightness-105 disabled:opacity-60"
                    style={{
                      backgroundColor: "var(--neutral1000)",
                      borderRadius: "var(--radius-10)",
                      color: "var(--primary500)",
                      fontSize: "16px",
                      gap: "calc(var(--u) * 2.133)",
                      height: "48px",
                      marginTop: "calc(var(--u) * 4.267)",
                    }}
                  >
                    {busy ? <Loader2 size={16} className="animate-spin" /> : null}
                    {t("refClaimNow")} {money(overview.claimable)}
                  </button>
                ) : null}
              </GoldPanel>

              <GoldPanel
                title={t("refEarnedStatus")}
                action={
                  <button
                    type="button"
                    onClick={() => setTab("info")}
                    className="cursor-pointer underline"
                    style={{ color: "var(--neutral1000)", fontSize: "14px" }}
                  >
                    {t("refBonusRules")}
                  </button>
                }
              >
                <div
                  className="flex flex-col items-stretch sm:flex-row sm:items-center"
                  style={{ gap: "calc(var(--u) * 3.2)" }}
                >
                  <BigNumber
                    value={money(overview.claimed)}
                    label={t("refRewardTaka")}
                  />

                  <div className="min-w-0 flex-1">
                    <MilestoneStrip
                      period={`${periodLabel} · ${t("refInvited")} ${achievement.activeCount ?? 0}`}
                      milestones={achievement.milestones || []}
                      inviteLabel={t("refInvite")}
                    />
                  </div>
                </div>
              </GoldPanel>

              {/* কাকে কাকে এনেছি */}
              <div
                className="bg-[var(--neutral800)]"
                style={{
                  borderRadius: "5px",
                  padding: "calc(var(--u) * 4.267)",
                }}
              >
                <p
                  className="font-semibold text-[var(--neutral100)]"
                  style={{ fontSize: "16px" }}
                >
                  {t("refMyDownline")} ({overview.downlineCount ?? 0})
                </p>

                {downline.length === 0 ? (
                  <p
                    className="text-[var(--text-disabled)]"
                    style={{
                      fontSize: "14px",
                      marginTop: "calc(var(--u) * 3.2)",
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
                          borderTop: "1px solid var(--neutral700)",
                          paddingBlock: "calc(var(--u) * 2.667)",
                        }}
                      >
                        <div className="min-w-0">
                          <p
                            className="truncate font-semibold text-[var(--text-primary)]"
                            style={{ fontSize: "14px" }}
                          >
                            {item.userId}
                          </p>
                          <p
                            className="text-[var(--text-muted)]"
                            style={{ fontSize: "12px" }}
                          >
                            {formatDate(item.createdAt)}
                          </p>
                        </div>

                        <span
                          className="shrink-0 font-semibold text-[var(--primary500)]"
                          style={{ fontSize: "14px" }}
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

          {/* ── তথ্য ── */}
          {tab === "info" ? (
            <>
              {/* রেফারেল প্রোগ্রাম কি? */}
              <DarkPanel
                title={t("refWhatIsTitle")}
                action={
                  /* নিয়মাবলী → রেফারেল প্রোগ্রামের মূল পাতা (বিস্তারিত ট্যাব),
                     যেখানে কমিশনের টেবিল ও নিজের হিসাব থাকে */
                  <Link
                    to="/member/referral"
                    className="flex h-10 items-center rounded-[10px] border border-white/[0.12] px-5 font-semibold text-[var(--neutral100)] transition-colors hover:bg-white/[0.05]"
                    style={{ fontSize: "var(--fs-normal)" }}
                  >
                    {t("refRulesBtn")}
                  </Link>
                }
              >
                <p
                  className="text-[var(--text-secondary)]"
                  style={{ fontSize: "var(--fs-larger)", lineHeight: 1.7 }}
                >
                  {tv(setting.rules) || t("refWhatIsText")}
                </p>
              </DarkPanel>

              {/* ক্যাশ রিওয়ার্ড রেশিও */}
              <DarkPanel>
                <CashRatio
                  bands={setting.commissionBands || []}
                  maxTier={setting.maxTier || 3}
                  index={Math.min(
                    bandIndex,
                    Math.max(0, (setting.commissionBands || []).length - 1),
                  )}
                  onPrev={() =>
                    setBandIndex((prev) => Math.max(0, prev - 1))
                  }
                  onNext={() =>
                    setBandIndex((prev) =>
                      Math.min(
                        (setting.commissionBands || []).length - 1,
                        prev + 1,
                      ),
                    )
                  }
                  labels={{
                    title: t("refCashRatio"),
                    turnoverRange: t("refTurnoverRange"),
                    depositRange: t("refDepositRange"),
                    winLossRange: t("refWinLossRange"),
                    over: t("refOver"),
                    level: t("refLevel"),
                    prev: t("labelPrev"),
                    next: t("next"),
                  }}
                />
              </DarkPanel>

              <PrizeSteps
                title={t("refMorePrizeTitle")}
                steps={[
                  {
                    img: "/assets/referral/referral-program-flowch-1.webp",
                    title: t("refStep1Title"),
                    text: t("refStep1Text"),
                  },
                  {
                    img: "/assets/referral/referral-program-flowch-2.webp",
                    title: t("refStep2Title"),
                    text: t("refStep2Text"),
                  },
                  {
                    img: "/assets/referral/referral-program-flowch-3.webp",
                    title: t("refStep3Title"),
                    text: t("refStep3Text"),
                  },
                ]}
              />

              {/* মাইলফলক বোনাস — কতজন আনলে কত */}
              <DarkPanel title={t("refMilestones")}>
                <MilestoneStrip
                  period={periodLabel}
                  milestones={achievement.milestones || []}
                  inviteLabel={t("refInvite")}
                />
              </DarkPanel>
            </>
          ) : null}

          {/* ── পুরস্কার ── */}
          {tab === "rewards" ? (
            <>
              {/* তুলতে পারবেন এমন বোনাস থাকলে উপরে ক্লেইম কার্ড */}
              {Number(overview.claimable) > 0 ? (
                <div
                  className="mb-4 flex flex-wrap items-center justify-between gap-4"
                  style={{
                    borderRadius: "var(--radius-10)",
                    padding: "calc(var(--u) * 4.267)",
                    background:
                      "linear-gradient(135deg, #3a2f05 0%, #1c1c1a 100%)",
                    border: "1px solid rgba(249,185,1,0.35)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                      style={{
                        background:
                          "color-mix(in srgb, var(--primary500), transparent 82%)",
                        color: "var(--primary500)",
                      }}
                    >
                      <Gift size={22} />
                    </span>

                    <div>
                      <p
                        className="font-bold text-[var(--neutral100)]"
                        style={{ fontSize: "var(--fs-body)" }}
                      >
                        {t("refClaimReadyTitle")}
                      </p>
                      <p
                        className="text-[var(--text-muted)]"
                        style={{ fontSize: "var(--fs-normal)" }}
                      >
                        {t("refClaimable")}:{" "}
                        <b style={{ color: "#ffdf1a" }}>
                          {money(overview.claimable)}
                        </b>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={claim}
                    disabled={busy}
                    className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] px-6 font-bold text-[var(--neutral900)] transition-[filter] hover:brightness-105 disabled:opacity-50"
                    style={{
                      background: "var(--primary500)",
                      fontSize: "var(--fs-larger)",
                    }}
                  >
                    {busy ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Gift size={16} />
                    )}
                    {t("refClaimNow")} {money(overview.claimable)}
                  </button>
                </div>
              ) : null}

            <div
              className="bg-[var(--neutral800)]"
              style={{ borderRadius: "5px", padding: "calc(var(--u) * 4.267)" }}
            >
              {rewards.length === 0 ? (
                <div
                  className="flex flex-col items-center text-center"
                  style={{
                    gap: "calc(var(--u) * 2.133)",
                    paddingBlock: "calc(var(--u) * 8.533)",
                  }}
                >
                  <Users size={26} className="text-[var(--text-disabled)]" />
                  <p
                    className="text-[var(--text-secondary)]"
                    style={{ fontSize: "14px" }}
                  >
                    {t("nothingYet")}
                  </p>
                </div>
              ) : (
                rewards.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-start justify-between gap-3"
                    style={{
                      borderTop: index === 0 ? "none" : "1px solid var(--neutral700)",
                      paddingBlock: "calc(var(--u) * 2.667)",
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate font-semibold text-[var(--text-primary)]"
                        style={{ fontSize: "14px" }}
                      >
                        {item.type === "commission"
                          ? `${t("refCommission")} · ${t("refTier")} ${item.tier}`
                          : `${t("refMilestone")} · ${item.milestoneCount}`}
                      </p>

                      <p
                        className="text-[var(--text-muted)]"
                        style={{ fontSize: "12px" }}
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
                        className="font-semibold"
                        style={{ color: "#ffdf1a", fontSize: "14px" }}
                      >
                        +{money(item.amount)}
                      </p>
                      <p
                        style={{
                          color:
                            item.status === "claimed"
                              ? "var(--text-muted)"
                              : "var(--status-pending)",
                          fontSize: "12px",
                        }}
                      >
                        {item.status === "claimed"
                          ? t("refClaimed")
                          : t("refPending")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            </>
          ) : null}
        </div>
      </div>
    </div>,
  );
};

export default Referral;
