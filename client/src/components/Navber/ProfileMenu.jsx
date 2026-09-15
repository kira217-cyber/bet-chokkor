import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Copy, UserRound } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { selectUser } from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";
import { buildProfileMenu } from "./profileMenuItems";

/**
 * হেডারের "প্রোফাইল" ড্রপডাউন।
 *
 * মূল সাইট থেকে মাপা (১৪৪০ প্রস্থে): প্যানেল ৩৭৫px চওড়া, হেডারের ঠিক
 * নিচ থেকে শুরু, ভিতরে দুপাশে ১৬px। উপরে অ্যাভাটার ৪০px, নিচে নামের
 * পাশে কপি আইকন, তারপর সাইন আপের তারিখ। প্রতিটা সারি ৫৫px উঁচু,
 * বাঁয়ে আইকন আর ডানে শেভরন। সবার নিচে আউটলাইন করা লগ আউট বাটন।
 *
 * বাইরে ক্লিক বা Esc এ বন্ধ হয়, নইলে মেনু খোলা রেখে পাতা ঘোরালে ভুল
 * জায়গায় ক্লিক লেগে যেত।
 */
const ProfileMenu = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert, showConfirm } = useAlert();

  const user = useSelector(selectUser);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrapRef = useRef(null);

  // প্যানেলটা মূল সাইটের মতো হেডারের গা ঘেঁষে ঝোলে। বাটনটা হেডারের
  // মাঝখানে বসে, তাই বাটনের নিচ থেকে মাপলে কয়েক পিক্সেল ফাঁক থেকে
  // যেত — তাই fixed করে হেডারের উচ্চতা থেকেই শুরু, বাঁ দিকটা বাটনের
  // জায়গা মেপে নেওয়া
  const [left, setLeft] = useState(0);

  useEffect(() => {
    if (!open) return undefined;

    const onDocClick = (event) => {
      if (!wrapRef.current?.contains(event.target)) setOpen(false);
    };

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const place = () => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (rect) setLeft(rect.left);
    };

    place();
    window.addEventListener("resize", place);

    return () => window.removeEventListener("resize", place);
  }, [open]);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user?.userId || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ডে অনুমতি না থাকলে চুপচাপ থাক — আইডি চোখের সামনেই আছে
    }
  };

  const signupDate = user?.createdAt
    ? new Date(user.createdAt).toISOString().slice(0, 10)
    : "—";

  const onLogout = async () => {
    setOpen(false);

    if (await showConfirm({ message: t("logoutConfirm") })) {
      dispatch(logout());
      navigate("/");
    }
  };

  const rowStyle = {
    height: "calc(var(--u) * 14.667)",
    paddingInline: "calc(var(--u) * 4.267)",
    gap: "calc(var(--u) * 3.2)",
    fontSize: "var(--fs-larger)",
  };

  const items = buildProfileMenu(t);

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex cursor-pointer items-center rounded-[10px] px-3 py-2 font-semibold transition-colors"
        style={{
          gap: "calc(var(--u) * 2.133)",
          fontSize: "var(--fs-larger)",
          color: open ? "var(--neutral100)" : "var(--text-secondary)",
        }}
      >
        <UserRound size={15} />
        {t("profileMenu")}
      </button>

      {open ? (
        <div
          role="menu"
          className="fixed overflow-hidden bg-[var(--neutral900)] shadow-lg"
          style={{
            top: "var(--desktop-header-height)",
            left: `${left}px`,
            width: "375px",
            borderRadius: "0 0 var(--radius-10) var(--radius-10)",
            borderBottom: "1px solid var(--neutral800)",
            borderInline: "1px solid var(--neutral800)",
          }}
        >
          <div
            style={{
              padding: "calc(var(--u) * 4.267)",
              borderBottom: "1px solid var(--neutral800)",
            }}
          >
            <div
              className="flex items-center"
              style={{ gap: "calc(var(--u) * 3.2)" }}
            >
              <div
                className="flex shrink-0 items-center justify-center rounded-full bg-[var(--neutral800)] text-[var(--primary500)]"
                style={{
                  height: "calc(var(--u) * 10.667)",
                  width: "calc(var(--u) * 10.667)",
                }}
              >
                <UserRound size={20} />
              </div>

              <div className="min-w-0">
                <p
                  className="text-[var(--text-muted)]"
                  style={{ fontSize: "var(--fs-normal)" }}
                >
                  {t("username")}
                </p>

                <div
                  className="flex items-center"
                  style={{
                    gap: "calc(var(--u) * 1.6)",
                    marginTop: "calc(var(--u) * 0.533)",
                  }}
                >
                  <span
                    className="truncate font-bold text-[var(--neutral100)]"
                    style={{ fontSize: "var(--fs-larger)" }}
                  >
                    {user?.userId || "—"}
                  </span>

                  <button
                    type="button"
                    onClick={copyId}
                    aria-label={t("copied")}
                    className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--primary500)]"
                  >
                    <Copy size={13} />
                  </button>

                  {copied ? (
                    <span
                      className="text-[var(--status-success)]"
                      style={{ fontSize: "var(--fs-small)" }}
                    >
                      {t("copied")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <p
              className="text-[var(--text-muted)]"
              style={{
                fontSize: "var(--fs-normal)",
                marginTop: "calc(var(--u) * 3.2)",
              }}
            >
              {t("signupDate")} : {signupDate}
            </p>
          </div>

          <div style={{ paddingBlock: "calc(var(--u) * 1.067)" }}>
            {items.map((item) => {
              const RowIcon = item.Icon;

              const inner = (
                <>
                  <RowIcon
                    size={17}
                    className="shrink-0 text-[var(--text-muted)]"
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    size={15}
                    className="shrink-0 text-[var(--text-disabled)]"
                  />
                </>
              );

              if (item.soon) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      showAlert({
                        title: t("soonTitle"),
                        message: t("soonText"),
                      });
                    }}
                    className="flex w-full cursor-pointer items-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral800)] hover:text-[var(--neutral100)]"
                    style={rowStyle}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral800)] hover:text-[var(--neutral100)]"
                  style={rowStyle}
                >
                  {inner}
                </Link>
              );
            })}
          </div>

          <div style={{ padding: "calc(var(--u) * 4.267)" }}>
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full cursor-pointer items-center justify-center font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
              style={{
                height: "calc(var(--u) * 11.733)",
                borderRadius: "var(--radius-10)",
                border: "1px solid var(--neutral600)",
                fontSize: "var(--fs-larger)",
              }}
            >
              {t("logout")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProfileMenu;
