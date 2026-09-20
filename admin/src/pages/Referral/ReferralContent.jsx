import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";

import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const emptyLang = () => ({ bn: "", en: "" });
const lang = (o) => ({ bn: o?.bn || "", en: o?.en || "" });

/* ছোট bn/en ইনপুট */
const LangRow = ({ label, value, onChange, textarea }) => {
  const F = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="ad-label">{label}</label>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <F className="ad-input" rows={textarea ? 3 : undefined} placeholder="Bangla"
          value={value?.bn || ""} onChange={(e) => onChange({ ...value, bn: e.target.value })} />
        <F className="ad-input" rows={textarea ? 3 : undefined} placeholder="English"
          value={value?.en || ""} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </div>
    </div>
  );
};

const ImageRow = ({ shown, onPick, onClear }) => {
  const ref = useRef(null);
  return (
    <div>
      <label className="ad-label">Image</label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">
          {shown ? <img src={shown} alt="" className="h-full w-full object-contain" /> : <ImagePlus size={18} className="text-[var(--text-disabled)]" />}
        </span>
        <button type="button" onClick={() => ref.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm"><ImagePlus size={14} /> {shown ? "Change" : "Choose"}</button>
        {shown && <button type="button" onClick={onClear} className="ad-btn ad-btn--ghost ad-btn--sm"><X size={14} /> Clear</button>}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      </div>
    </div>
  );
};

/**
 * রেফারেল ইনফো-ট্যাবের কনটেন্ট — সেকশন শিরোনাম + "কীভাবে কাজ করে"
 * ফ্লোচার্টের ধাপ (লেখা bn/en + ছবি)। রঙ member theme থেকে।
 */
const ReferralContent = () => {
  const [infoTitles, setInfoTitles] = useState({ whatIs: emptyLang(), morePrize: emptyLang() });
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/referral/admin/content");
      const d = data?.data || {};
      setInfoTitles({ whatIs: lang(d.infoTitles?.whatIs), morePrize: lang(d.infoTitles?.morePrize) });
      setSteps((d.prizeSteps || []).map((s) => ({ title: lang(s.title), text: lang(s.text), image: s.image || "", _file: null, _preview: "" })));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const patchStep = (i, fn) => setSteps((prev) => { const n = structuredClone(prev.map((s) => ({ ...s }))); fn(n[i]); return n; });
  const addStep = () => setSteps((p) => [...p, { title: emptyLang(), text: emptyLang(), image: "", _file: null, _preview: "" }]);
  const removeStep = (i) => setSteps((p) => p.filter((_, idx) => idx !== i));
  const pickStep = (i, file) => {
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, _file: file, _preview: URL.createObjectURL(file) } : s));
  };

  const save = async () => {
    const payload = { infoTitles, prizeSteps: steps.map((s) => ({ title: s.title, text: s.text, image: s.image })) };
    const form = new FormData();
    steps.forEach((s, i) => { if (s._file) form.append(`step_${i}`, s._file); });
    form.append("content", JSON.stringify(payload));
    try {
      setBusy(true);
      const { data } = await api.put("/api/referral/admin/content", form);
      toast.success("Saved");
      const d = data?.data || {};
      setInfoTitles({ whatIs: lang(d.infoTitles?.whatIs), morePrize: lang(d.infoTitles?.morePrize) });
      setSteps((d.prizeSteps || []).map((s) => ({ title: lang(s.title), text: lang(s.text), image: s.image || "", _file: null, _preview: "" })));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="ad-card mx-auto flex max-w-[1100px] items-center gap-3 text-[var(--text-muted)]"><Loader2 size={16} className="animate-spin" /> Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Referral — Info Content</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">Section titles & the “how it works” flowchart on the referral info tab. Empty falls back to defaults. Commission bands, milestones & rules: see “Referral Program”.</p>
        </div>
        <button type="button" onClick={load} className="ad-btn ad-btn--ghost ad-btn--sm"><RefreshCw size={15} /> Reload</button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <div className="ad-card flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">Section titles</h2>
            <LangRow label="“What is referral?” title" value={infoTitles.whatIs} onChange={(v) => setInfoTitles((p) => ({ ...p, whatIs: v }))} />
            <LangRow label="Flowchart title" value={infoTitles.morePrize} onChange={(v) => setInfoTitles((p) => ({ ...p, morePrize: v }))} />
          </div>

          <div className="ad-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">How it works — steps</h2>
              <button type="button" onClick={addStep} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={14} /> Step</button>
            </div>
            {steps.length === 0 && <p className="text-[13px] text-[var(--text-muted)]">No step yet — add one, or leave empty to use the built-in 3-step default.</p>}
            {steps.map((s, i) => (
              <div key={i} className="rounded-[14px] border border-white/[0.07] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[var(--neutral100)]">Step {i + 1}</p>
                  <button type="button" onClick={() => removeStep(i)} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <LangRow label="Title" value={s.title} onChange={(v) => patchStep(i, (x) => (x.title = v))} />
                  <LangRow label="Text" textarea value={s.text} onChange={(v) => patchStep(i, (x) => (x.text = v))} />
                  <ImageRow shown={s._preview || imageUrl(s.image)} onPick={(f) => pickStep(i, f)} onClear={() => patchStep(i, (x) => { x.image = ""; x._file = null; x._preview = ""; })} />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={save} disabled={busy} className="ad-btn ad-btn--primary">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save content
            </button>
          </div>
        </div>

        {/* প্রিভিউ (বাংলা) */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="ad-label mb-2">Live preview (Bangla)</p>
          <div className="rounded-[14px] p-3" style={{ background: "#292926" }}>
            <p className="text-[13px] font-bold text-white">{infoTitles.morePrize.bn || "কীভাবে কাজ করে"}</p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {(steps.length ? steps : [0, 1, 2]).map((s, i) => (
                <div key={i} className="flex gap-2 rounded-[8px] p-2" style={{ background: "#383835" }}>
                  <span className="text-[20px] font-black leading-none" style={{ color: "#ffdf1a" }}>{i + 1}</span>
                  {(s?._preview || imageUrl(s?.image)) ? <img src={s._preview || imageUrl(s.image)} alt="" className="h-10 w-10 object-contain" /> : <span className="h-10 w-10 rounded bg-white/10" />}
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white leading-tight">{s?.title?.bn || `ধাপ ${i + 1}`}</p>
                    <p className="text-[9px] text-white/60 leading-tight">{s?.text?.bn || "…"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralContent;
