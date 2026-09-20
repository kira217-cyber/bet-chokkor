import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronLeft, Crown, Loader2 } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { fetchVipLevels } from "../../features/vip/vipApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
/* /vip/... পাবলিক অ্যাসেট (ক্লায়েন্ট), /uploads/... সার্ভার থেকে */
const asset = (u) =>
  !u ? "" : u.startsWith("http") ? u : u.startsWith("/uploads") ? `${API_URL}${u}` : u;

const nf = (n) => Math.floor(Number(n || 0)).toLocaleString("en-IN");

/**
 * ভিআইপি বিবরণ (vip-detail) — মূল সাইটের হুবহু।
 *
 * হিরো ব্যানার → ৭ টিয়ার ব্যাজ সিলেক্টর → সিলেক্টেড টিয়ারের VE ও
 * বেনিফিট কার্ড → পয়েন্ট অর্জনের টেবিল → টিপস। সব অ্যাডমিন-নিয়ন্ত্রিত।
 */
const VipDetail = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();
  const L = (bn, en) => (isBangla ? bn : en);
  const tv = (o) => (isBangla ? o?.bn : o?.en) || o?.en || o?.bn || "";

  const [levels, setLevels] = useState([]);
  const [setting, setSetting] = useState({});
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(0);

  // অ্যাডমিন লেবেল, নইলে স্ট্যাটিক fallback
  const lbl = (key, bn, en) => tv(setting.labels?.[key]) || L(bn, en);

  useEffect(() => {
    let alive = true;
    fetchVipLevels()
      .then((data) => {
        if (!alive) return;
        setLevels(data.levels || []);
        setSetting(data.setting || {});
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // ব্যাজওয়ালা টিয়ারগুলোই সিলেক্টরে (Normal বেস বাদ)
  const tiers = useMemo(
    () => (levels || []).filter((l) => l.badge).sort((a, b) => a.lv - b.lv),
    [levels],
  );
  const tier = tiers[sel] || tiers[0] || null;
  const benefits = setting.benefits || [];
  const earnRates = setting.earnRates || [];
  const tipsLines = (tv(setting.tips) || "").split("\n").filter(Boolean);
  const unlockedCount =
    tier && Number.isFinite(Number(tier.benefitCount))
      ? Number(tier.benefitCount)
      : benefits.length;

  // আনলকড হলে সবুজ বৃত্ত+চেক, নাহলে ধূসর ফাঁকা বৃত্ত (মূল সাইটের মতো)
  const StatusDot = ({ on }) =>
    on ? (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{
          height: "calc(var(--u)*5.333)",
          width: "calc(var(--u)*5.333)",
          background: "var(--status-success)",
        }}
      >
        <Check size={13} className="text-white" strokeWidth={3} />
      </span>
    ) : (
      <span
        className="shrink-0 rounded-full"
        style={{
          height: "calc(var(--u)*5.333)",
          width: "calc(var(--u)*5.333)",
          border: "1.5px solid var(--neutral600)",
          background: "color-mix(in srgb, var(--neutral100), transparent 94%)",
        }}
      />
    );

  return (
    <div
      className="bc-page"
      style={{ paddingBlock: "calc(var(--u)*4.267)", paddingInline: "calc(var(--u)*4.267)" }}
    >
      {/* ── হেডার ── */}
      <div className="flex items-center" style={{ gap: "calc(var(--u)*2.667)", marginBottom: "calc(var(--u)*4.267)" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="back"
          className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] transition-[filter] hover:brightness-110"
          style={{ height: "calc(var(--u)*8.533)", width: "calc(var(--u)*8.533)", borderRadius: "999px" }}
        >
          <ChevronLeft size={18} className="text-[var(--neutral100)]" />
        </button>
        <h1 className="font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-h4)" }}>
          {lbl("pageTitle", "ভিআইপি বিবরণ", "VIP Details")}
        </h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center text-[var(--text-muted)]" style={{ gap: "calc(var(--u)*2.133)", paddingBlock: "calc(var(--u)*12)" }}>
          <Loader2 size={18} className="animate-spin" />
          {L("লোড হচ্ছে…", "Loading…")}
        </div>
      ) : (
        <>
          {/* ── হিরো ── */}
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: "var(--radius-10)",
              padding: "calc(var(--u)*6.4) calc(var(--u)*5.333)",
              background:
                "linear-gradient(115deg, #14151a 0%, #1c1f27 45%, #2a2f3a 75%, #3a4150 100%)",
              marginBottom: "calc(var(--u)*4.267)",
            }}
          >
            {/* ডান-উপরে চওড়া বাঁকানো আলো (মূল সাইটের মতো) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 120% at 88% -10%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 26%, transparent 52%)",
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(118deg, transparent 46%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0.13) 70%, rgba(255,255,255,0.05) 79%, transparent 90%)",
              }}
            />

            <h2 className="relative font-black text-[var(--primary500)]" style={{ fontSize: "var(--fs-h4)" }}>
              {tv(setting.title) || "BetChokkor VIP Club"}
            </h2>
            <p className="relative mt-1 font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-larger)" }}>
              {tv(setting.subtitle)}
            </p>
            <p
              className="relative mt-3 max-w-[640px] whitespace-pre-line text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-base)", lineHeight: 1.7 }}
            >
              {tv(setting.description)}
            </p>
          </div>

          {/* ── টিয়ার সিলেক্টর ── */}
          <div
            className="no-scrollbar flex overflow-x-auto bg-[var(--neutral900)]"
            style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*3.2)", gap: "calc(var(--u)*2.133)", marginBottom: "calc(var(--u)*4.267)" }}
          >
            {tiers.map((t, i) => {
              const on = i === sel;
              return (
                <button
                  key={t._id || t.lv}
                  type="button"
                  onClick={() => setSel(i)}
                  className="flex shrink-0 cursor-pointer flex-col items-center justify-end transition-[filter] hover:brightness-110"
                  style={{
                    width: "calc(var(--u)*24)",
                    padding: "calc(var(--u)*2.133) calc(var(--u)*1.6)",
                    borderRadius: "var(--radius-10)",
                    background: on
                      ? "linear-gradient(180deg, color-mix(in srgb, var(--neutral100), transparent 92%), var(--neutral800))"
                      : "transparent",
                    border: on
                      ? "1.5px solid color-mix(in srgb, var(--neutral100), transparent 45%)"
                      : "1px solid transparent",
                    boxShadow: on
                      ? "0 0 22px rgba(255,255,255,0.22), inset 0 0 26px rgba(255,255,255,0.08)"
                      : "none",
                  }}
                >
                  <img
                    src={asset(t.badge)}
                    alt=""
                    className="object-contain"
                    style={{
                      height: "calc(var(--u)*16)",
                      filter: on
                        ? "drop-shadow(0 4px 14px rgba(255,255,255,0.28))"
                        : "none",
                    }}
                    draggable="false"
                  />
                  <span
                    className="mt-1 text-center font-bold uppercase"
                    style={{
                      fontSize: "var(--fs-small)",
                      color: on
                        ? "var(--neutral100)"
                        : "color-mix(in srgb, var(--primary500), transparent 42%)",
                      lineHeight: 1.2,
                    }}
                  >
                    {tv(t.name)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── সিলেক্টেড টিয়ার ── */}
          {tier ? (
            <>
              <div className="flex flex-wrap items-center" style={{ gap: "calc(var(--u)*2.133)", marginBottom: "calc(var(--u)*1.067)" }}>
                <span className="flex items-center font-black text-[var(--neutral100)]" style={{ gap: "calc(var(--u)*1.6)", fontSize: "var(--fs-h5)" }}>
                  {tv(tier.name)}
                  <Crown size={18} className="text-[var(--primary500)]" />
                </span>
                {tier.inviteOnly ? (
                  <span className="text-[var(--primary500)]" style={{ fontSize: "var(--fs-small)" }}>
                    {lbl("inviteOnly", "*শুধুমাত্র ইনভাইটেশনের মাধ্যমে", "*By invitation only")}
                  </span>
                ) : null}
              </div>
              <p className="font-bold text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u)*3.2)" }}>
                {nf(tier.xpRequired)} VE
              </p>

              {/* বেনিফিট কার্ড */}
              <div className="flex flex-col" style={{ gap: "calc(var(--u)*2.133)", marginBottom: "calc(var(--u)*5.333)" }}>
                {benefits.map((bnf, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[var(--neutral800)]"
                    style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*3.2) calc(var(--u)*3.733)", gap: "calc(var(--u)*3.2)" }}
                  >
                    <div className="flex min-w-0 items-center" style={{ gap: "calc(var(--u)*3.2)" }}>
                      {bnf.icon ? (
                        <img src={asset(bnf.icon)} alt="" className="shrink-0 object-contain" style={{ height: "calc(var(--u)*10.667)", width: "calc(var(--u)*10.667)" }} draggable="false" />
                      ) : null}
                      <div className="min-w-0">
                        <p className="font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-base)" }}>
                          {tv(bnf.title)}
                        </p>
                        <p className="text-[var(--text-muted)]" style={{ fontSize: "var(--fs-small)", marginTop: "calc(var(--u)*0.5)" }}>
                          {i === 0
                            ? lbl(
                                "convertLine",
                                "{ratio} VP = ১ BDT কনভার্সন",
                                "{ratio} VP = 1 BDT conversion",
                              ).replace("{ratio}", nf(tier.convertRatio))
                            : tv(bnf.desc)}
                        </p>
                      </div>
                    </div>

                    {/* স্ট্যাটাস — আনলকড হলে সবুজ চেক, নাহলে ধূসর বৃত্ত */}
                    {i === 0 ? (
                      <div className="flex shrink-0 items-center" style={{ gap: "calc(var(--u)*1.333)" }}>
                        <span className="flex items-center font-bold text-[var(--neutral100)]" style={{ gap: "calc(var(--u)*0.8)", fontSize: "var(--fs-small)" }}>
                          <img src={asset("/vip/vp.png")} alt="VP" style={{ height: "calc(var(--u)*4.267)" }} />
                          {nf(tier.convertRatio)}
                        </span>
                        <span className="text-[var(--text-muted)]">→</span>
                        <span className="flex items-center font-bold text-[var(--neutral100)]" style={{ gap: "calc(var(--u)*0.8)", fontSize: "var(--fs-small)" }}>
                          <img src={asset("/vip/bdt.png")} alt="BDT" style={{ height: "calc(var(--u)*4.267)" }} />
                          1
                        </span>
                        <StatusDot on={i < unlockedCount} />
                      </div>
                    ) : (
                      <StatusDot on={i < unlockedCount} />
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : null}

          {/* ── পয়েন্ট অর্জনের টেবিল ── */}
          {earnRates.length ? (
            <div className="bg-[var(--neutral900)]" style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*4.267)", marginBottom: "calc(var(--u)*4.267)" }}>
              <h3 className="font-bold text-[var(--primary500)]" style={{ fontSize: "var(--fs-larger)" }}>
                {lbl("earnTitle", "উচ্চতর মাল্টিপ্লায়ার, অসাধারণ রিওয়ার্ড", "Higher multipliers, greater rewards")}
              </h3>
              <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-base)", lineHeight: 1.7, marginTop: "calc(var(--u)*1.6)", marginBottom: "calc(var(--u)*3.2)" }}>
                {lbl(
                  "earnText",
                  "স্লট, ফিশিং এবং ক্রাশ গেমের মাধ্যমে প্রতিটি টাকায় সর্বোচ্চ ভিআইপি পয়েন্ট অর্জন করুন— আরও বেশি খেলুন এবং ভিআইপি টিয়ারে দ্রুত উপরে উঠুন।",
                  "Earn the most VIP points per taka on Slots, Fishing and Crash — play more and climb the VIP tiers faster.",
                )}
              </p>

              <div className="overflow-hidden" style={{ borderRadius: "var(--radius-6)", border: "1px solid var(--neutral700)" }}>
                <div className="grid" style={{ gridTemplateColumns: "1.4fr 1fr 1fr", background: "var(--neutral800)" }}>
                  {[
                    lbl("colProduct", "প্রোডাক্ট টাইপ", "Product"),
                    lbl("colTurnover", "টার্নওভার (BDT)", "Turnover (BDT)"),
                    lbl("colPoints", "পয়েন্ট (VP)", "Points (VP)"),
                  ].map((h, i) => (
                    <div key={h} className="font-bold text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-small)", padding: "calc(var(--u)*2.133) calc(var(--u)*2.667)", textAlign: i === 0 ? "left" : "center" }}>
                      {h}
                    </div>
                  ))}
                </div>
                {earnRates.map((r, i) => (
                  <div key={i} className="grid items-center" style={{ gridTemplateColumns: "1.4fr 1fr 1fr", borderTop: "1px solid var(--neutral700)" }}>
                    <div className="flex items-center" style={{ gap: "calc(var(--u)*2.133)", padding: "calc(var(--u)*2.133) calc(var(--u)*2.667)" }}>
                      {r.icon ? <img src={asset(r.icon)} alt="" style={{ height: "calc(var(--u)*6.4)", width: "calc(var(--u)*6.4)" }} className="object-contain" /> : null}
                      <span className="font-semibold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-base)" }}>{tv(r.name)}</span>
                    </div>
                    <div className="text-center text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-base)" }}>{r.turnover}</div>
                    <div className="text-center font-bold text-[var(--primary500)]" style={{ fontSize: "var(--fs-base)" }}>{r.vp}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* ── টিপস + জানতেন কি ── */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tipsLines.length ? (
              <div className="bg-[var(--neutral800)]" style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*4.267)" }}>
                <p className="font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u)*2.133)" }}>
                  🎯 {lbl("tipsLabel", "কুইক টিপস", "Quick Tips")}
                </p>
                <ul className="flex flex-col" style={{ gap: "calc(var(--u)*1.6)" }}>
                  {tipsLines.map((line, i) => (
                    <li key={i} className="flex items-start text-[var(--text-secondary)]" style={{ gap: "calc(var(--u)*1.6)", fontSize: "var(--fs-base)", lineHeight: 1.6 }}>
                      <Check size={14} className="mt-1 shrink-0 text-[var(--primary500)]" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tv(setting.didYouKnow) ? (
              <div className="bg-[var(--neutral800)]" style={{ borderRadius: "var(--radius-10)", padding: "calc(var(--u)*4.267)" }}>
                <p className="font-bold text-[var(--neutral100)]" style={{ fontSize: "var(--fs-larger)", marginBottom: "calc(var(--u)*2.133)" }}>
                  💡 {lbl("didYouKnowLabel", "আপনি কি জানেন?", "Did you know?")}
                </p>
                <p className="text-[var(--text-secondary)]" style={{ fontSize: "var(--fs-base)", lineHeight: 1.7 }}>
                  {tv(setting.didYouKnow)}
                </p>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default VipDetail;
