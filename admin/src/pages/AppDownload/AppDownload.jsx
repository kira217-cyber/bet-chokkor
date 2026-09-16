import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  Download,
  Loader2,
  RefreshCw,
  Save,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";

import { api } from "../../api/axios";

const readableSize = (bytes) => {
  const mb = Number(bytes || 0) / (1024 * 1024);
  if (mb <= 0) return "—";
  return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(mb * 1024).toFixed(0)} KB`;
};

/**
 * অ্যাপ ডাউনলোড — APK আপলোড, বদল, মুছে ফেলা আর "না থাকলে" বার্তা।
 *
 * ফাইলটা যে নামে আপলোড হবে ঠিক সেই নামেই ব্যবহারকারীর কাছে নামে, তাই
 * নামটা অর্থপূর্ণ রাখা ভালো (যেমন betchokkor-2.4.apk)। APK না থাকলে
 * ক্লায়েন্টে বোতামের বদলে নিচের বার্তাটা দেখা যায়।
 */
const AppDownload = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [progress, setProgress] = useState(0);

  const [version, setVersion] = useState("");
  const [note, setNote] = useState({ bn: "", en: "" });

  const fileRef = useRef(null);

  const apply = (data) => {
    setInfo(data);
    setVersion(data?.version || "");
    if (data?.note) setNote({ bn: data.note.bn || "", en: data.note.en || "" });
  };

  const load = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const { data } = await api.get("/api/app-download/admin");
      apply(data?.data);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    api
      .get("/api/app-download/admin")
      .then(({ data }) => alive && apply(data?.data))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load"),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const upload = async (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".apk")) {
      toast.error("Only .apk files are allowed");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("APK must be 100 MB or smaller");
      return;
    }

    try {
      setBusy("upload");
      setProgress(0);

      const form = new FormData();
      form.append("apk", file);
      if (version.trim()) form.append("version", version.trim());

      const { data } = await api.post("/api/app-download/admin/upload", form, {
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        },
      });

      apply({ ...info, ...data?.data, note });
      toast.success("App uploaded");
      await load(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    } finally {
      setBusy("");
      setProgress(0);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveNote = async () => {
    try {
      setBusy("note");
      await api.put("/api/app-download/admin", { note, version: version.trim() });
      toast.success("Saved");
      await load(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Save failed");
    } finally {
      setBusy("");
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove the uploaded APK?")) return;

    try {
      setBusy("delete");
      await api.delete("/api/app-download/admin");
      toast.success("Removed");
      await load(true);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="ad-title text-[26px] lg:text-[30px]">App Download</h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            The APK players get from the App Download page.
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

      {loading ? (
        <div className="ad-card flex items-center gap-3 text-[var(--text-muted)]">
          <Loader2 size={16} className="animate-spin" />
          Loading…
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* ── এখনকার অবস্থা ── */}
          <div className="ad-card">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px]"
                style={{
                  background: info?.available
                    ? "color-mix(in srgb, var(--status-success), transparent 86%)"
                    : "color-mix(in srgb, var(--status-pending), transparent 86%)",
                  color: info?.available
                    ? "var(--status-success)"
                    : "var(--status-pending)",
                }}
              >
                <Smartphone size={22} />
              </span>

              <div className="min-w-0">
                {info?.available ? (
                  <>
                    <p className="break-all text-[15px] font-extrabold text-[var(--neutral100)]">
                      {info.fileName}
                    </p>
                    <p className="text-[13px] text-[var(--text-muted)]">
                      {readableSize(info.size)}
                      {info.version ? ` · v${info.version}` : ""} · live in the
                      sidebar
                    </p>
                  </>
                ) : (
                  <p className="text-[14px] text-[var(--text-muted)]">
                    No APK uploaded — players see the message below instead.
                  </p>
                )}
              </div>

              {info?.available ? (
                <div className="ms-auto flex gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL || ""}/api/app-download/file`}
                    className="ad-btn ad-btn--ghost ad-btn--sm"
                  >
                    <Download size={15} />
                    Test
                  </a>

                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={remove}
                    className="ad-btn ad-btn--danger ad-btn--sm"
                  >
                    {busy === "delete" ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                    Remove
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* ── আপলোড ── */}
          <div className="ad-card">
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
              {info?.available ? "Replace the APK" : "Upload an APK"}
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              Up to 100 MB. It downloads under the exact name you upload, so name
              the file well.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="ad-label" htmlFor="apk-version">
                  Version (optional)
                </label>
                <input
                  id="apk-version"
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                  placeholder="2.4"
                  className="ad-input"
                />
              </div>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept=".apk"
              hidden
              onChange={(event) => upload(event.target.files?.[0])}
            />

            {busy === "upload" ? (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-[13px] text-[var(--text-muted)]">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--neutral800)]">
                  <div
                    className="h-full bg-[var(--primary500)] transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="ad-btn ad-btn--primary mt-4"
              >
                <Upload size={16} />
                Choose .apk file
              </button>
            )}
          </div>

          {/* ── না থাকলে বার্তা ── */}
          <div className="ad-card">
            <h2 className="text-[16px] font-extrabold text-[var(--neutral100)]">
              Message when no APK is up
            </h2>
            <p className="mt-1 text-[13px] text-[var(--text-muted)]">
              Shown on the App Download page while there is no file.
            </p>

            <div className="mt-4 grid gap-4">
              <div>
                <label className="ad-label" htmlFor="note-bn">
                  Bangla
                </label>
                <textarea
                  id="note-bn"
                  rows={2}
                  value={note.bn}
                  onChange={(event) =>
                    setNote((prev) => ({ ...prev, bn: event.target.value }))
                  }
                  className="ad-input h-auto py-3"
                />
              </div>

              <div>
                <label className="ad-label" htmlFor="note-en">
                  English
                </label>
                <textarea
                  id="note-en"
                  rows={2}
                  value={note.en}
                  onChange={(event) =>
                    setNote((prev) => ({ ...prev, en: event.target.value }))
                  }
                  className="ad-input h-auto py-3"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveNote}
              disabled={Boolean(busy)}
              className="ad-btn ad-btn--primary mt-4"
            >
              {busy === "note" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save message
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDownload;
