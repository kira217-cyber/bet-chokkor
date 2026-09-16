import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Mail, MessageCircle, Phone, RefreshCw, Save, Send } from "lucide-react";

import { api } from "../../api/axios";

const LOOK = {
  email: {
    label: "Email",
    Icon: Mail,
    color: "var(--status-info)",
    hint: "Just the address — mailto: is added for you.",
    placeholder: "support@betchokkor.com",
  },
  telegram: {
    label: "Telegram",
    Icon: Send,
    color: "#2AABEE",
    hint: "The full channel or chat link.",
    placeholder: "https://t.me/betchokkor",
  },
  whatsapp: {
    label: "WhatsApp",
    Icon: MessageCircle,
    color: "#25D366",
    hint: "A wa.me link with the number.",
    placeholder: "https://wa.me/8801700000000",
  },
};

/**
 * সাইডবারের "যোগাযোগ করুন"।
 *
 * প্রতিটা মাধ্যমের লিংক এখান থেকেই বসে, আর আলাদা করে চালু-বন্ধ করা
 * যায়। যেগুলো চালু শুধু সেগুলোই ক্লায়েন্টের সাইডবারে দেখা যায়।
 *
 * লিংক না দিয়ে চালু করা যায় না — সার্ভারও সেটা মানে না। চালু দেখিয়ে
 * খালি লিংক রাখলে ব্যবহারকারী ক্লিক করে কোথাও যেতেন না, অথচ অ্যাডমিন
 * ভাবতেন কাজ হয়ে গেছে।
 */
const ContactLinks = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);

      const { data } = await api.get("/api/contact/admin");
      setRows(data?.data?.channels || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    api
      .get("/api/contact/admin")
      .then(({ data }) => alive && setRows(data?.data?.channels || []))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load"),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const set = (key, patch) =>
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );

  const save = async () => {
    try {
      setBusy(true);

      const { data } = await api.put("/api/contact/admin", { channels: rows });

      setRows(data?.data?.channels || []);
      toast.success("Saved");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const liveCount = rows.filter((row) => row.isActive && row.url).length;

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">Contact Links</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            What shows under &ldquo;Contact Us&rdquo; in the player sidebar.
          </p>
        </div>

        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="ad-btn ad-btn--ghost ad-btn--sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="ad-card mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[var(--primary500)]/25 bg-[var(--primary500)]/10 text-[var(--primary500)]">
          <Phone size={18} />
        </span>

        <p className="text-[13px] text-[var(--text-muted)]">
          {liveCount === 0
            ? "Nothing is live — the Contact Us row stays hidden in the sidebar until you turn at least one on."
            : `${liveCount} of ${rows.length} are live in the sidebar right now.`}
        </p>
      </div>

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => {
            const look = LOOK[row.key] || {
              label: row.key,
              Icon: Phone,
              color: "var(--primary500)",
            };
            const { Icon } = look;

            return (
              <div key={row.key} className="ad-card">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${look.color}, transparent 86%)`,
                      color: look.color,
                    }}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold text-[var(--neutral100)]">
                      {look.label}
                    </p>
                    <p className="text-[12px] text-[var(--text-disabled)]">
                      {look.hint}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!row.url}
                    onClick={() => set(row.key, { isActive: !row.isActive })}
                    title={row.url ? "" : "Add a link first"}
                    className={`ad-btn ad-btn--sm ms-auto ${
                      row.isActive ? "ad-btn--primary" : "ad-btn--ghost"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {row.isActive ? "Shown" : "Hidden"}
                  </button>
                </div>

                <label className="ad-label mt-4" htmlFor={`contact-${row.key}`}>
                  Link
                </label>
                <input
                  id={`contact-${row.key}`}
                  value={row.url}
                  onChange={(event) => set(row.key, { url: event.target.value })}
                  placeholder={look.placeholder}
                  className="ad-input"
                />
              </div>
            );
          })}

          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="ad-btn ad-btn--primary mt-1 w-full sm:w-auto"
          >
            {busy ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save changes
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactLinks;
