import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Bell, Loader2 } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { useLanguage } from "../../Context/LanguageProvider";
import { imageUrl } from "../../features/deposit/imageUrl";
import {
  fetchNotifications,
  markNotificationsSeen,
} from "../../features/notification/notificationApi";
import { clearUnread } from "../../features/notification/notificationSlice";

/**
 * নোটিফিকেশন (ইনবক্স)।
 *
 * অ্যাডমিনের পাঠানো নোটিশ — শিরোনাম, বিবরণ আর ঐচ্ছিক ছবিসহ কার্ড।
 * পাতা খোলা মাত্রই "দেখা হয়েছে" পাঠানো হয়, তাই হেডারের লাল ব্যাজ ০
 * হয়ে যায়। নতুন (না-পড়া) নোটিশে ছোট সোনালি টিপ।
 */
const Notification = () => {
  const { t, tv } = useLanguage();
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchNotifications()
      .then((data) => {
        if (!alive) return;
        setItems(data.notifications || []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    // পাতায় ঢুকলেই সব পড়া ধরা হয় — ব্যাজ সাথে সাথে মিলিয়ে যায়
    markNotificationsSeen()
      .then(() => dispatch(clearUnread()))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [dispatch]);

  const fmtDate = (value) =>
    value ? new Date(value).toLocaleString() : "";

  return (
    <MemberPage title={t("notification")} maxWidth="820px">
      {loading ? (
        <div
          className="flex items-center justify-center text-[var(--text-muted)]"
          style={{
            gap: "calc(var(--u) * 2.133)",
            paddingBlock: "calc(var(--u) * 10.667)",
          }}
        >
          <Loader2 size={18} className="animate-spin" />
          {t("loading")}
        </div>
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center text-center"
          style={{
            gap: "calc(var(--u) * 3.2)",
            paddingBlock: "calc(var(--u) * 10.667)",
          }}
        >
          <Bell size={28} className="text-[var(--text-disabled)]" />
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {t("noNotification")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col" style={{ gap: "calc(var(--u) * 2.133)" }}>
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-[var(--neutral800)]"
              style={{
                borderRadius: "var(--radius-10)",
                padding: "calc(var(--u) * 4.267)",
                border: item.isNew
                  ? "1px solid color-mix(in srgb, var(--primary500), transparent 55%)"
                  : "1px solid transparent",
              }}
            >
              <div
                className="flex items-start justify-between"
                style={{ gap: "calc(var(--u) * 3.2)" }}
              >
                <h3
                  className="dep-label flex items-center font-bold text-[var(--neutral100)]"
                  style={{ gap: "calc(var(--u) * 2.133)" }}
                >
                  {item.isNew ? (
                    <span
                      className="shrink-0 rounded-full"
                      style={{
                        height: "calc(var(--u) * 2.133)",
                        width: "calc(var(--u) * 2.133)",
                        background: "var(--primary500)",
                      }}
                    />
                  ) : null}
                  {tv(item.title) || "—"}
                </h3>

                <span
                  className="shrink-0 text-[var(--text-disabled)]"
                  style={{ fontSize: "var(--fs-small)" }}
                >
                  {fmtDate(item.createdAt)}
                </span>
              </div>

              {item.imageUrl ? (
                <img
                  src={imageUrl(item.imageUrl)}
                  alt=""
                  className="w-full object-cover"
                  style={{
                    marginTop: "calc(var(--u) * 3.2)",
                    borderRadius: "var(--radius-10)",
                    maxHeight: "320px",
                  }}
                  draggable="false"
                />
              ) : null}

              {tv(item.description) ? (
                <p
                  className="whitespace-pre-line text-[var(--text-secondary)]"
                  style={{
                    marginTop: "calc(var(--u) * 3.2)",
                    fontSize: "var(--fs-larger)",
                    lineHeight: 1.6,
                  }}
                >
                  {tv(item.description)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </MemberPage>
  );
};

export default Notification;
