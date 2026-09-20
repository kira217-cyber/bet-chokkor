import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Palette, RotateCcw, Save } from "lucide-react";

import { api } from "../../api/axios";
import { HistoryHeader } from "../../components/HistoryBits/HistoryBits";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

/* index.css এর ডিফল্ট — গ্রুপ করে সাজানো */
const GROUPS = [
  {
    title: "Brand (gold)",
    items: [
      ["primary300", "Primary 300", "#f8e4a9"],
      ["primary400", "Primary 400", "#f0c64c"],
      ["primary500", "Primary 500 (main gold)", "#f9b901"],
      ["primary600", "Primary 600", "#e38614"],
      ["secondary500", "Secondary 500", "#e2cc94"],
      ["secondary600", "Secondary 600", "#f8d888"],
    ],
  },
  {
    title: "Neutral (surfaces & text)",
    items: [
      ["neutral100", "Neutral 100 (white/text)", "#ffffff"],
      ["neutral200", "Neutral 200", "#ebebea"],
      ["neutral300", "Neutral 300", "#cdcdcb"],
      ["neutral400", "Neutral 400 (muted text)", "#a8a8a4"],
      ["neutral500", "Neutral 500", "#7e7e77"],
      ["neutral600", "Neutral 600 (btn text)", "#4c4d48"],
      ["neutral700", "Neutral 700", "#3d3d39"],
      ["neutral800", "Neutral 800 (cards)", "#383835"],
      ["neutral900", "Neutral 900 (header/bg)", "#292926"],
      ["neutral1000", "Neutral 1000 (page bg)", "#1c1c1a"],
    ],
  },
  {
    title: "Status",
    items: [
      ["status-danger", "Danger", "#ff777c"],
      ["status-info", "Info", "#409fff"],
      ["status-pending", "Pending", "#d8a845"],
      ["status-success", "Success", "#38ba9d"],
      ["status-warning", "Warning", "#ffa05f"],
    ],
  },
];

const DEFAULTS = GROUPS.reduce((acc, g) => {
  g.items.forEach(([k, , def]) => (acc[k] = def));
  return acc;
}, {});

const ColorInput = ({ label, value, onChange }) => (
  <div>
    <label className="ad-label">{label}</label>
    <div className="mt-1 flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-[10px] border border-white/[0.1] bg-black/30 p-1"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ad-input min-w-0 flex-1"
      />
    </div>
  </div>
);

/**
 * ক্লায়েন্ট থিম — সব design token (কালার) অ্যাডমিন থেকে সেট। ডানে Live
 * Preview: form এর রঙ দিয়ে একটা মক নেভবার+কার্ড+বাটন, টাইপ করলেই বদলায়।
 * সেভ করলে পুরো client সাইটের সব পেজে বসে।
 */
const ClientTheme = () => {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [resetAsk, setResetAsk] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/theme/admin/client");
      setForm({ ...DEFAULTS, ...(data?.data?.colors || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setBusy("save");
      await api.put("/api/theme/admin/client", { active: true, colors: form });
      toast.success("Theme saved — refresh the client site to see it");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    try {
      setBusy("reset");
      await api.patch("/api/theme/admin/client/reset");
      setForm(DEFAULTS);
      setResetAsk(false);
      toast.success("Reset to defaults");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setBusy("");
    }
  };

  const c = useMemo(() => ({ ...DEFAULTS, ...form }), [form]);

  if (loading) {
    return (
      <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <HistoryHeader
        title="Client Theme"
        subtitle="Colors for the whole client site. Every page follows these tokens."
        Icon={Palette}
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
        {/* ── কালার পিকার ── */}
        <div className="flex min-w-0 flex-col gap-4">
          {GROUPS.map((g) => (
            <div key={g.title} className="ad-card">
              <h2 className="mb-4 text-[15px] font-extrabold text-[var(--neutral100)]">
                {g.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {g.items.map(([key, label]) => (
                  <ColorInput
                    key={key}
                    label={label}
                    value={c[key]}
                    onChange={(v) => set(key, v)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
              {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save theme
            </button>
            <button type="button" onClick={() => setResetAsk(true)} disabled={Boolean(busy)} className="ad-btn ad-btn--ghost">
              <RotateCcw size={16} /> Reset to defaults
            </button>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="ad-card">
            <h2 className="mb-3 text-[15px] font-extrabold text-[var(--neutral100)]">
              Live Preview
            </h2>

            <div className="overflow-hidden rounded-[14px]" style={{ background: c.neutral1000 }}>
              {/* mock navbar */}
              <div className="flex items-center justify-between px-4 py-3" style={{ background: c.neutral900 }}>
                <span className="text-[18px] font-black" style={{ color: c.primary500 }}>
                  BET CHOKKOR
                </span>
                <div className="flex gap-2">
                  <span className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold" style={{ background: c.neutral800, color: c.neutral200 }}>
                    Login
                  </span>
                  <span className="rounded-[8px] px-3 py-1.5 text-[12px] font-bold" style={{ background: c.primary500, color: c.neutral600 }}>
                    Sign Up
                  </span>
                </div>
              </div>

              {/* mock body */}
              <div className="flex flex-col gap-3 p-4">
                {/* balance-ish card */}
                <div className="flex items-center justify-between rounded-[12px] px-4 py-3" style={{ background: c.neutral800 }}>
                  <div>
                    <p className="text-[11px]" style={{ color: c.neutral400 }}>Balance</p>
                    <p className="text-[18px] font-black" style={{ color: c.primary500 }}>৳ 1,250.00</p>
                  </div>
                  <span className="rounded-[8px] px-3 py-2 text-[12px] font-bold" style={{ background: c.primary500, color: c.neutral600 }}>
                    Deposit
                  </span>
                </div>

                {/* text samples */}
                <div className="rounded-[12px] p-4" style={{ background: c.neutral800 }}>
                  <p className="text-[14px] font-bold" style={{ color: c.neutral100 }}>Heading text</p>
                  <p className="text-[13px]" style={{ color: c.neutral300 }}>Secondary paragraph text</p>
                  <p className="text-[12px]" style={{ color: c.neutral400 }}>Muted helper text</p>

                  {/* status chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["Success", c["status-success"]],
                      ["Pending", c["status-pending"]],
                      ["Danger", c["status-danger"]],
                      ["Info", c["status-info"]],
                    ].map(([label, col]) => (
                      <span
                        key={label}
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: `${col}22`, color: col }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* secondary + outline buttons */}
                <div className="flex gap-2">
                  <span className="flex-1 rounded-[10px] py-2 text-center text-[12px] font-bold" style={{ background: c.neutral700, color: c.neutral200 }}>
                    Withdraw
                  </span>
                  <span className="flex-1 rounded-[10px] py-2 text-center text-[12px] font-bold" style={{ background: c.secondary600, color: c.neutral1000 }}>
                    Promo
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[12px] text-[var(--text-disabled)]">
              This is a mock preview. Save, then refresh the client site to apply everywhere.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetAsk}
        danger
        busy={busy === "reset"}
        title="Reset theme?"
        message="All colors go back to the default gold/dark theme."
        confirmText="Reset"
        onConfirm={reset}
        onClose={() => busy !== "reset" && setResetAsk(false)}
      />
    </div>
  );
};

export default ClientTheme;
