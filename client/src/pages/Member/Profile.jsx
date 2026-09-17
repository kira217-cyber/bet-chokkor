import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Copy, LogOut, Wallet } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { selectUser } from "../../features/auth/authSelectors";
import { logout, updateUser } from "../../features/auth/authSlice";
import { selectUnread } from "../../features/notification/notificationSlice";
import { fetchMyDeposits } from "../../features/deposit/depositApi";
import { buildProfileMenu } from "../../components/Navber/profileMenuItems";

const STATUS_COLOR = {
  pending: "var(--status-pending)",
  approved: "var(--status-success)",
  rejected: "var(--status-danger)",
};

const Row = ({ label, children }) => (
  <div
    className="flex items-baseline justify-between gap-4"
    style={{ paddingBlock: "calc(var(--u) * 1.6)" }}
  >
    <span
      className="text-[var(--text-secondary)]"
      style={{ fontSize: "var(--fs-larger)" }}
    >
      {label}
    </span>

    <span
      className="break-all text-right font-semibold text-[var(--neutral100)]"
      style={{ fontSize: "var(--fs-larger)" }}
    >
      {children}
    </span>
  </div>
);

const card = {
  borderRadius: "var(--radius-10)",
  padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
};

/**
 * নিজের প্রোফাইল।
 *
 * ব্যালেন্স, নিজের তথ্য, চলতি টার্নওভারের অগ্রগতি আর সাম্প্রতিক
 * ডিপোজিট — এক পাতায়। টার্নওভার দেখানোটা জরুরি, কারণ বোনাসের টাকা
 * কেন এখনো তোলা যাচ্ছে না সেটা নইলে বোঝা যায় না।
 */
const Profile = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert, showConfirm } = useAlert();

  const user = useSelector(selectUser);
  const unread = useSelector(selectUnread);

  const [deposits, setDeposits] = useState([]);
  const [turnovers, setTurnovers] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    // নিজের সবশেষ তথ্য — ব্যালেন্স পুরোনো হয়ে থাকতে পারে
    api
      .get("/api/user/me")
      .then(({ data }) => {
        if (alive && data?.data?.user) dispatch(updateUser(data.data.user));
      })
      .catch(() => {});

    fetchMyDeposits(5)
      .then((list) => alive && setDeposits(list))
      .catch(() => {});

    api
      .get("/api/turnover/my?status=running")
      .then(({ data }) => alive && setTurnovers(data?.data?.turnovers || []))
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [dispatch]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(user?.referralCode || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে কোডটা পর্দাতেই দেখা যাচ্ছে
    }
  };

  const handleLogout = async () => {
    const yes = await showConfirm({
      title: t("logout"),
      message: t("logoutConfirm"),
    });

    if (!yes) return;

    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <MemberPage title={t("profileTitle")} onBack={() => navigate("/")}>
      <div className="flex flex-col" style={{ gap: "calc(var(--u) * 3.2)" }}>
        {/* ── ব্যালেন্স ── */}
        <div className="bg-[var(--neutral800)]" style={card}>
          <p
            className="text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-small)" }}
          >
            {t("balanceLabel")}
          </p>

          <p
            className="font-black text-[var(--primary500)]"
            style={{ fontSize: "var(--fs-h3)" }}
          >
            {user?.currency || "BDT"} {Number(user?.balance || 0).toFixed(2)}
          </p>

          <button
            type="button"
            onClick={() => navigate("/member/wallet/deposit")}
            className="mt-3 flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] hover:brightness-105"
            style={{
              height: "calc(var(--u) * 11.2)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
              backgroundColor: "var(--primary500)",
              color: "var(--btn-primary-txt)",
              gap: "calc(var(--u) * 2.133)",
            }}
          >
            <Wallet size={16} />
            {t("deposit")}
          </button>
        </div>

        {/* ── মেনু ──
            ডেস্কটপে এই তালিকাটা হেডারের প্রোফাইল ড্রপডাউনে; মোবাইলে
            ড্রপডাউন নেই, তাই ইতিহাসের পাতাগুলোয় যাওয়ার একমাত্র রাস্তা
            এটাই। দুই জায়গায় একই তালিকা (components/Navber/profileMenu.js) */}
        <div className="overflow-hidden bg-[var(--neutral900)]" style={{ borderRadius: "var(--radius-10)" }}>
          {buildProfileMenu(t)
            .filter((item) => item.key !== "personal")
            .map((item) => {
              const RowIcon = item.Icon;

              const inner = (
                <>
                  <RowIcon size={16} className="shrink-0 text-[var(--primary500)]" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.key === "notification" && unread > 0 ? (
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
                      style={{
                        minWidth: "calc(var(--u) * 4.8)",
                        height: "calc(var(--u) * 4.8)",
                        paddingInline: "calc(var(--u) * 1.333)",
                        fontSize: "var(--fs-small)",
                        background: "var(--status-danger, #e5484d)",
                        lineHeight: 1,
                      }}
                    >
                      {unread > 99 ? "99+" : unread}
                    </span>
                  ) : null}
                  <ChevronRight size={14} className="shrink-0 text-[var(--text-disabled)]" />
                </>
              );

              const rowStyle = {
                height: "calc(var(--u) * 14.667)",
                paddingInline: "calc(var(--u) * 4.267)",
                gap: "calc(var(--u) * 3.2)",
                fontSize: "var(--fs-larger)",
              };

              if (item.soon) {
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      showAlert({ title: t("soonTitle"), message: t("soonText") })
                    }
                    className="flex w-full cursor-pointer items-center text-[var(--text-secondary)]"
                    style={rowStyle}
                  >
                    {inner}
                  </button>
                );
              }

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className="flex w-full cursor-pointer items-center text-[var(--text-secondary)]"
                  style={rowStyle}
                >
                  {inner}
                </button>
              );
            })}
        </div>

        {/* ── নিজের তথ্য ── */}
        <div className="bg-[var(--neutral900)]" style={card}>
          <Row label={t("username")}>{user?.userId}</Row>
          <Row label={t("phoneNumber")}>
            {user?.countryCode} {user?.phone}
          </Row>
          {user?.email && <Row label={t("email")}>{user.email}</Row>}

          <div
            className="flex items-baseline justify-between gap-4"
            style={{ paddingBlock: "calc(var(--u) * 1.6)" }}
          >
            <span
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {t("referralCode")}
            </span>

            <button
              type="button"
              onClick={copyCode}
              className="flex cursor-pointer items-center font-semibold text-[var(--primary500)]"
              style={{
                gap: "calc(var(--u) * 1.6)",
                fontSize: "var(--fs-larger)",
              }}
            >
              {user?.referralCode || "—"}
              <Copy size={14} />
              {copied && (
                <span style={{ fontSize: "var(--fs-small)" }}>{t("copied")}</span>
              )}
            </button>
          </div>
        </div>

        {/* ── চলতি টার্নওভার ── */}
        {turnovers.length > 0 && (
          <div className="bg-[var(--neutral900)]" style={card}>
            <p
              className="font-semibold text-[var(--neutral100)]"
              style={{
                fontSize: "var(--fs-larger)",
                marginBottom: "calc(var(--u) * 2.133)",
              }}
            >
              {t("runningTurnover")}
            </p>

            {turnovers.map((item) => (
              <div
                key={item._id}
                style={{ marginBottom: "calc(var(--u) * 3.2)" }}
              >
                <div className="flex items-baseline justify-between">
                  <span
                    className="text-[var(--text-secondary)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {item.title || item.sourceType}
                  </span>

                  <span
                    className="text-[var(--text-primary)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {item.progress} / {item.required}
                  </span>
                </div>

                <div
                  className="mt-1 overflow-hidden bg-[var(--neutral700)]"
                  style={{
                    height: "calc(var(--u) * 1.6)",
                    borderRadius: "var(--radius-10)",
                  }}
                >
                  <div
                    className="h-full bg-[var(--primary500)]"
                    style={{ width: `${item.percent || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── সাম্প্রতিক ডিপোজিট ── */}
        <div className="bg-[var(--neutral900)]" style={card}>
          <p
            className="font-semibold text-[var(--neutral100)]"
            style={{
              fontSize: "var(--fs-larger)",
              marginBottom: "calc(var(--u) * 2.133)",
            }}
          >
            {t("recentDeposits")}
          </p>

          {deposits.length === 0 ? (
            <p
              className="text-[var(--text-disabled)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {t("noDepositYet")}
            </p>
          ) : (
            deposits.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between"
                style={{ paddingBlock: "calc(var(--u) * 1.6)" }}
              >
                <div className="min-w-0">
                  <p
                    className="font-semibold text-[var(--neutral100)]"
                    style={{ fontSize: "var(--fs-larger)" }}
                  >
                    {tv(item.display?.methodName) || item.methodId}
                  </p>
                  <p
                    className="text-[var(--text-disabled)]"
                    style={{ fontSize: "var(--fs-small)" }}
                  >
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="font-bold text-[var(--primary500)]"
                    style={{ fontSize: "var(--fs-larger)" }}
                  >
                    {item.amount}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--fs-small)",
                      color: STATUS_COLOR[item.status],
                    }}
                  >
                    {t(`status_${item.status}`)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center font-semibold transition-colors hover:bg-[var(--neutral700)]"
          style={{
            height: "calc(var(--u) * 13.333)",
            borderRadius: "var(--radius-10)",
            fontSize: "var(--fs-larger)",
            backgroundColor: "var(--neutral800)",
            color: "var(--status-danger)",
            gap: "calc(var(--u) * 2.133)",
          }}
        >
          <LogOut size={16} />
          {t("logout")}
        </button>
      </div>
    </MemberPage>
  );
};

export default Profile;
