import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Save, Settings, X } from "lucide-react";

import { api } from "../../api/axios";
import { HistoryHeader } from "../../components/HistoryBits/HistoryBits";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const blank = {
  active: true,
  xpPerTurnover: 1,
  pointPerTurnover: 0.1,
  convertRatio: 400,
  minConvertPoints: 4000,
  convertTurnoverMultiplier: 0,
  titleBn: "",
  titleEn: "",
  subtitleBn: "",
  subtitleEn: "",
  descBn: "",
  descEn: "",
  tipsBn: "",
  tipsEn: "",
  dykBn: "",
  dykEn: "",
  bannerDesktop: "",
  bannerMobile: "",
};

/**
 * VIP সেটিং (অ্যাডমিন) — আর্নিং রেট, পয়েন্ট→ক্যাশ রূপান্তরের হার,
 * VIP ক্লাব পেজের শিরোনাম/বিবরণ ও ব্যানার। পুরো সিস্টেম অন/অফ এখান থেকে।
 */
const VipSettings = () => {
  const [draft, setDraft] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const deskRef = useRef(null);
  const mobRef = useRef(null);

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/vip/admin/setting");
      const s = data?.data?.setting || {};
      setDraft({
        active: s.active !== false,
        xpPerTurnover: s.xpPerTurnover ?? 1,
        pointPerTurnover: s.pointPerTurnover ?? 0.1,
        convertRatio: s.convertRatio ?? 400,
        minConvertPoints: s.minConvertPoints ?? 4000,
        convertTurnoverMultiplier: s.convertTurnoverMultiplier ?? 0,
        titleBn: s.title?.bn || "",
        titleEn: s.title?.en || "",
        subtitleBn: s.subtitle?.bn || "",
        subtitleEn: s.subtitle?.en || "",
        descBn: s.description?.bn || "",
        descEn: s.description?.en || "",
        tipsBn: s.tips?.bn || "",
        tipsEn: s.tips?.en || "",
        dykBn: s.didYouKnow?.bn || "",
        dykEn: s.didYouKnow?.en || "",
        bannerDesktop: s.bannerDesktop || "",
        bannerMobile: s.bannerMobile || "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const upload = async (file, key) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    try {
      setBusy(key);
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/api/vip/admin/upload", form);
      set(key, data?.data?.url || "");
      toast.success("Uploaded");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    try {
      setBusy("save");
      await api.put("/api/vip/admin/setting", {
        active: draft.active,
        xpPerTurnover: Number(draft.xpPerTurnover) || 0,
        pointPerTurnover: Number(draft.pointPerTurnover) || 0,
        convertRatio: Number(draft.convertRatio) || 1,
        minConvertPoints: Number(draft.minConvertPoints) || 0,
        convertTurnoverMultiplier: Number(draft.convertTurnoverMultiplier) || 0,
        title: { bn: draft.titleBn, en: draft.titleEn },
        subtitle: { bn: draft.subtitleBn, en: draft.subtitleEn },
        description: { bn: draft.descBn, en: draft.descEn },
        tips: { bn: draft.tipsBn, en: draft.tipsEn },
        didYouKnow: { bn: draft.dykBn, en: draft.dykEn },
        bannerDesktop: draft.bannerDesktop,
        bannerMobile: draft.bannerMobile,
      });
      toast.success("Saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const Banner = ({ label, size, k, inputRef }) => (
    <div className="rounded-[14px] border border-white/[0.07] p-4">
      <label className="ad-label">
        {label} <span className="text-[var(--text-disabled)]">({size})</span>
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="flex h-16 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/30">
          {draft[k] ? (
            <img src={imageUrl(draft[k])} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-[var(--text-disabled)]" />
          )}
        </span>
        <button type="button" onClick={() => inputRef.current?.click()} disabled={busy === k} className="ad-btn ad-btn--ghost ad-btn--sm">
          {busy === k ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {draft[k] ? "Change" : "Choose"}
        </button>
        {draft[k] ? (
          <button type="button" onClick={() => set(k, "")} className="ad-btn ad-btn--danger ad-btn--sm">
            <X size={14} />
          </button>
        ) : null}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0], k)} />
    </div>
  );

  if (loading) {
    return (
      <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <HistoryHeader title="VIP Settings" subtitle="Earning rates, point conversion and the VIP club page." Icon={Settings} />

      <div className="ad-card mb-4 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-[var(--neutral100)]">VIP program</p>
          <p className="text-[13px] text-[var(--text-muted)]">Off = no points earned and the client VIP area is hidden.</p>
        </div>
        <button
          type="button"
          onClick={() => set("active", !draft.active)}
          className="ad-btn ad-btn--sm"
          style={{
            color: draft.active ? "var(--status-success)" : "var(--status-danger)",
            borderColor: draft.active
              ? "color-mix(in srgb, var(--status-success), transparent 60%)"
              : "color-mix(in srgb, var(--status-danger), transparent 60%)",
          }}
        >
          {draft.active ? "Active" : "Off"}
        </button>
      </div>

      <div className="ad-card mb-4">
        <h2 className="mb-4 text-[16px] font-extrabold text-[var(--neutral100)]">Earning & conversion</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="XP per ৳1 turnover"><input type="number" step="0.001" min="0" value={draft.xpPerTurnover} onChange={(e) => set("xpPerTurnover", e.target.value)} className="ad-input" /></Field>
          <Field label="VIP points per ৳1 turnover"><input type="number" step="0.001" min="0" value={draft.pointPerTurnover} onChange={(e) => set("pointPerTurnover", e.target.value)} className="ad-input" /></Field>
          <Field label="Points per ৳1 (convert ratio)"><input type="number" step="1" min="1" value={draft.convertRatio} onChange={(e) => set("convertRatio", e.target.value)} className="ad-input" /></Field>
          <Field label="Minimum points to convert"><input type="number" step="1" min="0" value={draft.minConvertPoints} onChange={(e) => set("minConvertPoints", e.target.value)} className="ad-input" /></Field>
          <Field label="Turnover × on converted cash"><input type="number" step="0.1" min="0" value={draft.convertTurnoverMultiplier} onChange={(e) => set("convertTurnoverMultiplier", e.target.value)} className="ad-input" /></Field>
        </div>
      </div>

      <div className="ad-card mb-4">
        <h2 className="mb-4 text-[16px] font-extrabold text-[var(--neutral100)]">VIP club page</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title (Bangla)"><input value={draft.titleBn} onChange={(e) => set("titleBn", e.target.value)} placeholder="ভিআইপি ক্লাব" className="ad-input" /></Field>
          <Field label="Title (English)"><input value={draft.titleEn} onChange={(e) => set("titleEn", e.target.value)} placeholder="VIP Club" className="ad-input" /></Field>
          <Field label="Subtitle (Bangla)"><input value={draft.subtitleBn} onChange={(e) => set("subtitleBn", e.target.value)} className="ad-input" /></Field>
          <Field label="Subtitle (English)"><input value={draft.subtitleEn} onChange={(e) => set("subtitleEn", e.target.value)} className="ad-input" /></Field>
          <Field label="Description (Bangla)"><textarea rows={3} value={draft.descBn} onChange={(e) => set("descBn", e.target.value)} className="ad-input" /></Field>
          <Field label="Description (English)"><textarea rows={3} value={draft.descEn} onChange={(e) => set("descEn", e.target.value)} className="ad-input" /></Field>
          <Field label="Quick tips (Bangla, one per line)"><textarea rows={3} value={draft.tipsBn} onChange={(e) => set("tipsBn", e.target.value)} className="ad-input" /></Field>
          <Field label="Quick tips (English, one per line)"><textarea rows={3} value={draft.tipsEn} onChange={(e) => set("tipsEn", e.target.value)} className="ad-input" /></Field>
          <Field label="Did you know (Bangla)"><textarea rows={2} value={draft.dykBn} onChange={(e) => set("dykBn", e.target.value)} className="ad-input" /></Field>
          <Field label="Did you know (English)"><textarea rows={2} value={draft.dykEn} onChange={(e) => set("dykEn", e.target.value)} className="ad-input" /></Field>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Banner label="Banner (Desktop)" size="1200 × 320 px" k="bannerDesktop" inputRef={deskRef} />
          <Banner label="Banner (Mobile)" size="720 × 320 px" k="bannerMobile" inputRef={mobRef} />
        </div>
      </div>

      <button type="button" onClick={save} disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
        {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save settings
      </button>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="ad-label">{label}</label>
    {children}
  </div>
);

export default VipSettings;
