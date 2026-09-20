import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ImagePlus, Loader2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";

import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const L = () => ({ en: "", bn: "" });
const lang = (o) => ({ en: o?.en || "", bn: o?.bn || "" });

const UI_LABELS = [
  ["brand", "Brand name"],
  ["heroTitle", "Hero title"],
  ["heroText", "Hero text"],
  ["helpLead", "Help lead (before word)"],
  ["helpWord", "Help word (highlighted)"],
  ["helpTail", "Help tail (after word)"],
  ["searchPlaceholder", "Search placeholder"],
  ["quickLinks", "Footer: Quick Links heading"],
  ["information", "Footer: Information heading"],
  ["footerAbout", "Footer about text"],
  ["topicsHeading", "Topics heading"],
  ["copyright", "Copyright text"],
];
const UI_KEYS = UI_LABELS.map(([k]) => k);

const emptyLegalPage = () => ({ title: L(), bodyEn: "", bodyBn: "" });

const emptyContent = () => ({
  identity: { logo: "", footerBg: "" },
  ui: Object.fromEntries(UI_KEYS.map((k) => [k, L()])),
  topics: [],
  footerQuick: [],
  footerInfo: [],
  legal: { terms: emptyLegalPage(), privacy: emptyLegalPage() },
});

const legalPageFrom = (p = {}) => ({
  title: lang(p.title),
  bodyEn: (p.body?.en || []).join("\n"),
  bodyBn: (p.body?.bn || []).join("\n"),
});

const normalize = (c = {}) => ({
  identity: { logo: c.identity?.logo || "", footerBg: c.identity?.footerBg || "" },
  ui: Object.fromEntries(UI_KEYS.map((k) => [k, lang(c.ui?.[k])])),
  topics: (c.topics || []).map((t) => ({
    key: t.key || "", icon: t.icon || "", name: lang(t.name),
    faqs: (t.faqs || []).map((f) => ({ q: lang(f.q), a: lang(f.a) })),
  })),
  footerQuick: (c.footerQuick || []).map((l) => ({ en: l.en || "", bn: l.bn || "", to: l.to || "" })),
  footerInfo: (c.footerInfo || []).map((l) => ({ en: l.en || "", bn: l.bn || "", to: l.to || "" })),
  legal: { terms: legalPageFrom(c.legal?.terms), privacy: legalPageFrom(c.legal?.privacy) },
});

const LangRow = ({ label, value, onChange, textarea }) => {
  const F = textarea ? "textarea" : "input";
  return (
    <div>
      {label && <label className="ad-label">{label}</label>}
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <F className="ad-input" rows={textarea ? 2 : undefined} placeholder="English" value={value?.en || ""} onChange={(e) => onChange({ ...value, en: e.target.value })} />
        <F className="ad-input" rows={textarea ? 2 : undefined} placeholder="Bangla" value={value?.bn || ""} onChange={(e) => onChange({ ...value, bn: e.target.value })} />
      </div>
    </div>
  );
};

const Card = ({ title, action, children }) => (
  <div className="ad-card flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const LinkList = ({ label, items, onAdd, onRemove, onChange }) => (
  <Card title={label} action={<button type="button" onClick={onAdd} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={14} /> Link</button>}>
    {items.map((l, i) => (
      <div key={i} className="grid gap-2 rounded-[12px] border border-white/[0.07] p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
        <input className="ad-input" placeholder="English" value={l.en} onChange={(e) => onChange(i, { ...l, en: e.target.value })} />
        <input className="ad-input" placeholder="Bangla" value={l.bn} onChange={(e) => onChange(i, { ...l, bn: e.target.value })} />
        <input className="ad-input" placeholder="/path" value={l.to} onChange={(e) => onChange(i, { ...l, to: e.target.value })} />
        <button type="button" onClick={() => onRemove(i)} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
      </div>
    ))}
  </Card>
);

/**
 * হেল্প সাইটের কনটেন্ট — UI লেখা (en/bn), টপিক (FAQ), ফুটার লিংক ও
 * দুটো ছবি (হেডার লোগো, ফুটার bg)। রঙ আলাদা: "Help Theme" পেজ।
 */
const HelpContentPage = () => {
  const [c, setC] = useState(emptyContent());
  const [imgs, setImgs] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const logoRef = useRef(null);
  const bgRef = useRef(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/help-content/admin");
      setC(normalize(data?.data || {}));
      setImgs({});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const patch = (fn) => setC((prev) => { const n = structuredClone(prev); fn(n); return n; });
  const pickImg = (slot, f) => {
    if (!f.type.startsWith("image/")) return toast.error("Choose an image");
    if (f.size > 6 * 1024 * 1024) return toast.error("Max 6MB");
    setImgs((p) => ({ ...p, [slot]: { file: f, preview: URL.createObjectURL(f) } }));
  };
  const shown = (slot, url) => imgs[slot]?.preview || imageUrl(url);

  const save = async () => {
    // legal: textarea (newline) → প্যারার তালিকা
    const legalOut = (p) => ({
      title: p.title,
      body: {
        en: p.bodyEn.split("\n").map((s) => s.trim()).filter(Boolean),
        bn: p.bodyBn.split("\n").map((s) => s.trim()).filter(Boolean),
      },
    });
    const payload = {
      ...c,
      legal: { terms: legalOut(c.legal.terms), privacy: legalOut(c.legal.privacy) },
    };

    const form = new FormData();
    if (imgs.logo?.file) form.append("logo", imgs.logo.file);
    if (imgs.footerBg?.file) form.append("footerBg", imgs.footerBg.file);
    form.append("content", JSON.stringify(payload));
    try {
      setBusy(true);
      const { data } = await api.put("/api/help-content/admin", form);
      toast.success("Saved");
      setC(normalize(data?.data || {}));
      setImgs({});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="ad-card mx-auto flex max-w-[1000px] items-center gap-3 text-[var(--text-muted)]"><Loader2 size={16} className="animate-spin" /> Loading…</div>;

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Help Site — Content</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">Text, topics, footer links & images of the help site. Empty falls back to defaults. Colors: “Help Theme”.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={load} className="ad-btn ad-btn--ghost ad-btn--sm"><RefreshCw size={15} /> Reload</button>
          <button type="button" onClick={save} disabled={busy} className="ad-btn ad-btn--primary ad-btn--sm">{busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save</button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <Card title="Images">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="ad-label">Header / footer logo</label>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">{shown("logo", c.identity.logo) ? <img src={shown("logo", c.identity.logo)} alt="" className="h-full w-full object-contain" /> : <ImagePlus size={16} className="text-[var(--text-disabled)]" />}</span>
                <button type="button" onClick={() => logoRef.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm"><ImagePlus size={14} /> Choose</button>
                {shown("logo", c.identity.logo) && <button type="button" onClick={() => { setImgs((p) => { const n = { ...p }; delete n.logo; return n; }); patch((n) => (n.identity.logo = "")); }} className="ad-btn ad-btn--ghost ad-btn--sm"><X size={14} /></button>}
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImg("logo", f); e.target.value = ""; }} />
              </div>
            </div>
            <div>
              <label className="ad-label">Footer background</label>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex h-14 w-24 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">{shown("footerBg", c.identity.footerBg) ? <img src={shown("footerBg", c.identity.footerBg)} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={16} className="text-[var(--text-disabled)]" />}</span>
                <button type="button" onClick={() => bgRef.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm"><ImagePlus size={14} /> Choose</button>
                {shown("footerBg", c.identity.footerBg) && <button type="button" onClick={() => { setImgs((p) => { const n = { ...p }; delete n.footerBg; return n; }); patch((n) => (n.identity.footerBg = "")); }} className="ad-btn ad-btn--ghost ad-btn--sm"><X size={14} /></button>}
                <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) pickImg("footerBg", f); e.target.value = ""; }} />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Text / labels">
          {UI_LABELS.map(([key, label]) => (
            <LangRow key={key} label={label} value={c.ui[key]} textarea={key === "heroText" || key === "footerAbout"} onChange={(v) => patch((n) => (n.ui[key] = v))} />
          ))}
        </Card>

        <Card title="Topics (FAQ)" action={<button type="button" onClick={() => patch((n) => n.topics.push({ key: "", icon: "", name: L(), faqs: [] }))} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={14} /> Topic</button>}>
          {c.topics.map((t, ti) => (
            <div key={ti} className="rounded-[14px] border border-white/[0.09] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-bold text-[var(--neutral100)]">Topic {ti + 1}</p>
                <button type="button" onClick={() => patch((n) => n.topics.splice(ti, 1))} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <input className="ad-input" placeholder="key (e.g. account)" value={t.key} onChange={(e) => patch((n) => (n.topics[ti].key = e.target.value))} />
                <input className="ad-input" placeholder="icon (e.g. user)" value={t.icon} onChange={(e) => patch((n) => (n.topics[ti].icon = e.target.value))} />
              </div>
              <div className="mt-2"><LangRow label="Name" value={t.name} onChange={(v) => patch((n) => (n.topics[ti].name = v))} /></div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[12px] font-semibold text-[var(--text-muted)]">FAQs</p>
                <button type="button" onClick={() => patch((n) => n.topics[ti].faqs.push({ q: L(), a: L() }))} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={13} /> Q&A</button>
              </div>
              {t.faqs.map((f, fi) => (
                <div key={fi} className="mt-2 rounded-[10px] border border-white/[0.06] p-3">
                  <div className="mb-2 flex items-center justify-between"><span className="text-[11px] text-[var(--text-disabled)]">Q{fi + 1}</span><button type="button" onClick={() => patch((n) => n.topics[ti].faqs.splice(fi, 1))} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={12} /></button></div>
                  <LangRow label="Question" value={f.q} onChange={(v) => patch((n) => (n.topics[ti].faqs[fi].q = v))} />
                  <div className="mt-2"><LangRow label="Answer" textarea value={f.a} onChange={(v) => patch((n) => (n.topics[ti].faqs[fi].a = v))} /></div>
                </div>
              ))}
            </div>
          ))}
        </Card>

        <LinkList label="Footer — Quick Links" items={c.footerQuick}
          onAdd={() => patch((n) => n.footerQuick.push({ en: "", bn: "", to: "" }))}
          onRemove={(i) => patch((n) => n.footerQuick.splice(i, 1))}
          onChange={(i, v) => patch((n) => (n.footerQuick[i] = v))} />

        <LinkList label="Footer — Information" items={c.footerInfo}
          onAdd={() => patch((n) => n.footerInfo.push({ en: "", bn: "", to: "" }))}
          onRemove={(i) => patch((n) => n.footerInfo.splice(i, 1))}
          onChange={(i, v) => patch((n) => (n.footerInfo[i] = v))} />

        <Card title="Legal pages (Terms & Privacy)">
          <p className="text-[12px] text-[var(--text-muted)]">এক লাইন = এক প্যারাগ্রাফ। (One line per paragraph.)</p>
          {["terms", "privacy"].map((k) => (
            <div key={k} className="rounded-[14px] border border-white/[0.09] p-4">
              <p className="mb-3 text-[13px] font-bold capitalize text-[var(--neutral100)]">{k}</p>
              <LangRow label="Title" value={c.legal[k].title} onChange={(v) => patch((n) => (n.legal[k].title = v))} />
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div>
                  <label className="ad-label">Body (English) — one paragraph per line</label>
                  <textarea className="ad-input mt-1" rows={6} value={c.legal[k].bodyEn} onChange={(e) => patch((n) => (n.legal[k].bodyEn = e.target.value))} />
                </div>
                <div>
                  <label className="ad-label">Body (Bangla) — one paragraph per line</label>
                  <textarea className="ad-input mt-1" rows={6} value={c.legal[k].bodyBn} onChange={(e) => patch((n) => (n.legal[k].bodyBn = e.target.value))} />
                </div>
              </div>
            </div>
          ))}
        </Card>

        <div><button type="button" onClick={save} disabled={busy} className="ad-btn ad-btn--primary">{busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save all content</button></div>
      </div>
    </div>
  );
};

export default HelpContentPage;
