import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2, RefreshCcw, X } from "lucide-react";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { updateUser } from "../../features/auth/authSlice";

/**
 * গেমের পাতা — পুরো পর্দা জুড়ে গেমটা।
 *
 * ব্রাউজার সার্ভারের কাছে লিংক চায়, সার্ভার নিজের কী দিয়ে গেম
 * প্ল্যাটফর্ম থেকে লিংকটা এনে দেয় — কী কখনো এখানে আসে না।
 *
 * বেরিয়ে আসার সময় ব্যালেন্সটা আবার আনা হয়: খেলার টাকা কাটা-জমা হয়
 * কলব্যাকে, তাই হেডারে দেখানো অঙ্কটা ততক্ষণে পুরোনো হয়ে গেছে।
 */
const PlayGame = () => {
  const { gameUId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useLanguage();

  /**
   * ফলটা কোন চেষ্টার, সেটা `attempt` বলে দেয়।
   *
   * আলাদা `loading` state রাখলে effect এর ভিতরেই সেটা বসাতে হতো, আর
   * তাতে বাড়তি রেন্ডার হতো — তাই হাতে থাকা ফলটা এখনকার চেষ্টার কিনা
   * সেটা মিলিয়েই লোডিং বোঝা হয়।
   */
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ attempt: -1, launchUrl: "", error: "" });

  const loading = result.attempt !== attempt;

  useEffect(() => {
    if (!gameUId) return undefined;

    let alive = true;

    api
      .post("/api/play-game/playgame", { game_uid: gameUId })
      .then(({ data }) => {
        if (!alive) return;

        const url = data?.data?.launchUrl || "";

        setResult({
          attempt,
          launchUrl: url,
          error: url ? "" : t("gameLaunchFailed"),
        });
      })
      .catch((err) => {
        if (!alive) return;

        setResult({
          attempt,
          launchUrl: "",
          error: err?.response?.data?.message || t("gameLaunchFailed"),
        });
      });

    return () => {
      alive = false;
    };
  }, [gameUId, attempt, t]);

  const launch = useCallback(() => setAttempt((prev) => prev + 1), []);

  const { launchUrl, error } = result;

  const close = () => {
    // বেরোনোর সময় নতুন ব্যালেন্স — গেমে যা হয়েছে সেটা ধরা পড়ে
    api
      .get("/api/user/me")
      .then(({ data }) => {
        if (data?.data?.user) dispatch(updateUser(data.data.user));
      })
      .catch(() => {});

    navigate(-1);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black">
      <button
        type="button"
        onClick={close}
        aria-label={t("close")}
        className="absolute right-3 top-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition hover:bg-black/80"
      >
        <X size={18} />
      </button>

      {loading ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
          <Loader2 size={26} className="animate-spin text-[var(--primary500)]" />
          <p style={{ fontSize: "var(--fs-larger)" }}>{t("gamePreparing")}</p>
        </div>
      ) : null}

      {!loading && !launchUrl ? (
        <div className="flex h-full w-full items-center justify-center px-4">
          <div
            className="w-full max-w-[420px] bg-[var(--neutral900)] text-center"
            style={{
              borderRadius: "var(--radius-10)",
              padding: "calc(var(--u) * 6.4) calc(var(--u) * 4.267)",
            }}
          >
            <h2
              className="font-bold text-[var(--neutral100)]"
              style={{ fontSize: "var(--fs-h4)" }}
            >
              {t("gameFailedTitle")}
            </h2>

            <p
              className="text-[var(--text-secondary)]"
              style={{
                fontSize: "var(--fs-larger)",
                marginBlock: "calc(var(--u) * 3.2)",
              }}
            >
              {error || t("gameFailedText")}
            </p>

            <div
              className="flex items-center justify-center"
              style={{ gap: "calc(var(--u) * 2.133)" }}
            >
              <button
                type="button"
                onClick={launch}
                className="flex cursor-pointer items-center font-bold text-[var(--btn-primary-txt)]"
                style={{
                  backgroundColor: "var(--primary500)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                  gap: "calc(var(--u) * 1.6)",
                  height: "calc(var(--u) * 10.667)",
                  paddingInline: "calc(var(--u) * 4.267)",
                }}
              >
                <RefreshCcw size={15} />
                {t("tryAgain")}
              </button>

              <button
                type="button"
                onClick={close}
                className="flex cursor-pointer items-center font-semibold text-[var(--text-secondary)]"
                style={{
                  border: "1px solid var(--neutral600)",
                  borderRadius: "var(--radius-10)",
                  fontSize: "var(--fs-larger)",
                  height: "calc(var(--u) * 10.667)",
                  paddingInline: "calc(var(--u) * 4.267)",
                }}
              >
                {t("back")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!loading && launchUrl ? (
        <iframe
          src={launchUrl}
          title="game"
          className="h-full w-full border-0"
          allow="fullscreen; autoplay"
          allowFullScreen
        />
      ) : null}
    </div>
  );
};

export default PlayGame;
