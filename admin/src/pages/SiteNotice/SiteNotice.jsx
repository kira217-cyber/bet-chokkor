import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Megaphone, RefreshCw, Save } from "lucide-react";

import { api } from "../../api/axios";

/**
 * হোম পেজের চলমান নোটিশ (মার্কি) — বাংলা ও ইংরেজি।
 */
const SiteNotice = () => {
  const [bn, setBn] = useState("");
  const [en, setEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/site-content/admin/notice");
      const n = data?.data?.notice || {};
      setBn(n.text?.bn || "");
      setEn(n.text?.en || "");
      setIsActive(n.isActive !== false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      setBusy(true);
      await api.put("/api/site-content/admin/notice", {
        text: { bn, en },
        isActive,
      });
      toast.success("Notice saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[800px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Notice</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            The scrolling notice shown on top of the home page.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="ad-btn ad-btn--ghost ad-btn--sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <form onSubmit={save} className="ad-card flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-[var(--neutral100)]">
          <Megaphone size={18} className="text-[var(--primary500)]" />
          Notice text
        </h2>

        <div>
          <label className="ad-label">Notice (Bangla)</label>
          <textarea value={bn} onChange={(e) => setBn(e.target.value)} rows={2} placeholder="নোটিশ..." className="ad-input" />
        </div>
        <div>
          <label className="ad-label">Notice (English)</label>
          <textarea value={en} onChange={(e) => setEn(e.target.value)} rows={2} placeholder="Notice..." className="ad-input" />
        </div>

        <label className="flex w-fit items-center gap-2 text-[14px] text-[var(--text-muted)]">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Show on site
        </label>

        <button type="submit" disabled={busy} className="ad-btn ad-btn--primary w-fit">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save notice
        </button>
      </form>
    </div>
  );
};

export default SiteNotice;
