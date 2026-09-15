import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Gift,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
} from "lucide-react";

import { api } from "../../api/axios";
import { Pager, SummaryCards, UserCell } from "../../components/HistoryBits/HistoryBits";

const money = (value) => Number(value || 0).toFixed(2);
const when = (value) => (value ? new Date(value).toLocaleString() : "—");

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

/**
 * রেফারেল প্রোগ্রাম।
 *
 * দুটো আলাদা নিয়ম, দুটোই এখান থেকে:
 *
 * ১. **কমিশন** — বন্ধু যত খেলবেন তার শতাংশ। শতাংশটা ঠিক হয় বন্ধুর
 *    মোট টার্নওভার কোন ধাপে পড়ে আর সম্পর্কটা কত দূরের (ধাপ ১ =
 *    সরাসরি বন্ধু) তা দিয়ে।
 *
 * ২. **মাইলফলক** — এক সময়কালে কতজন সক্রিয় বন্ধু এনেছেন তার থোক বোনাস।
 *
 * প্রোগ্রামটা শুরুতে বন্ধ — চালু করার আগে নিয়মগুলো দেখে নেওয়াই ভালো,
 * কারণ চালু হওয়ামাত্র প্রতিটা বাজিতে টাকা বসতে শুরু করবে।
 */
const Referral = () => {
  const [setting, setSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const [rewards, setRewards] = useState([]);
  const [meta, setMeta] = useState({});
  const [summary, setSummary] = useState({});
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");

  const load = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/api/referral/admin/setting");
      setSetting(data?.data?.setting || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    api
      .get("/api/referral/admin/setting")
      .then(({ data }) => alive && setSetting(data?.data?.setting || null))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load"),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (type !== "all") params.set("type", type);

    api
      .get(`/api/referral/admin/rewards?${params}`)
      .then(({ data }) => {
        if (!alive) return;

        setRewards(data?.data?.rows || []);
        setMeta(data?.data?.meta || {});
        setSummary(data?.data?.summary || {});
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [page, type]);

  const save = async (patch) => {
    try {
      setBusy("save");

      const { data } = await api.put("/api/referral/admin/setting", patch);

      setSetting(data?.data?.setting || null);
      toast.success("Saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const set = (path, value) => {
    setSetting((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      let node = next;

      keys.slice(0, -1).forEach((key) => {
        node = node[key];
      });

      node[keys.at(-1)] = value;
      return next;
    });
  };

  if (loading || !setting) {
    return (
      <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" />
        Loading…
      </div>
    );
  }

  const bands = setting.commissionBands || [];
  const milestones = setting.achievement?.milestones || [];

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">
            Referral Program
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            What a player earns for bringing friends in.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ad-btn ad-btn--ghost ad-btn--sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── চালু / বন্ধ ── */}
      <div className="ad-card mb-4">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--primary500)]/25 bg-[var(--primary500)]/10 text-[var(--primary500)]">
            <Gift size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
              Program status
            </h2>

            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              Once this is on, every bet a referred player makes starts paying
              their upline. Check the rules below before turning it on.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => save({ isActive: !setting.isActive })}
                className={`ad-btn ad-btn--sm ${
                  setting.isActive ? "ad-btn--primary" : "ad-btn--ghost"
                }`}
              >
                {setting.isActive ? "Running" : "Off"}
              </button>

              <button
                type="button"
                disabled={Boolean(busy)}
                onClick={() => save({ isAutoClaim: !setting.isAutoClaim })}
                className={`ad-btn ad-btn--sm ${
                  setting.isAutoClaim ? "ad-btn--primary" : "ad-btn--ghost"
                }`}
              >
                {setting.isAutoClaim
                  ? "Paid straight into balance"
                  : "Player claims it"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── কে "সক্রিয়" ── */}
      <div className="ad-card mb-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          What counts as an active friend
        </h2>

        <p className="mt-1 text-[13px] text-[var(--text-muted)]">
          Milestone bonuses only count friends who reach these. Leave both at 0
          and simply signing up is enough.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="ad-label" htmlFor="ref-min-deposit">
              Minimum deposit
            </label>
            <input
              id="ref-min-deposit"
              type="number"
              min="0"
              value={setting.activeDownline?.depositRequirement ?? 0}
              onChange={(event) =>
                set("activeDownline.depositRequirement", Number(event.target.value))
              }
              className="ad-input"
            />
          </div>

          <div>
            <label className="ad-label" htmlFor="ref-min-turnover">
              Minimum turnover
            </label>
            <input
              id="ref-min-turnover"
              type="number"
              min="0"
              value={setting.activeDownline?.turnoverRequirement ?? 0}
              onChange={(event) =>
                set("activeDownline.turnoverRequirement", Number(event.target.value))
              }
              className="ad-input"
            />
          </div>

          <div>
            <label className="ad-label" htmlFor="ref-max-tier">
              How many tiers deep
            </label>
            <input
              id="ref-max-tier"
              type="number"
              min="1"
              max="5"
              value={setting.maxTier ?? 3}
              onChange={(event) => set("maxTier", Number(event.target.value))}
              className="ad-input"
            />
          </div>
        </div>
      </div>

      {/* ── কমিশনের ধাপ ── */}
      <div className="ad-card mb-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
              Commission bands
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              The highest band a friend qualifies for is the one that pays.
              Percentages are of the bet amount.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              set("commissionBands", [
                ...bands,
                {
                  requireTurnover: 0,
                  requireDeposit: 0,
                  requireWinLoss: 0,
                  tiers: Array.from({ length: setting.maxTier || 3 }).map(
                    (_, index) => ({ tier: index + 1, percent: 0 }),
                  ),
                },
              ])
            }
            className="ad-btn ad-btn--ghost ad-btn--sm"
          >
            <Plus size={14} />
            Add band
          </button>
        </div>

        <div className="ad-table-wrap ad-scroll">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {["Turnover from", "Deposit from"]
                  .concat(
                    Array.from({ length: setting.maxTier || 3 }).map(
                      (_, index) => `Tier ${index + 1} %`,
                    ),
                  )
                  .concat([""])
                  .map((head, index) => (
                    <th
                      key={`${head}-${index}`}
                      className="px-3 py-2 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                    >
                      {head}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {bands.map((band, bandIndex) => (
                <tr key={bandIndex} className="border-b border-white/[0.05] last:border-0">
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={band.requireTurnover}
                      onChange={(event) =>
                        set(
                          `commissionBands.${bandIndex}.requireTurnover`,
                          Number(event.target.value),
                        )
                      }
                      className="ad-input h-9"
                    />
                  </td>

                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      value={band.requireDeposit}
                      onChange={(event) =>
                        set(
                          `commissionBands.${bandIndex}.requireDeposit`,
                          Number(event.target.value),
                        )
                      }
                      className="ad-input h-9"
                    />
                  </td>

                  {Array.from({ length: setting.maxTier || 3 }).map((_, index) => {
                    const tierIndex = band.tiers?.findIndex(
                      (item) => item.tier === index + 1,
                    );

                    const value =
                      tierIndex >= 0 ? band.tiers[tierIndex].percent : 0;

                    return (
                      <td key={index} className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={value}
                          onChange={(event) => {
                            const next = structuredClone(bands);
                            const tiers = next[bandIndex].tiers || [];
                            const found = tiers.findIndex(
                              (item) => item.tier === index + 1,
                            );

                            if (found >= 0) {
                              tiers[found].percent = Number(event.target.value);
                            } else {
                              tiers.push({
                                tier: index + 1,
                                percent: Number(event.target.value),
                              });
                            }

                            next[bandIndex].tiers = tiers;
                            set("commissionBands", next);
                          }}
                          className="ad-input h-9"
                        />
                      </td>
                    );
                  })}

                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "commissionBands",
                          bands.filter((_, index) => index !== bandIndex),
                        )
                      }
                      className="ad-btn ad-btn--danger ad-btn--sm"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── মাইলফলক ── */}
      <div className="ad-card mb-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
              Milestone bonus
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              A lump sum for bringing in this many active friends within one
              period.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PERIODS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => set("achievement.period", item.key)}
                className={`ad-btn ad-btn--sm ${
                  setting.achievement?.period === item.key
                    ? "ad-btn--primary"
                    : "ad-btn--ghost"
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                set("achievement.milestones", [
                  ...milestones,
                  { count: 1, amount: 0 },
                ])
              }
              className="ad-btn ad-btn--ghost ad-btn--sm"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {milestones.map((item, index) => (
            <div
              key={index}
              className="rounded-[14px] border border-white/[0.07] bg-black/20 p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="ad-label" htmlFor={`ms-count-${index}`}>
                    Invites
                  </label>
                  <input
                    id={`ms-count-${index}`}
                    type="number"
                    min="1"
                    value={item.count}
                    onChange={(event) =>
                      set(
                        `achievement.milestones.${index}.count`,
                        Number(event.target.value),
                      )
                    }
                    className="ad-input h-9"
                  />
                </div>

                <div className="flex-1">
                  <label className="ad-label" htmlFor={`ms-amount-${index}`}>
                    Bonus
                  </label>
                  <input
                    id={`ms-amount-${index}`}
                    type="number"
                    min="0"
                    value={item.amount}
                    onChange={(event) =>
                      set(
                        `achievement.milestones.${index}.amount`,
                        Number(event.target.value),
                      )
                    }
                    className="ad-input h-9"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    set(
                      "achievement.milestones",
                      milestones.filter((_, position) => position !== index),
                    )
                  }
                  className="ad-btn ad-btn--danger ad-btn--sm mt-6"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── নিয়মাবলী ── */}
      <div className="ad-card mb-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          Rules shown to players
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="ad-label" htmlFor="ref-rules-bn">
              Bangla
            </label>
            <textarea
              id="ref-rules-bn"
              rows={4}
              value={setting.rules?.bn || ""}
              onChange={(event) => set("rules.bn", event.target.value)}
              className="ad-input h-auto py-2"
            />
          </div>

          <div>
            <label className="ad-label" htmlFor="ref-rules-en">
              English
            </label>
            <textarea
              id="ref-rules-en"
              rows={4}
              value={setting.rules?.en || ""}
              onChange={(event) => set("rules.en", event.target.value)}
              className="ad-input h-auto py-2"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() =>
          save({
            maxTier: setting.maxTier,
            activeDownline: setting.activeDownline,
            commissionBands: setting.commissionBands,
            achievement: setting.achievement,
            rules: setting.rules,
          })
        }
        className="ad-btn ad-btn--primary w-full sm:w-auto"
      >
        {busy === "save" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        Save rules
      </button>

      {/* ── কে কত পেয়েছে ── */}
      <div className="mt-8">
        <h2 className="ad-title mb-4 text-[20px]">Rewards paid out</h2>

        <SummaryCards
          columns={3}
          items={[
            [
              "Waiting to be claimed",
              money(summary.claimable?.total),
              "var(--status-pending)",
              `${summary.claimable?.count || 0} entries`,
            ],
            [
              "Already claimed",
              money(summary.claimed?.total),
              "var(--status-success)",
              `${summary.claimed?.count || 0} entries`,
            ],
            ["Entries on this page", rewards.length, "var(--text-primary)"],
          ]}
        />

        <div className="ad-card mb-4 flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "All" },
            { key: "commission", label: "Commission" },
            { key: "achievement", label: "Milestone" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setType(item.key);
                setPage(1);
              }}
              className={`ad-btn ad-btn--sm ${
                type === item.key ? "ad-btn--primary" : "ad-btn--ghost"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {rewards.length === 0 ? (
          <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
            <Users size={26} className="text-[var(--text-disabled)]" />
            <p className="text-[15px] font-semibold text-[var(--neutral100)]">
              Nothing paid out yet
            </p>
          </div>
        ) : (
          <div className="ad-card ad-table-wrap ad-scroll p-0">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.07]">
                  {["When", "Player", "Type", "From", "Tier", "Basis", "Amount", "Status"].map(
                    (head) => (
                      <th
                        key={head}
                        className="px-3 py-3 text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]"
                      >
                        {head}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {rewards.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]"
                  >
                    <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                      {when(row.createdAt)}
                    </td>

                    <td className="px-3 py-3">
                      <UserCell user={row.user} userId={row.userIdText} />
                    </td>

                    <td className="px-3 py-3 text-[12px] capitalize text-[var(--text-secondary)]">
                      {row.type}
                    </td>

                    <td className="px-3 py-3 text-[13px] text-[var(--text-secondary)]">
                      {row.fromUserIdText || row.periodKey || "—"}
                    </td>

                    <td className="px-3 py-3 text-[13px] text-[var(--text-muted)]">
                      {row.tier || "—"}
                    </td>

                    <td className="px-3 py-3 text-[12px] text-[var(--text-muted)]">
                      {row.type === "commission"
                        ? `${row.percent}% × ${money(row.wager)}`
                        : `${row.milestoneCount} invites`}
                    </td>

                    <td className="px-3 py-3 text-[13px] font-bold text-[var(--status-success)]">
                      {money(row.amount)}
                    </td>

                    <td
                      className="px-3 py-3 text-[12px] font-bold uppercase"
                      style={{
                        color:
                          row.status === "claimed"
                            ? "var(--status-success)"
                            : "var(--status-pending)",
                      }}
                    >
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pager
          page={meta.page || 1}
          totalPages={meta.totalPages || 1}
          onChange={setPage}
        />
      </div>
    </div>
  );
};

export default Referral;
