import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Gift,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const CATEGORIES = [
  { key: "welcome-offer", label: "Welcome Offer" },
  { key: "slots", label: "Slots" },
  { key: "live-casino", label: "Live Casino" },
  { key: "sports", label: "Sports" },
  { key: "fishing", label: "Fishing" },
  { key: "lottery", label: "Lottery" },
  { key: "table", label: "Table" },
  { key: "arcade", label: "Arcade" },
  { key: "crash", label: "Crash" },
  { key: "other", label: "Other" },
];

// datetime-local ইনপুটের ফরম্যাট (YYYY-MM-DDTHH:mm)
const toLocal = (d) => {
  if (!d) return "";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const p = (n) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
};

const empty = {
  id: "",
  titleBn: "",
  titleEn: "",
  descBn: "",
  descEn: "",
  tag: "FDB",
  category: "welcome-offer",
  startAt: "",
  endAt: "",
  isActive: true,
  order: 0,
};

/**
 * প্রমোশন — /promotion পাতার কার্ড ও মডাল (মূল সাইটের মতো)।
 */
const Promotions = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const [draft, setDraft] = useState(empty);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  // পেজ হেডিং (কার্ড থেকে আলাদা)
  const [page, setPage] = useState({ headingBn: "", headingEn: "", subBn: "", subEn: "" });
  const [pageBusy, setPageBusy] = useState(false);

  const editing = Boolean(draft.id);

  const loadPage = async () => {
    try {
      const { data } = await api.get("/api/site-content/admin/promo-page");
      const d = data?.data || {};
      setPage({
        headingBn: d.heading?.bn || "",
        headingEn: d.heading?.en || "",
        subBn: d.subheading?.bn || "",
        subEn: d.subheading?.en || "",
      });
    } catch {
      /* খালি থাকলে ফর্ম ফাঁকা */
    }
  };

  const savePage = async () => {
    try {
      setPageBusy(true);
      await api.put("/api/site-content/admin/promo-page", {
        heading: { bn: page.headingBn, en: page.headingEn },
        subheading: { bn: page.subBn, en: page.subEn },
      });
      toast.success("Heading saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setPageBusy(false);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/site-content/admin/promotions");
      setItems(data?.data?.promotions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadPage();
  }, []);

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));
  const setPageField = (k, v) => setPage((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setDraft(empty);
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Choose an image");
    if (f.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editing && !file) return toast.error("Promotion image is required");

    const form = new FormData();
    form.append("title", JSON.stringify({ bn: draft.titleBn, en: draft.titleEn }));
    form.append("description", JSON.stringify({ bn: draft.descBn, en: draft.descEn }));
    form.append("tag", draft.tag || "");
    form.append("category", draft.category || "welcome-offer");
    form.append("startAt", draft.startAt || "");
    form.append("endAt", draft.endAt || "");
    form.append("isActive", draft.isActive ? "true" : "false");
    form.append("order", String(draft.order || 0));
    if (file) form.append("image", file);

    try {
      setBusy("save");
      if (editing) {
        await api.put(`/api/site-content/admin/promotions/${draft.id}`, form);
        toast.success("Promotion updated");
      } else {
        await api.post("/api/site-content/admin/promotions", form);
        toast.success("Promotion added");
      }
      reset();
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this promotion?")) return;
    try {
      setBusy(item._id);
      await api.delete(`/api/site-content/admin/promotions/${item._id}`);
      toast.success("Deleted");
      if (draft.id === item._id) reset();
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setBusy("");
    }
  };

  const startEdit = (item) => {
    setDraft({
      id: item._id,
      titleBn: item.title?.bn || "",
      titleEn: item.title?.en || "",
      descBn: item.description?.bn || "",
      descEn: item.description?.en || "",
      tag: item.tag || "",
      category: item.category || "welcome-offer",
      startAt: toLocal(item.startAt),
      endAt: toLocal(item.endAt),
      isActive: item.isActive !== false,
      order: item.order || 0,
    });
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shownPreview = preview || (editing ? imageUrl(items.find((i) => i._id === draft.id)?.image) : "");

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Promotions</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Cards shown on the /promotion page.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="ad-btn ad-btn--ghost ad-btn--sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* পেজ হেডিং */}
      <div className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">Page heading</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="ad-label">Heading (Bangla)</label>
            <input className="ad-input mt-1" value={page.headingBn} onChange={(e) => setPageField("headingBn", e.target.value)} placeholder="প্রমোশন" />
          </div>
          <div>
            <label className="ad-label">Heading (English)</label>
            <input className="ad-input mt-1" value={page.headingEn} onChange={(e) => setPageField("headingEn", e.target.value)} placeholder="Promotion" />
          </div>
          <div>
            <label className="ad-label">Subheading (Bangla, optional)</label>
            <input className="ad-input mt-1" value={page.subBn} onChange={(e) => setPageField("subBn", e.target.value)} />
          </div>
          <div>
            <label className="ad-label">Subheading (English, optional)</label>
            <input className="ad-input mt-1" value={page.subEn} onChange={(e) => setPageField("subEn", e.target.value)} />
          </div>
        </div>
        <div>
          <button type="button" onClick={savePage} disabled={pageBusy} className="ad-btn ad-btn--primary">
            {pageBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save heading
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {editing ? "Edit promotion" : "New promotion"}
        </h2>

        {/* ছবি */}
        <div className="rounded-[14px] border border-white/[0.07] p-4">
          <label className="ad-label">
            Promotion image{" "}
            <span className="text-[var(--text-disabled)]">(1200 × 675 px)</span>
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/30">
              {shownPreview ? (
                <img src={shownPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus size={22} className="text-[var(--text-disabled)]" />
              )}
            </span>
            <button type="button" onClick={() => fileRef.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm">
              <ImagePlus size={14} /> {shownPreview ? "Change" : "Choose"}
            </button>
            {shownPreview && (
              <button type="button" onClick={() => { setFile(null); setPreview(""); if (fileRef.current) fileRef.current.value = ""; }} className="ad-btn ad-btn--danger ad-btn--sm">
                <X size={14} />
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ad-label">Title (Bangla)</label>
            <input value={draft.titleBn} onChange={(e) => set("titleBn", e.target.value)} placeholder="শিরোনাম" className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Title (English)</label>
            <input value={draft.titleEn} onChange={(e) => set("titleEn", e.target.value)} placeholder="Title" className="ad-input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ad-label">Description (Bangla)</label>
            <textarea value={draft.descBn} onChange={(e) => set("descBn", e.target.value)} rows={4} placeholder="বিবরণ" className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Description (English)</label>
            <textarea value={draft.descEn} onChange={(e) => set("descEn", e.target.value)} rows={4} placeholder="Description" className="ad-input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="ad-label">Category</label>
            <select value={draft.category} onChange={(e) => set("category", e.target.value)} className="ad-input">
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="ad-label">Tag (badge)</label>
            <input value={draft.tag} onChange={(e) => set("tag", e.target.value)} placeholder="FDB" className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Order</label>
            <input type="number" min="0" value={draft.order} onChange={(e) => set("order", e.target.value)} className="ad-input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="ad-label">Start date</label>
            <input type="datetime-local" value={draft.startAt} onChange={(e) => set("startAt", e.target.value)} className="ad-input" />
          </div>
          <div>
            <label className="ad-label">End date</label>
            <input type="datetime-local" value={draft.endAt} onChange={(e) => set("endAt", e.target.value)} className="ad-input" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-[14px] text-[var(--text-muted)]">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Active
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? "Save changes" : "Add promotion"}
          </button>
          {editing && <button type="button" onClick={reset} className="ad-btn ad-btn--ghost">Cancel</button>}
        </div>
      </form>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Gift size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">No promotion yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="ad-card">
              <div className="flex items-start gap-3">
                <img src={imageUrl(item.image)} alt="" className="h-16 w-24 shrink-0 rounded-[10px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[var(--neutral100)]">{item.title?.en || item.title?.bn || "—"}</p>
                  <p className="text-[12px] capitalize text-[var(--text-muted)]">
                    {item.category} · Order {item.order} · {item.isActive !== false ? "Active" : "Off"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(item)} className="ad-btn ad-btn--ghost ad-btn--sm"><Pencil size={13} /></button>
                  <button type="button" onClick={() => remove(item)} disabled={busy === item._id} className="ad-btn ad-btn--danger ad-btn--sm">
                    {busy === item._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promotions;
