import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Bell,
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

const imageUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${API_URL}${url}`;
};

const emptyDraft = {
  id: "",
  titleBn: "",
  titleEn: "",
  descBn: "",
  descEn: "",
  imageUrl: "",
  isActive: true,
};

const draftFrom = (item) => ({
  id: item._id,
  titleBn: item.title?.bn || "",
  titleEn: item.title?.en || "",
  descBn: item.description?.bn || "",
  descEn: item.description?.en || "",
  imageUrl: item.imageUrl || "",
  isActive: item.isActive !== false,
});

/**
 * নোটিফিকেশন — অ্যাডমিন থেকে নোটিশ পাঠানো।
 *
 * বাংলা ও ইংরেজিতে শিরোনাম ও বিবরণ, চাইলে একটা ছবি। সক্রিয় নোটিশই
 * ক্লায়েন্টে যায়; নতুন নোটিশ তৈরি হলে ব্যবহারকারীর হেডারে লাল ব্যাজ
 * উঠে আসে, পাতা খুললে মিলিয়ে যায়।
 */
const Notifications = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");

  const [draft, setDraft] = useState(emptyDraft);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileRef = useRef(null);

  const editing = Boolean(draft.id);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/notifications/admin");
      setItems(data?.data?.notifications || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setDraft(emptyDraft);
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const pickImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!draft.titleBn.trim() && !draft.titleEn.trim()) {
      toast.error("Enter a title (Bangla or English)");
      return;
    }

    // ছবির সাথে multipart লাগে, তাই nested অংশগুলো JSON স্ট্রিং
    const payload = new FormData();
    payload.append(
      "title",
      JSON.stringify({ bn: draft.titleBn, en: draft.titleEn }),
    );
    payload.append(
      "description",
      JSON.stringify({ bn: draft.descBn, en: draft.descEn }),
    );
    payload.append("isActive", draft.isActive ? "true" : "false");
    payload.append("imageUrl", draft.imageUrl);
    if (imageFile) payload.append("image", imageFile);

    try {
      setBusy("save");

      if (editing) {
        await api.put(`/api/notifications/admin/${draft.id}`, payload);
        toast.success("Notification updated");
      } else {
        await api.post("/api/notifications/admin", payload);
        toast.success("Notification sent");
      }

      resetForm();
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async (item) => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      setBusy(item._id);
      await api.delete(`/api/notifications/admin/${item._id}`);
      toast.success("Deleted");
      if (draft.id === item._id) resetForm();
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setBusy("");
    }
  };

  const startEdit = (item) => {
    setDraft(draftFrom(item));
    setImageFile(null);
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const preview = imagePreview || imageUrl(draft.imageUrl);

  return (
    <div className="mx-auto max-w-[1000px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Notifications</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Send a notice to every player — shown in their inbox.
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

      {/* ── ফর্ম ── */}
      <form onSubmit={submit} className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {editing ? "Edit notification" : "New notification"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ad-label">Title (Bangla)</label>
            <input
              value={draft.titleBn}
              onChange={(e) => set("titleBn", e.target.value)}
              placeholder="শিরোনাম"
              className="ad-input"
            />
          </div>
          <div>
            <label className="ad-label">Title (English)</label>
            <input
              value={draft.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              placeholder="Title"
              className="ad-input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="ad-label">Description (Bangla)</label>
            <textarea
              value={draft.descBn}
              onChange={(e) => set("descBn", e.target.value)}
              placeholder="বিবরণ"
              rows={4}
              className="ad-input"
            />
          </div>
          <div>
            <label className="ad-label">Description (English)</label>
            <textarea
              value={draft.descEn}
              onChange={(e) => set("descEn", e.target.value)}
              placeholder="Description"
              rows={4}
              className="ad-input"
            />
          </div>
        </div>

        {/* ── ছবি (ঐচ্ছিক) ── */}
        <div className="rounded-[14px] border border-white/[0.07] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/[0.08] bg-black/30 p-1">
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-contain" />
              ) : (
                <ImagePlus size={24} className="text-[var(--text-disabled)]" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold text-[var(--neutral100)]">
                Notice image (optional)
              </p>
              <p className="text-[12px] text-[var(--text-muted)]">
                png, jpg, webp, svg or gif — up to 5MB
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="ad-btn ad-btn--ghost ad-btn--sm"
                >
                  <ImagePlus size={14} />
                  {preview ? "Change" : "Choose image"}
                </button>

                {preview ? (
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      set("imageUrl", "");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="ad-btn ad-btn--danger ad-btn--sm"
                  >
                    <X size={14} />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickImage}
          />
        </div>

        <label className="flex w-fit items-center gap-2 text-[14px] text-[var(--text-muted)]">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
          />
          Active (visible to players)
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={Boolean(busy)}
            className="ad-btn ad-btn--primary"
          >
            {busy === "save" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : editing ? (
              <Save size={16} />
            ) : (
              <Plus size={16} />
            )}
            {editing ? "Save changes" : "Send notification"}
          </button>

          {editing ? (
            <button
              type="button"
              onClick={resetForm}
              className="ad-btn ad-btn--ghost"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {/* ── তালিকা ── */}
      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Bell size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">
            No notification yet
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item._id} className="ad-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {item.imageUrl ? (
                    <img
                      src={imageUrl(item.imageUrl)}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-[12px] bg-white/[0.04] object-cover"
                    />
                  ) : null}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[16px] font-extrabold text-[var(--neutral100)]">
                        {item.title?.en || item.title?.bn || "—"}
                      </h3>
                      <span
                        className="rounded-full px-2 py-[2px] text-[11px] font-bold"
                        style={{
                          background:
                            item.isActive !== false
                              ? "color-mix(in srgb, var(--status-success), transparent 88%)"
                              : "color-mix(in srgb, var(--status-danger), transparent 88%)",
                          color:
                            item.isActive !== false
                              ? "var(--status-success)"
                              : "var(--status-danger)",
                        }}
                      >
                        {item.isActive !== false ? "Active" : "Off"}
                      </span>
                    </div>

                    {item.title?.bn ? (
                      <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
                        {item.title.bn}
                      </p>
                    ) : null}

                    {(item.description?.en || item.description?.bn) && (
                      <p className="mt-2 line-clamp-2 text-[13px] text-[var(--text-muted)]">
                        {item.description?.en || item.description?.bn}
                      </p>
                    )}

                    <p className="mt-2 text-[12px] text-[var(--text-disabled)]">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    className="ad-btn ad-btn--ghost ad-btn--sm"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    disabled={busy === item._id}
                    className="ad-btn ad-btn--danger ad-btn--sm"
                  >
                    {busy === item._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
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

export default Notifications;
