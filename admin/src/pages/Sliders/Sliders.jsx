import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ImagePlus,
  Images,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const empty = { id: "", link: "", isActive: true, order: 0 };

/**
 * হোম স্লাইডার ব্যানার — অ্যাডমিন থেকে।
 *
 * ডেস্কটপ ও মোবাইলের ছবি আলাদা (মাপ লেবেলে দেওয়া আছে)। ঐচ্ছিক লিংক
 * থাকলে ব্যানারে ক্লিকে সেখানে যায়।
 */
const Sliders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const [draft, setDraft] = useState(empty);
  const [deskFile, setDeskFile] = useState(null);
  const [mobFile, setMobFile] = useState(null);
  const [deskPreview, setDeskPreview] = useState("");
  const [mobPreview, setMobPreview] = useState("");
  const deskRef = useRef(null);
  const mobRef = useRef(null);

  const editing = Boolean(draft.id);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/site-content/admin/sliders");
      setItems(data?.data?.sliders || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setDraft(empty);
    setDeskFile(null);
    setMobFile(null);
    setDeskPreview("");
    setMobPreview("");
    if (deskRef.current) deskRef.current.value = "";
    if (mobRef.current) mobRef.current.value = "";
  };

  const pick = (e, setFile, setPreview) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    if (file.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editing && !deskFile && !mobFile) {
      return toast.error("At least one image is required");
    }

    const form = new FormData();
    form.append("link", draft.link);
    form.append("isActive", draft.isActive ? "true" : "false");
    form.append("order", String(draft.order || 0));
    if (deskFile) form.append("imageDesktop", deskFile);
    if (mobFile) form.append("imageMobile", mobFile);

    try {
      setBusy("save");
      if (editing) {
        await api.put(`/api/site-content/admin/sliders/${draft.id}`, form);
        toast.success("Slider updated");
      } else {
        await api.post("/api/site-content/admin/sliders", form);
        toast.success("Slider added");
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
    if (!window.confirm("Delete this slider?")) return;
    try {
      setBusy(item._id);
      await api.delete(`/api/site-content/admin/sliders/${item._id}`);
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
      link: item.link || "",
      isActive: item.isActive !== false,
      order: item.order || 0,
    });
    setDeskFile(null);
    setMobFile(null);
    setDeskPreview("");
    setMobPreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const imageBox = (label, size, preview, current, refEl, onPick) => (
    <div>
      <label className="ad-label">
        {label}{" "}
        <span className="text-[var(--text-disabled)]">({size})</span>
      </label>
      <div className="mt-1 flex items-center gap-3">
        <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">
          {preview || current ? (
            <img src={preview || imageUrl(current)} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} className="text-[var(--text-disabled)]" />
          )}
        </span>
        <button
          type="button"
          onClick={() => refEl.current?.click()}
          className="ad-btn ad-btn--ghost ad-btn--sm"
        >
          <ImagePlus size={14} />
          {preview || current ? "Change" : "Choose"}
        </button>
        <input ref={refEl} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Home Sliders</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Home page banner carousel.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="ad-btn ad-btn--ghost ad-btn--sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form onSubmit={submit} className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {editing ? "Edit slider" : "New slider"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {imageBox("Desktop image", "1920 × 210 px", deskPreview, editing ? items.find((i) => i._id === draft.id)?.imageDesktop : "", deskRef, (e) => pick(e, setDeskFile, setDeskPreview))}
          {imageBox("Mobile image", "1080 × 520 px", mobPreview, editing ? items.find((i) => i._id === draft.id)?.imageMobile : "", mobRef, (e) => pick(e, setMobFile, setMobPreview))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="ad-label">Link (optional)</label>
            <input value={draft.link} onChange={(e) => setDraft((p) => ({ ...p, link: e.target.value }))} placeholder="/promotion" className="ad-input" />
          </div>
          <div>
            <label className="ad-label">Order</label>
            <input type="number" min="0" value={draft.order} onChange={(e) => setDraft((p) => ({ ...p, order: e.target.value }))} className="ad-input" />
          </div>
        </div>

        <label className="flex w-fit items-center gap-2 text-[14px] text-[var(--text-muted)]">
          <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))} />
          Active
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? "Save changes" : "Add slider"}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="ad-btn ad-btn--ghost">Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Images size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">No slider yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item._id} className="ad-card flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src={imageUrl(item.imageDesktop || item.imageMobile)} alt="" className="h-14 w-28 shrink-0 rounded-[10px] object-cover" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[var(--neutral100)]">
                    {item.link || "— no link —"}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    Order {item.order} · {item.isActive !== false ? "Active" : "Off"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => startEdit(item)} className="ad-btn ad-btn--ghost ad-btn--sm"><Pencil size={14} /></button>
                <button type="button" onClick={() => remove(item)} disabled={busy === item._id} className="ad-btn ad-btn--danger ad-btn--sm">
                  {busy === item._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sliders;
