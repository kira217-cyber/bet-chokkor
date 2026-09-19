import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Crown,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { api } from "../../api/axios";
import { HistoryHeader } from "../../components/HistoryBits/HistoryBits";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const imageUrl = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

const blank = {
  id: "",
  lv: "",
  nameBn: "",
  nameEn: "",
  xpRequired: 0,
  color: "#f9b901",
  icon: "",
  badge: "",
  convertRatio: 400,
  inviteOnly: false,
  upgradeBonus: 0,
  monthlyBonus: 0,
  rebatePercent: 0,
  perks: [],
  order: 0,
  isActive: true,
};

/**
 * VIP লেভেল (অ্যাডমিন) — পুরো ল্যাডার তৈরি/সম্পাদনা। প্রতি লেভেলের নাম,
 * XP শর্ত, রঙ, আইকন, বোনাস, রিবেট আর সুবিধার তালিকা এখান থেকে।
 */
const VipLevels = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [draft, setDraft] = useState(blank);
  const [del, setDel] = useState(null);
  const iconRef = useRef(null);
  const badgeRef = useRef(null);

  const editing = Boolean(draft.id);
  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/vip/admin/levels");
      setItems(data?.data?.levels || []);
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
    setDraft(blank);
    if (iconRef.current) iconRef.current.value = "";
  };

  const startEdit = (item) => {
    setDraft({
      id: item._id,
      lv: item.lv,
      nameBn: item.name?.bn || "",
      nameEn: item.name?.en || "",
      xpRequired: item.xpRequired || 0,
      color: item.color || "#f9b901",
      icon: item.icon || "",
      badge: item.badge || "",
      convertRatio: item.convertRatio || 400,
      inviteOnly: item.inviteOnly === true,
      upgradeBonus: item.upgradeBonus || 0,
      monthlyBonus: item.monthlyBonus || 0,
      rebatePercent: item.rebatePercent || 0,
      perks: Array.isArray(item.perks) ? item.perks : [],
      order: item.order || 0,
      isActive: item.isActive !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const uploadImg = async (file, key) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image");
    try {
      setBusy(key);
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/api/vip/admin/upload", form);
      set(key, data?.data?.url || "");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setBusy("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!draft.lv) return toast.error("Level number is required");

    const payload = {
      lv: Number(draft.lv),
      name: { bn: draft.nameBn, en: draft.nameEn },
      xpRequired: Number(draft.xpRequired) || 0,
      color: draft.color,
      icon: draft.icon,
      badge: draft.badge,
      convertRatio: Number(draft.convertRatio) || 400,
      inviteOnly: draft.inviteOnly,
      upgradeBonus: Number(draft.upgradeBonus) || 0,
      monthlyBonus: Number(draft.monthlyBonus) || 0,
      rebatePercent: Number(draft.rebatePercent) || 0,
      perks: draft.perks.filter((p) => p.bn || p.en),
      order: Number(draft.order) || Number(draft.lv),
      isActive: draft.isActive,
    };

    try {
      setBusy("save");
      if (editing) {
        await api.put(`/api/vip/admin/levels/${draft.id}`, payload);
        toast.success("Level saved");
      } else {
        await api.post("/api/vip/admin/levels", payload);
        toast.success("Level created");
      }
      reset();
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!del) return;
    try {
      setBusy("del");
      await api.delete(`/api/vip/admin/levels/${del._id}`);
      toast.success("Deleted");
      if (draft.id === del._id) reset();
      setDel(null);
      await load();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto max-w-[1000px]">
      <HistoryHeader title="VIP Levels" subtitle="The whole ladder — Normal, Elite I, II … with XP, bonus and perks." Icon={Crown} onRefresh={load} loading={loading} />

      <form onSubmit={submit} className="ad-card mb-6 flex flex-col gap-4">
        <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
          {editing ? `Edit level ${draft.lv}` : "New level"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <F label="Level number"><input type="number" min="1" value={draft.lv} onChange={(e) => set("lv", e.target.value)} className="ad-input" /></F>
          <F label="Required XP"><input type="number" min="0" value={draft.xpRequired} onChange={(e) => set("xpRequired", e.target.value)} className="ad-input" /></F>
          <F label="Name (Bangla)"><input value={draft.nameBn} onChange={(e) => set("nameBn", e.target.value)} placeholder="এলিট ১" className="ad-input" /></F>
          <F label="Name (English)"><input value={draft.nameEn} onChange={(e) => set("nameEn", e.target.value)} placeholder="Elite I" className="ad-input" /></F>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <F label="Convert ratio (VP per ৳1)"><input type="number" min="1" value={draft.convertRatio} onChange={(e) => set("convertRatio", e.target.value)} className="ad-input" /></F>
          <F label="Upgrade bonus (৳)"><input type="number" min="0" value={draft.upgradeBonus} onChange={(e) => set("upgradeBonus", e.target.value)} className="ad-input" /></F>
          <F label="Monthly bonus (৳)"><input type="number" min="0" value={draft.monthlyBonus} onChange={(e) => set("monthlyBonus", e.target.value)} className="ad-input" /></F>
          <F label="Rebate (%)"><input type="number" min="0" step="0.1" value={draft.rebatePercent} onChange={(e) => set("rebatePercent", e.target.value)} className="ad-input" /></F>
          <F label="Order"><input type="number" min="0" value={draft.order} onChange={(e) => set("order", e.target.value)} className="ad-input" /></F>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <F label="Color">
            <input type="color" value={draft.color} onChange={(e) => set("color", e.target.value)} className="ad-input h-11 p-1" />
          </F>
          <div>
            <label className="ad-label">Badge (tier trophy, 200×200 px)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/30">
                {draft.badge ? <img src={imageUrl(draft.badge)} alt="" className="h-full w-full object-contain" /> : <Crown size={16} className="text-[var(--text-disabled)]" />}
              </span>
              <button type="button" onClick={() => badgeRef.current?.click()} disabled={busy === "badge"} className="ad-btn ad-btn--ghost ad-btn--sm">
                {busy === "badge" ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              </button>
              {draft.badge ? <button type="button" onClick={() => set("badge", "")} className="ad-btn ad-btn--danger ad-btn--sm"><X size={13} /></button> : null}
              <input ref={badgeRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImg(e.target.files?.[0], "badge")} />
            </div>
          </div>
          <div>
            <label className="ad-label">Icon (small, 64×64 px)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-white/[0.08] bg-black/30">
                {draft.icon ? <img src={imageUrl(draft.icon)} alt="" className="h-full w-full object-contain" /> : <Crown size={16} className="text-[var(--text-disabled)]" />}
              </span>
              <button type="button" onClick={() => iconRef.current?.click()} disabled={busy === "icon"} className="ad-btn ad-btn--ghost ad-btn--sm">
                {busy === "icon" ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
              </button>
              {draft.icon ? <button type="button" onClick={() => set("icon", "")} className="ad-btn ad-btn--danger ad-btn--sm"><X size={13} /></button> : null}
              <input ref={iconRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadImg(e.target.files?.[0], "icon")} />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-[14px] text-[var(--text-muted)]">
              <input type="checkbox" checked={draft.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Active
            </label>
            <label className="flex items-center gap-2 text-[14px] text-[var(--text-muted)]">
              <input type="checkbox" checked={draft.inviteOnly} onChange={(e) => set("inviteOnly", e.target.checked)} />
              Invite only
            </label>
          </div>
        </div>

        {/* সুবিধার তালিকা */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="ad-label">Perks (shown on the VIP club page)</label>
            <button type="button" onClick={() => set("perks", [...draft.perks, { bn: "", en: "" }])} className="ad-btn ad-btn--ghost ad-btn--sm">
              <Plus size={13} /> Add perk
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {draft.perks.map((p, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={p.bn} onChange={(e) => { const n = [...draft.perks]; n[i] = { ...n[i], bn: e.target.value }; set("perks", n); }} placeholder="সুবিধা (বাংলা)" className="ad-input" />
                <input value={p.en} onChange={(e) => { const n = [...draft.perks]; n[i] = { ...n[i], en: e.target.value }; set("perks", n); }} placeholder="Perk (English)" className="ad-input" />
                <button type="button" onClick={() => set("perks", draft.perks.filter((_, x) => x !== i))} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={Boolean(busy)} className="ad-btn ad-btn--primary">
            {busy === "save" ? <Loader2 size={16} className="animate-spin" /> : editing ? <Save size={16} /> : <Plus size={16} />}
            {editing ? "Save changes" : "Add level"}
          </button>
          {editing ? <button type="button" onClick={reset} className="ad-btn ad-btn--ghost">Cancel</button> : null}
        </div>
      </form>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]"><Loader2 size={16} className="animate-spin" /> Loading…</div>
      ) : items.length === 0 ? (
        <div className="ad-card flex flex-col items-center gap-3 py-10 text-center">
          <Crown size={28} className="text-[var(--text-disabled)]" />
          <p className="text-[15px] font-semibold text-[var(--neutral100)]">No levels yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="ad-card">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px]" style={{ background: `color-mix(in srgb, ${item.color || "#f9b901"}, transparent 82%)`, color: item.color || "#f9b901" }}>
                  {item.icon ? <img src={imageUrl(item.icon)} alt="" className="h-6 w-6 object-contain" /> : <Crown size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[var(--neutral100)]">
                    LV{item.lv} · {item.name?.en || item.name?.bn || "—"}
                  </p>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    XP {Number(item.xpRequired).toLocaleString()} · {item.upgradeBonus ? `৳${item.upgradeBonus} bonus · ` : ""}{item.rebatePercent ? `${item.rebatePercent}% rebate · ` : ""}{item.isActive !== false ? "Active" : "Off"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startEdit(item)} className="ad-btn ad-btn--ghost ad-btn--sm"><Pencil size={13} /></button>
                  <button type="button" onClick={() => setDel(item)} className="ad-btn ad-btn--danger ad-btn--sm"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(del)}
        danger
        busy={busy === "del"}
        title="Delete this level?"
        message={del ? `LV${del.lv} (${del.name?.en || del.name?.bn || ""}) will be removed from the ladder.` : ""}
        confirmText="Delete"
        onConfirm={remove}
        onClose={() => busy !== "del" && setDel(null)}
      />
    </div>
  );
};

const F = ({ label, children }) => (
  <div>
    <label className="ad-label">{label}</label>
    {children}
  </div>
);

export default VipLevels;
