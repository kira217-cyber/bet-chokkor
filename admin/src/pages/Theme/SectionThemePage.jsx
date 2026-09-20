import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Palette, RotateCcw, Save } from "lucide-react";

import { api } from "../../api/axios";
import { HistoryHeader } from "../../components/HistoryBits/HistoryBits";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

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
 * এক সেকশনের থিম পেজের সাধারণ কাঠামো — যেকোনো সেকশনে ব্যবহারযোগ্য।
 *
 * props:
 *  - scope: "client/navbar" এর মতো (API path)
 *  - title/subtitle
 *  - tokens: [[key,label,default], …]
 *  - renderPreview(c): বর্তমান রঙ দিয়ে Live Preview (c = default+form মেশানো)
 */
const SectionThemePage = ({ scope, title, subtitle, tokens, renderPreview }) => {
  const DEFAULTS = tokens.reduce((a, [k, , d]) => ({ ...a, [k]: d }), {});

  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [resetAsk, setResetAsk] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const c = { ...DEFAULTS, ...form };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/theme/admin/section/${scope}`);
      setForm({ ...DEFAULTS, ...(data?.data?.colors || {}) });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const save = async () => {
    try {
      setBusy("save");
      await api.put(`/api/theme/admin/section/${scope}`, { colors: form });
      toast.success("Saved — refresh the client site to apply");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const reset = async () => {
    try {
      setBusy("reset");
      await api.patch(`/api/theme/admin/section/${scope}/reset`);
      setForm(DEFAULTS);
      setResetAsk(false);
      toast.success("Reset to base theme");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setBusy("");
    }
  };

  if (loading) {
    return (
      <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <HistoryHeader title={title} subtitle={subtitle} Icon={Palette} />

      <div className="grid gap-5 lg:grid-cols-[1fr_460px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="ad-card grid gap-4 sm:grid-cols-2">
            {tokens.map(([key, label]) => (
              <ColorInput key={key} label={label} value={c[key]} onChange={(v) => set(key, v)} />
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={save} disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
              {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
            <button type="button" onClick={() => setResetAsk(true)} disabled={Boolean(busy)} className="ad-btn ad-btn--ghost">
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
          <div className="ad-card">
            <h2 className="mb-3 text-[15px] font-extrabold text-[var(--neutral100)]">Live Preview</h2>
            {renderPreview(c)}
            <p className="mt-3 text-[12px] text-[var(--text-disabled)]">
              Save, then refresh the client site. Unset colors follow the base theme.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={resetAsk}
        danger
        busy={busy === "reset"}
        title="Reset this section?"
        message="These colors go back to the base theme."
        confirmText="Reset"
        onConfirm={reset}
        onClose={() => busy !== "reset" && setResetAsk(false)}
      />
    </div>
  );
};

export default SectionThemePage;
