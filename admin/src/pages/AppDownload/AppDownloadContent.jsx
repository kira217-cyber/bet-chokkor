import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ImagePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

/* ফিচার আইকন কী — ক্লায়েন্টের FEATURE_ICONS এর সাথে মিল */
const ICON_KEYS = [
  "download", "fingerprint", "radio", "zap", "shield", "smile",
  "gift", "game", "trophy", "wallet", "support", "star",
];

const emptyLang = () => ({ bn: "", en: "" });

const emptyContent = () => ({
  hero: {
    title: emptyLang(), lead: emptyLang(), text: emptyLang(), helpNote: emptyLang(),
    logo: "", bgImage: "", mainImage: "",
  },
  experience: {
    eyebrow: emptyLang(), title: emptyLang(), sub: emptyLang(),
    cards: [],
  },
  features: {
    eyebrow: emptyLang(), title: emptyLang(), sub: emptyLang(),
    image: "", items: [],
  },
});

/* সার্ভার থেকে আসা content কে পূর্ণ shape এ আনা */
const normalize = (c = {}) => {
  const base = emptyContent();
  const lang = (o) => ({ bn: o?.bn || "", en: o?.en || "" });
  return {
    hero: {
      title: lang(c.hero?.title), lead: lang(c.hero?.lead),
      text: lang(c.hero?.text), helpNote: lang(c.hero?.helpNote),
      logo: c.hero?.logo || "", bgImage: c.hero?.bgImage || "", mainImage: c.hero?.mainImage || "",
    },
    experience: {
      eyebrow: lang(c.experience?.eyebrow), title: lang(c.experience?.title), sub: lang(c.experience?.sub),
      cards: (c.experience?.cards || []).map((x) => ({
        title: lang(x.title), text: lang(x.text), image: x.image || "", _file: null, _preview: "",
      })),
    },
    features: {
      eyebrow: lang(c.features?.eyebrow), title: lang(c.features?.title), sub: lang(c.features?.sub),
      image: c.features?.image || "",
      items: (c.features?.items || []).map((x) => ({ label: lang(x.label), icon: x.icon || "star" })),
    },
    ...(!c.hero && !c.experience && !c.features ? base : {}),
  };
};

/* ── ছোট রিইউজেবল ইনপুট ── */
const LangRow = ({ label, value, onChange, textarea, hint }) => {
  const Field = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="ad-label">
        {label} {hint && <span className="text-[var(--text-disabled)]">({hint})</span>}
      </label>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        <Field
          className="ad-input" rows={textarea ? 3 : undefined}
          placeholder="Bangla" value={value?.bn || ""}
          onChange={(e) => onChange({ ...value, bn: e.target.value })}
        />
        <Field
          className="ad-input" rows={textarea ? 3 : undefined}
          placeholder="English" value={value?.en || ""}
          onChange={(e) => onChange({ ...value, en: e.target.value })}
        />
      </div>
    </div>
  );
};

const ImageRow = ({ label, hint, shown, onPick, onClear }) => {
  const ref = useRef(null);
  return (
    <div>
      <label className="ad-label">
        {label} {hint && <span className="text-[var(--text-disabled)]">({hint})</span>}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">
          {shown ? <img src={shown} alt="" className="h-full w-full object-contain" /> : <ImagePlus size={18} className="text-[var(--text-disabled)]" />}
        </span>
        <button type="button" onClick={() => ref.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm">
          <ImagePlus size={14} /> {shown ? "Change" : "Choose"}
        </button>
        {shown && (
          <button type="button" onClick={onClear} className="ad-btn ad-btn--ghost ad-btn--sm">
            <X size={14} /> Clear
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      </div>
    </div>
  );
};

/**
 * অ্যাপ ডাউনলোড পেজের কনটেন্ট — সব লেখা (bn/en) ও ছবি অ্যাডমিন থেকে।
 * রঙ আলাদা: "App Download Theme" পেজ থেকে। খালি রাখলে ক্লায়েন্ট
 * আগের স্ট্যাটিক লেখা/ছবি দেখায়।
 */
const AppDownloadContent = () => {
  const [content, setContent] = useState(emptyContent());
  // hero/feature একক ছবির জন্য slot → {file, preview}
  const [imgs, setImgs] = useState({}); // { heroLogo:{file,preview}, ... }
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/app-download/admin/content");
      setContent(normalize(data?.data?.content || {}));
      setImgs({});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const patch = (fn) => setContent((prev) => { const next = structuredClone(prev); fn(next); return next; });

  const pickImg = (slot, file) => {
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setImgs((p) => ({ ...p, [slot]: { file, preview: URL.createObjectURL(file) } }));
  };
  const clearImg = (slot, contentPath) => {
    setImgs((p) => { const n = { ...p }; delete n[slot]; return n; });
    patch(contentPath);
  };
  const shownImg = (slot, url) => imgs[slot]?.preview || imageUrl(url);

  const pickCard = (i, file) => {
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    patch((c) => { c.experience.cards[i]._file = file; c.experience.cards[i]._preview = URL.createObjectURL(file); });
  };

  const addCard = () => patch((c) => c.experience.cards.push({ title: emptyLang(), text: emptyLang(), image: "", _file: null, _preview: "" }));
  const removeCard = (i) => patch((c) => c.experience.cards.splice(i, 1));
  const addFeature = () => patch((c) => c.features.items.push({ label: emptyLang(), icon: "star" }));
  const removeFeature = (i) => patch((c) => c.features.items.splice(i, 1));

  const save = async () => {
    // JSON — ছবি রিলেটিভ path রাখা, _file/_preview বাদ
    const payload = structuredClone(content);
    payload.experience.cards = payload.experience.cards.map((x) => ({ title: x.title, text: x.text, image: x.image }));

    const form = new FormData();
    ["heroLogo", "heroBg", "heroMain", "featImage"].forEach((slot) => {
      if (imgs[slot]?.file) form.append(slot, imgs[slot].file);
    });
    content.experience.cards.forEach((card, i) => {
      if (card._file) form.append(`card_${i}`, card._file);
    });
    form.append("content", JSON.stringify(payload));

    try {
      setBusy(true);
      const { data } = await api.put("/api/app-download/admin/content", form);
      toast.success("Saved");
      setContent(normalize(data?.data?.content || {}));
      setImgs({});
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const hero = content.hero;
  const exp = content.experience;
  const feat = content.features;

  if (loading) {
    return (
      <div className="ad-card mx-auto flex max-w-[1100px] items-center gap-3 text-[var(--text-muted)]">
        <Loader2 size={16} className="animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">App Download — Content</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Text & images of the /app-download page. Empty fields fall back to the built-in defaults. Colors: see “App Download Theme”.
          </p>
        </div>
        <button type="button" onClick={load} className="ad-btn ad-btn--ghost ad-btn--sm">
          <RefreshCw size={15} /> Reload
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── ফর্ম ── */}
        <div className="flex flex-col gap-6">
          {/* Hero */}
          <div className="ad-card flex flex-col gap-4">
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">1 · Hero section</h2>
            <LangRow label="Title" value={hero.title} onChange={(v) => patch((c) => (c.hero.title = v))} />
            <LangRow label="Lead line" value={hero.lead} onChange={(v) => patch((c) => (c.hero.lead = v))} />
            <LangRow label="Description" textarea value={hero.text} onChange={(v) => patch((c) => (c.hero.text = v))} />
            <LangRow label="Help note (gold)" value={hero.helpNote} onChange={(v) => patch((c) => (c.hero.helpNote = v))} />
            <div className="grid gap-4 sm:grid-cols-3">
              <ImageRow label="App logo" shown={shownImg("heroLogo", hero.logo)} onPick={(f) => pickImg("heroLogo", f)} onClear={() => clearImg("heroLogo", (c) => (c.hero.logo = ""))} />
              <ImageRow label="Hero glow bg" shown={shownImg("heroBg", hero.bgImage)} onPick={(f) => pickImg("heroBg", f)} onClear={() => clearImg("heroBg", (c) => (c.hero.bgImage = ""))} />
              <ImageRow label="Hero main img" shown={shownImg("heroMain", hero.mainImage)} onPick={(f) => pickImg("heroMain", f)} onClear={() => clearImg("heroMain", (c) => (c.hero.mainImage = ""))} />
            </div>
          </div>

          {/* Experience */}
          <div className="ad-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">2 · Experience section</h2>
              <button type="button" onClick={addCard} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={14} /> Card</button>
            </div>
            <LangRow label="Eyebrow" value={exp.eyebrow} onChange={(v) => patch((c) => (c.experience.eyebrow = v))} />
            <LangRow label="Title" value={exp.title} onChange={(v) => patch((c) => (c.experience.title = v))} />
            <LangRow label="Subtitle" value={exp.sub} onChange={(v) => patch((c) => (c.experience.sub = v))} />

            {exp.cards.map((card, i) => (
              <div key={i} className="rounded-[14px] border border-white/[0.07] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[var(--neutral100)]">Card {i + 1}</p>
                  <button type="button" onClick={() => removeCard(i)} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <LangRow label="Title" value={card.title} onChange={(v) => patch((c) => (c.experience.cards[i].title = v))} />
                  <LangRow label="Text" textarea value={card.text} onChange={(v) => patch((c) => (c.experience.cards[i].text = v))} />
                  <ImageRow label="Card image" shown={card._preview || imageUrl(card.image)}
                    onPick={(f) => pickCard(i, f)}
                    onClear={() => patch((c) => { c.experience.cards[i].image = ""; c.experience.cards[i]._file = null; c.experience.cards[i]._preview = ""; })} />
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="ad-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">3 · Features section</h2>
              <button type="button" onClick={addFeature} className="ad-btn ad-btn--ghost ad-btn--sm"><Plus size={14} /> Feature</button>
            </div>
            <LangRow label="Eyebrow" value={feat.eyebrow} onChange={(v) => patch((c) => (c.features.eyebrow = v))} />
            <LangRow label="Title" value={feat.title} onChange={(v) => patch((c) => (c.features.title = v))} />
            <LangRow label="Subtitle" value={feat.sub} onChange={(v) => patch((c) => (c.features.sub = v))} />
            <ImageRow label="Bottom image" shown={shownImg("featImage", feat.image)} onPick={(f) => pickImg("featImage", f)} onClear={() => clearImg("featImage", (c) => (c.features.image = ""))} />

            {feat.items.map((item, i) => (
              <div key={i} className="rounded-[14px] border border-white/[0.07] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-[var(--neutral100)]">Feature {i + 1}</p>
                  <button type="button" onClick={() => removeFeature(i)} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
                </div>
                <div className="flex flex-col gap-3">
                  <LangRow label="Label" value={item.label} onChange={(v) => patch((c) => (c.features.items[i].label = v))} />
                  <div>
                    <label className="ad-label">Icon</label>
                    <select className="ad-input mt-1" value={item.icon} onChange={(e) => patch((c) => (c.features.items[i].icon = e.target.value))}>
                      {ICON_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </div>
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

        {/* ── লাইভ প্রিভিউ (বাংলা) ── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <p className="ad-label mb-2 flex items-center gap-1"><Smartphone size={13} /> Live preview (Bangla)</p>
          <div className="overflow-hidden rounded-[16px] border border-white/10">
            {/* hero */}
            <div className="p-4" style={{ background: "#0a0a09" }}>
              <div className="flex items-center gap-2">
                {shownImg("heroLogo", hero.logo) ? <img src={shownImg("heroLogo", hero.logo)} alt="" className="h-8 w-8 rounded-[8px] object-cover" /> : <span className="h-8 w-8 rounded-[8px] bg-white/10" />}
                <p className="text-[14px] font-bold text-white">{hero.title.bn || "App title"}</p>
              </div>
              <p className="mt-2 text-[11px] text-white/90">{hero.lead.bn || "Lead line…"}</p>
              <p className="mt-1 text-[10px] text-white/60">{hero.text.bn || "Description…"}</p>
              <p className="mt-2 text-[11px] font-semibold" style={{ color: "#f9b901" }}>{hero.helpNote.bn || "Help note"}</p>
              {shownImg("heroMain", hero.mainImage) && <img src={shownImg("heroMain", hero.mainImage)} alt="" className="mt-3 max-h-24 w-full object-contain" />}
            </div>
            {/* band */}
            <div className="p-4 text-center" style={{ background: "linear-gradient(180deg,#241802,#8a5e02 40%,#f9b901)" }}>
              <p className="text-[10px] font-semibold" style={{ color: "#ffdf9a" }}>{exp.eyebrow.bn || "Eyebrow"}</p>
              <p className="text-[14px] font-black text-white">{exp.title.bn || "Experience title"}</p>
              <p className="text-[10px]" style={{ color: "#ffe9c2" }}>{exp.sub.bn || "Subtitle"}</p>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {(exp.cards.length ? exp.cards : [0, 1]).map((card, i) => (
                  <div key={i} className="rounded-[8px] p-2 text-left" style={{ background: "#22221e", border: "1px solid rgba(249,185,1,.35)" }}>
                    <p className="text-[10px] font-black text-white">{card?.title?.bn || `Card ${i + 1}`}</p>
                    <p className="text-[8px] text-white/60 leading-tight">{card?.text?.bn || "…"}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* features */}
            <div className="p-4" style={{ background: "#0a0a09" }}>
              <p className="text-[10px] font-semibold" style={{ color: "#e38614" }}>{feat.eyebrow.bn || "Eyebrow"}</p>
              <p className="text-[13px] font-black text-white">{feat.title.bn || "Features title"}</p>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(feat.items.length ? feat.items : [0, 1, 2]).map((it, i) => (
                  <div key={i} className="rounded-[8px] p-2 text-center" style={{ background: "#292926", border: "1px solid #383835" }}>
                    <span className="mx-auto mb-1 block h-5 w-5 rounded-full" style={{ background: "rgba(249,185,1,.15)" }} />
                    <p className="text-[8px] text-white leading-tight">{it?.label?.bn || `Feature ${i + 1}`}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadContent;
