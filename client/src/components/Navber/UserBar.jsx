import React, { useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, Plus, RefreshCw } from "lucide-react";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";

/**
 * লগইন করা অবস্থায় হেডারের ডান পাশ।
 *
 * মূল সাইট থেকে মাপা: ব্যালেন্সের বড়ি ৯.০৬৭u উঁচু (bg neutral900,
 * radius --radius-10), ভিতরে চোখ ও রিফ্রেশ আইকন, তারপর সোনালি
 * ডিপোজিট বাটন — মোবাইলে শুধু একটা "+", ডেস্কটপে পুরো লেখা, কারণ
 * মোবাইলে জায়গা কম আর মূল সাইটও তাই করে।
 *
 * টাকার অঙ্ক লুকানোর সুইচটা মূল সাইটেই আছে — কেউ পাশে থাকলে ব্যালেন্স
 * ঢেকে রাখা যায়।
 *
 * লগআউট এখানে নেই — সেটা প্রোফাইল পেজে, মূল সাইটের মতোই।
 */
const UserBar = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      setBusy(true);
      const { data } = await api.get("/api/user/me");

      if (data?.data?.user) dispatch(updateUser(data.data.user));
    } catch {
      // ব্যালেন্স আনতে না পারলে আগেরটাই থাকুক — পর্দা খালি করার মানে নেই
    } finally {
      setBusy(false);
    }
  };

  const balance = Number(user?.balance || 0).toFixed(2);
  const vipPoints = Math.floor(Number(user?.vipPoints || 0));

  // দুই আলাদা কার্ডের সাধারণ স্টাইল (মূল সাইটের মতো পাশাপাশি পিল)
  const cardStyle = {
    height: "calc(var(--u) * 9.067)",
    borderRadius: "var(--radius-10)",
    paddingInline: "calc(var(--u) * 2.667)",
    gap: "calc(var(--u) * 1.6)",
  };

  // মোবাইলে ছোট গোল বাটন, ডেস্কটপে বড় — ব্যালেন্স কার্ডের সমান উঁচু
  const circleClass =
    "flex shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)] " +
    "h-[calc(var(--u)*6.4)] w-[calc(var(--u)*6.4)] lg:h-[calc(var(--u)*9.067)] lg:w-[calc(var(--u)*9.067)]";
  const circleBg = { background: "var(--neutral1000)" };

  return (
    <>
      {/* ── VP কার্ড — শুধু ডেস্কটপ/ল্যাপটপে (মোবাইলে শুধু ব্যালেন্স,
          XP/VIP প্রোফাইল পেজে) ── */}
      <Link
        to="/member/vip-info"
        aria-label="VIP points"
        className="hidden shrink-0 items-center bg-[var(--neutral800)] transition-[filter] hover:brightness-110 lg:flex"
        style={cardStyle}
      >
        <img
          src="/vip/vp.png"
          alt="VP"
          className="shrink-0 object-contain"
          style={{ height: "calc(var(--u) * 4.8)", width: "calc(var(--u) * 4.8)" }}
          draggable="false"
        />
        <span
          className="font-bold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-larger)" }}
        >
          {hidden ? "••••" : vipPoints}
        </span>
      </Link>

      {/* ── ব্যালেন্স কার্ড ── */}
      <span
        className="flex shrink-0 items-center bg-[var(--neutral800)] font-bold text-[var(--neutral100)]"
        style={{ ...cardStyle, fontSize: "var(--fs-larger)" }}
      >
        <img
          src="/vip/bdt.png"
          alt="BDT"
          className="shrink-0 object-contain"
          style={{ height: "calc(var(--u) * 4.8)", width: "calc(var(--u) * 4.8)" }}
          draggable="false"
        />
        {hidden ? "••••••" : balance}
      </span>

      {/* ── চোখ ও রিফ্রেশ — গোল বাটন ── */}
      <button
        type="button"
        onClick={() => setHidden((prev) => !prev)}
        aria-label="toggle balance"
        className={circleClass}
        style={circleBg}
      >
        {hidden ? (
          <EyeOff className="h-[calc(var(--u)*3.5)] w-[calc(var(--u)*3.5)] lg:h-[15px] lg:w-[15px]" />
        ) : (
          <Eye className="h-[calc(var(--u)*3.5)] w-[calc(var(--u)*3.5)] lg:h-[15px] lg:w-[15px]" />
        )}
      </button>

      <button
        type="button"
        onClick={refresh}
        aria-label="refresh balance"
        className={circleClass}
        style={circleBg}
      >
        <RefreshCw
          className={`h-[calc(var(--u)*3.5)] w-[calc(var(--u)*3.5)] lg:h-[15px] lg:w-[15px] ${
            busy ? "animate-spin" : ""
          }`}
        />
      </button>

      {/*
        * উইথড্র — মোবাইলেও।
        *
        * আগে `lg:flex` ছিল, তাই ফোনে বোতামটাই থাকত না; টাকা তুলতে হলে
        * প্রোফাইল হয়ে ঘুরে যেতে হতো। ডিপোজিটের মতোই ছোট পর্দায় শুধু
        * আইকন, বড় পর্দায় পুরো লেখা — জায়গা কম বলে।
        */}
      {/* উইথড্র শুধু ডেস্কটপে; মোবাইলে প্রোফাইল পেজ থেকে */}
      <Link
        to="/member/wallet/withdraw"
        aria-label={t("withdrawTitle")}
        className="auth-btn auth-btn--secondary hidden shrink-0 cursor-pointer items-center justify-center transition-[filter] hover:brightness-110 lg:flex"
        style={{
          height: "calc(var(--u) * 9.067)",
          borderRadius: "var(--radius-10)",
          fontSize: "var(--fs-larger)",
          paddingInline: "calc(var(--u) * 2.667)",
        }}
      >
        <span>{t("withdrawTitle")}</span>
      </Link>

      <Link
        to="/member/wallet/deposit"
        aria-label={t("deposit")}
        className="auth-btn auth-btn--primary flex shrink-0 cursor-pointer items-center justify-center transition-[filter] hover:brightness-110"
        style={{
          height: "calc(var(--u) * 9.067)",
          borderRadius: "var(--radius-10)",
          fontSize: "var(--fs-larger)",
          paddingInline: "calc(var(--u) * 2.667)",
        }}
      >
        <Plus size={16} className="lg:hidden" />
        <span className="hidden lg:inline">{t("deposit")}</span>
      </Link>

    </>
  );
};

export default UserBar;
