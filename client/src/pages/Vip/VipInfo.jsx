import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Coins, Crown, Loader2, RefreshCw } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { useLanguage } from "../../Context/LanguageProvider";
import { api } from "../../api/axios";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import {
  fetchVipMe,
  fetchVipHistory,
  convertVipPoints,
} from "../../features/vip/vipApi";

const nf = (n) => Math.floor(Number(n || 0)).toLocaleString("en-US");
const money = (n) => Number(n || 0).toFixed(2);

const TYPE_LABEL = {
  upgrade: { bn: "লেভেল আপগ্রেড", en: "Level upgrade" },
  convert: { bn: "পয়েন্ট রূপান্তর", en: "Points converted" },
  bonus: { bn: "বোনাস", en: "Bonus" },
  adjust: { bn: "সমন্বয়", en: "Adjustment" },
  earn: { bn: "অর্জন", en: "Earned" },
};

/**
 * মাই ভিআইপি — মূল সাইটের /member/vip-info এর মতো।
 *
 * উপরে VP পয়েন্ট, তারপর XP প্রোগ্রেস (বর্তমান → পরের লেভেল), তারপর
 * VIP ইনস্ট্যান্ট রিবেট (পয়েন্ট → ক্যাশ), নিচে আপগ্রেড হিস্ট্রি।
 */
const VipInfo = () => {
  const { isBangla } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [vip, setVip] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const L = (bn, en) => (isBangla ? bn : en);

  const load = async () => {
    try {
      const [me, hist] = await Promise.all([
        fetchVipMe(),
        fetchVipHistory(1),
      ]);
      setVip(me);
      setRows(hist.rows || []);
    } catch {
      // পুরোনো তথ্য থাক
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const convert = async () => {
    try {
      setBusy(true);
      const res = await convertVipPoints();
      toast.success(
        L(
          `${res.converted} পয়েন্ট → ৳${money(res.cash)} যোগ হয়েছে`,
          `${res.converted} points → ৳${money(res.cash)} added`,
        ),
      );
      // নেভবারের ব্যালেন্স ও পয়েন্ট রিফ্রেশ
      if (user) {
        dispatch(updateUser({ ...user, balance: res.balance, vipPoints: res.points }));
      }
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || L("রূপান্তর ব্যর্থ", "Convert failed"));
    } finally {
      setBusy(false);
    }
  };

  const active = vip?.active !== false;
  const points = Number(vip?.points ?? user?.vipPoints ?? 0);
  const xp = Number(vip?.xp ?? user?.vipXP ?? 0);
  const nextReq = Number(vip?.next?.xpRequired ?? 0);
  const percent = Number(vip?.percent ?? 0);
  const ratio = Number(vip?.convertRatio ?? 400);
  const minPoints = Number(vip?.minConvertPoints ?? 0);
  const canConvert = points >= minPoints && points >= ratio;
  const convertCash = Math.floor(points / ratio);

  return (
    <MemberPage title={L("মাই ভিআইপি", "My VIP")} maxWidth="820px">
      {loading ? (
        <div
          className="flex items-center justify-center text-[var(--text-muted)]"
          style={{ gap: "calc(var(--u)*2.133)", paddingBlock: "calc(var(--u)*10.667)" }}
        >
          <Loader2 size={18} className="animate-spin" />
          {L("লোড হচ্ছে…", "Loading…")}
        </div>
      ) : !active ? (
        <p
          className="text-center text-[var(--text-muted)]"
          style={{ paddingBlock: "calc(var(--u)*10.667)", fontSize: "var(--fs-larger)" }}
        >
          {L("ভিআইপি প্রোগ্রাম এখন বন্ধ আছে।", "The VIP program is off right now.")}
        </p>
      ) : (
        <div className="flex flex-col" style={{ gap: "calc(var(--u)*4.267)" }}>
          {/* ── VP + লেভেল কার্ড ── */}
          <div
            className="bg-[var(--neutral800)]"
            style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*4.267)" }}
          >
            <div className="flex items-start justify-between" style={{ gap: "calc(var(--u)*3.2)" }}>
              <div>
                <p className="text-[var(--text-muted)]" style={{ fontSize: "var(--fs-base)" }}>
                  {L("ভিআইপি পয়েন্টস (VP)", "VIP Points (VP)")}
                </p>
                <p
                  className="flex items-center font-black text-[var(--neutral100)]"
                  style={{ gap: "calc(var(--u)*2.133)", fontSize: "var(--fs-h3)", marginTop: "calc(var(--u)*1.067)" }}
                >
                  <Coins size={22} className="text-[var(--primary500)]" />
                  {nf(points)}
                </p>
              </div>

              <span
                className="flex items-center font-bold"
                style={{
                  gap: "calc(var(--u)*1.6)",
                  padding: "calc(var(--u)*1.6) calc(var(--u)*3.2)",
                  borderRadius: "999px",
                  background: "color-mix(in srgb, var(--primary500), transparent 86%)",
                  color: vip?.levelColor || "var(--primary500)",
                  fontSize: "var(--fs-larger)",
                }}
              >
                <Crown size={16} />
                {isBangla ? vip?.levelName?.bn : vip?.levelName?.en}
              </span>
            </div>

            {/* XP প্রোগ্রেস */}
            <div style={{ marginTop: "calc(var(--u)*4.267)" }}>
              <div
                className="flex items-center justify-between text-[var(--text-secondary)]"
                style={{ fontSize: "var(--fs-base)", marginBottom: "calc(var(--u)*1.6)" }}
              >
                <span>XP {nf(xp)}{nextReq ? ` / ${nf(nextReq)}` : ""}</span>
                {vip?.next ? (
                  <span>{isBangla ? vip.next.name?.bn : vip.next.name?.en}</span>
                ) : (
                  <span>{L("সর্বোচ্চ লেভেল", "Max level")}</span>
                )}
              </div>
              <div
                className="w-full overflow-hidden"
                style={{ height: "calc(var(--u)*2.667)", borderRadius: "999px", background: "var(--neutral700)" }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--primary400), var(--primary500))",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── VIP ইনস্ট্যান্ট রিবেট ── */}
          <div
            className="bg-[var(--neutral800)]"
            style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*4.267)" }}
          >
            <h3
              className="font-bold text-[var(--neutral100)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {L("ভিআইপি ইনস্ট্যান্ট রিবেট", "VIP Instant Rebate")}
            </h3>
            <p
              className="text-[var(--text-muted)]"
              style={{ fontSize: "var(--fs-base)", marginTop: "calc(var(--u)*1.6)", lineHeight: 1.6 }}
            >
              {L(
                `প্রতি ${nf(ratio)} পয়েন্ট = ৳১। ন্যূনতম ${nf(minPoints)} পয়েন্ট লাগবে।`,
                `Every ${nf(ratio)} points = ৳1. Minimum ${nf(minPoints)} points required.`,
              )}
            </p>

            <div
              className="flex items-center justify-between"
              style={{ marginTop: "calc(var(--u)*3.2)", gap: "calc(var(--u)*3.2)" }}
            >
              <span className="text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-base)" }}>
                {L("রূপান্তরযোগ্য", "Convertible")}: <b className="text-[var(--primary500)]">৳{money(convertCash)}</b>
              </span>

              <button
                type="button"
                onClick={convert}
                disabled={busy || !canConvert}
                className="auth-btn auth-btn--primary flex cursor-pointer items-center justify-center transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  height: "calc(var(--u)*9.067)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                  paddingInline: "calc(var(--u)*5.333)",
                  gap: "calc(var(--u)*1.6)",
                }}
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Coins size={16} />}
                {L("রূপান্তর করুন", "Convert")}
              </button>
            </div>
          </div>

          {/* ── লিংক: আরও জানুন ── */}
          <Link
            to="/vip-detail"
            className="flex items-center justify-center font-semibold text-[var(--primary500)] transition-[filter] hover:brightness-110"
            style={{ fontSize: "var(--fs-larger)", gap: "calc(var(--u)*1.6)" }}
          >
            <Crown size={16} />
            {L("BetChokkor ভিআইপি সম্পর্কে আরও জানুন", "Learn more about BetChokkor VIP")}
          </Link>

          {/* ── আপগ্রেড হিস্ট্রি ── */}
          <div>
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: "calc(var(--u)*2.133)" }}
            >
              <h3
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {L("আপগ্রেড হিস্ট্রি", "Upgrade History")}
              </h3>
              <button
                type="button"
                onClick={load}
                className="cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
                aria-label="refresh"
              >
                <RefreshCw size={15} />
              </button>
            </div>

            {rows.length === 0 ? (
              <p className="text-[var(--text-muted)]" style={{ fontSize: "var(--fs-base)" }}>
                {L("এখনো কিছু নেই।", "Nothing yet.")}
              </p>
            ) : (
              <div className="flex flex-col" style={{ gap: "calc(var(--u)*1.6)" }}>
                {rows.map((r) => {
                  const lbl = TYPE_LABEL[r.type] || TYPE_LABEL.earn;
                  return (
                    <div
                      key={r._id}
                      className="flex items-center justify-between bg-[var(--neutral800)]"
                      style={{
                        borderRadius: "var(--radius-6)",
                        padding: "calc(var(--u)*2.667) calc(var(--u)*3.2)",
                        gap: "calc(var(--u)*2.133)",
                      }}
                    >
                      <div>
                        <p className="font-semibold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-base)" }}>
                          {L(lbl.bn, lbl.en)}
                          {r.type === "upgrade" ? ` → LV${r.levelTo}` : ""}
                        </p>
                        <p className="text-[var(--text-disabled)]" style={{ fontSize: "var(--fs-small)" }}>
                          {new Date(r.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {r.amount ? (
                          <p className="font-bold text-[var(--status-success)]" style={{ fontSize: "var(--fs-base)" }}>
                            +৳{money(r.amount)}
                          </p>
                        ) : null}
                        {r.points ? (
                          <p
                            className="font-semibold"
                            style={{ fontSize: "var(--fs-small)", color: r.points < 0 ? "var(--status-danger)" : "var(--primary500)" }}
                          >
                            {r.points > 0 ? "+" : ""}{nf(r.points)} VP
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </MemberPage>
  );
};

export default VipInfo;
