import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  CalendarClock,
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

const empty = {
  id: "",
  actionType: "none",
  linkUrl: "",
  modalTitleBn: "",
  modalTitleEn: "",
  modalDescBn: "",
  modalDescEn: "",
  isActive: true,
  order: 0,
};

/**
 * হোম ইভেন্ট ব্যানার — শুধু ছবি, অথবা ক্লিকে লিংক, অথবা প্রমোশন মডাল।
 */
const HomeEvents = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const [draft, setDraft] = useState(empty);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [modalFile, setModalFile] = useState(null);
  const [modalPreview, setModalPreview] = useState("");
  const imgRef = useRef(null);
  const modalRef = useRef(null);

  const editing = Boolean(draft.id);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/site-content/admin/events");
      setItems(data?.data?.events || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const reset = () => {
    setDraft(empty);
    setImgFile(null);
    setImgPreview("");
    setModalFile(null);
    setModalPreview("");
    if (imgRef.current) imgRef.current.value = "";
    if (modalRef.current) modalRef.current.value = "";
  };

  const pick = (e, setFile, setPreview) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Choose an image");
    if (f.size > 5 * 1024 * 1024) return toast.error("Max 5MB");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!editing && !imgFile) return toast.error("Event image is required");

    const form = new FormData();
    form.append("actionType", draft.actionType);
    form.append("linkUrl", draft.linkUrl);
    form.append("modalTitle", JSON.stringify({ bn: draft.modalTitleBn, en: draft.modalTitleEn }));
    form.append("modalDescription", JSON.stringify({ bn: draft.modalDescBn, en: draft.modalDescEn }));
    form.append("isActive", draft.isActive ? "true" : "false");
    form.append("order", String(draft.order || 0));
    if (imgFile) form.append("image", imgFile);
    if (modalFile) form.append("modalImage", modalFile);

    try {
      setBusy("save");
      if (editing) {
        await api.put(`/api/site-content/admin/events/${draft.id}`, form);
        toast.success("Event updated");
      } else {
        await api.post("/api/site-content/admin/events", form);
        toast.success("Event added");
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
    if (!window.confirm("Delete this event?")) return;
    try {
      setBusy(item._id);
      await api.delete(`/api/site-content/admin/events/${item._id}`);
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
      actionType: item.actionType || "none",
      linkUrl: item.linkUrl || "",
      modalTitleBn: item.modal?.title?.bn || "",
      modalTitleEn: item.modal?.title?.en || "",
      modalDescBn: item.modal?.description?.bn || "",
      modalDescEn: item.modal?.description?.en || "",
      isActive: item.isActive !== false,
      order: item.order || 0,
    });
    setImgFile(null);
    setImgPreview("");
    setModalFile(null);
    setModalPreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const current = editing ? items.find((i) => i._id === draft.id) : null;
  const shownImg = imgPreview || imageUrl(current?.image);
  const shownModal = modalPreview || imageUrl(current?.modal?.image);

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Home Events</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            The event banner row on the home page.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="ad-btn ad-btn--ghost ad-btn--sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form onSubmit={submit} className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {editing ? "Edit event" : "New event"}
        </h2>

        {/* ইভেন্ট ছবি */}
        <div className="rounded-[14px] border border-white/[0.07] p-4">
          <label className="ad-label">
            Event image <span className="text-[var(--text-disabled)]">(718 × 344 px)</span>
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="flex h-20 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/30">
              {shownImg ? <img src={shownImg} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={22} className="text-[var(--text-disabled)]" />}
            </span>
            <button type="button" onClick={() => imgRef.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm">
              <ImagePlus size={14} /> {shownImg ? "Change" : "Choose"}
            </button>
          </div>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e, setImgFile, setImgPreview)} />
        </div>

        {/* ক্লিকে কী হবে */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="ad-label">On click</label>
            <select value={draft.actionType} onChange={(e) => set("actionType", e.target.value)} className="ad-input">
              <option value="none">Nothing</option>
              <option value="link">Open a link</option>
              <option value="modal">Open a modal</option>
            </select>
          </div>
          <div>
            <label className="ad-label">Order</label>
            <input type="number" min="0" value={draft.order} onChange={(e) => set("order", e.target.value)} className="ad-input" />
          </div>
          <label className="flex items-end gap-2 pb-2 text-[14px] text-[var(--text-muted)]">
            <input type="checkbox" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Active
          </label>
        </div>

        {draft.actionType === "link" && (
          <div>
            <label className="ad-label">Link URL</label>
            <input value={draft.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} placeholder="/promotion or https://..." className="ad-input" />
          </div>
        )}

        {draft.actionType === "modal" && (
          <div className="rounded-[14px] border border-white/[0.07] p-4">
            <p className="mb-3 text-[13px] font-bold text-[var(--neutral100)]">Modal (popup) content</p>

            <div className="mb-3">
              <label className="ad-label">
                Modal image <span className="text-[var(--text-disabled)]">(1040 × 585 px)</span>
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-white/[0.08] bg-black/30">
                  {shownModal ? <img src={shownModal} alt="" className="h-full w-full object-cover" /> : <ImagePlus size={18} className="text-[var(--text-disabled)]" />}
                </span>
                <button type="button" onClick={() => modalRef.current?.click()} className="ad-btn ad-btn--ghost ad-btn--sm">
                  <ImagePlus size={14} /> {shownModal ? "Change" : "Choose"}
                </button>
                <input ref={modalRef} type="file" accept="image/*" className="hidden" onChange={(e) => pick(e, setModalFile, setModalPreview)} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input value={draft.modalTitleBn} onChange={(e) => set("modalTitleBn", e.target.value)} placeholder="শিরোনাম (Bangla)" className="ad-input" />
              <input value={draft.modalTitleEn} onChange={(e) => set("modalTitleEn", e.target.value)} placeholder="Title (English)" className="ad-input" />
              <textarea value={draft.modalDescBn} onChange={(e) => set("modalDescBn", e.target.value)} rows={3} placeholder="বিবরণ (Bangla)" className="ad-input" />
              <textarea value={draft.modalDescEn} onChange={(e) => set("modalDescEn", e.target.value)} rows={3} placeholder="Description (English)" className="ad-input" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? "Save changes" : "Add event"}
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
          <CalendarClock size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">No event yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="ad-card">
              <div className="flex items-start gap-3">
                <img src={imageUrl(item.image)} alt="" className="h-16 w-28 shrink-0 rounded-[10px] object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold capitalize text-[var(--neutral100)]">
                    On click: {item.actionType}
                  </p>
                  <p className="truncate text-[12px] text-[var(--text-muted)]">
                    {item.actionType === "link" ? item.linkUrl : item.actionType === "modal" ? item.modal?.title?.en || "modal" : "—"}
                  </p>
                  <p className="text-[12px] text-[var(--text-disabled)]">
                    Order {item.order} · {item.isActive !== false ? "Active" : "Off"}
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

export default HomeEvents;
