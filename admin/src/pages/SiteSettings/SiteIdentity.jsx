import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Save } from "lucide-react";

import { api } from "../../api/axios";
import { HistoryHeader } from "../../components/HistoryBits/HistoryBits";
import { ImageRow } from "./bits";

/**
 * ক্লায়েন্ট ও অ্যাফিলিয়েট সাইটের পরিচয় (লোগো/favicon/টাইটেল) — এক
 * কম্পোনেন্ট, শুধু endpoint বদলায়।
 */
const IdentityPage = ({ title, subtitle, endpoint, Icon }) => {
  const [draft, setDraft] = useState({ siteName: "", logo: "", brandLogo: "", favicon: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/site-settings/admin/${endpoint}`);
      const d = data?.data?.data || {};
      setDraft({
        siteName: d.siteName || "",
        logo: d.logo || "",
        brandLogo: d.brandLogo || "",
        favicon: d.favicon || "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const save = async () => {
    try {
      setBusy(true);
      await api.put(`/api/site-settings/admin/${endpoint}`, draft);
      toast.success("Saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
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
    <div className="mx-auto max-w-[820px]">
      <HistoryHeader title={title} subtitle={subtitle} Icon={Icon} />

      <div className="ad-card mb-4 flex flex-col gap-4">
        <div>
          <label className="ad-label">Website title (browser tab)</label>
          <input value={draft.siteName} onChange={(e) => set("siteName", e.target.value)} className="ad-input" placeholder="BET CHOKKOR" />
        </div>

        <ImageRow label="Header logo" size="≈ 260 × 64 px" value={draft.logo} onChange={(v) => set("logo", v)} />
        <ImageRow label="Brand / footer logo" size="≈ 200 × 64 px" value={draft.brandLogo} onChange={(v) => set("brandLogo", v)} />
        <ImageRow label="Favicon (browser tab icon)" size="≈ 64 × 64 px (png)" value={draft.favicon} onChange={(v) => set("favicon", v)} box="h-14 w-14" />
      </div>

      <button type="button" onClick={save} disabled={busy} className="ad-btn ad-btn--primary">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save
      </button>
    </div>
  );
};

export default IdentityPage;
