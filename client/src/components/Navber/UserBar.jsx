import React, { useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LogOut, RefreshCw } from "lucide-react";

import { api } from "../../api/axios";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { logout, updateUser } from "../../features/auth/authSlice";

/**
 * লগইন করা অবস্থায় হেডারের ডান পাশ।
 *
 * মূল সাইট থেকে মাপা: ব্যালেন্সের বড়ি ৯.০৬৭u উঁচু (bg neutral900,
 * radius --radius-10), ভিতরে চোখ ও রিফ্রেশ আইকন, তারপর আউটলাইন
 * "উইথড্র" আর সোনালি "ডিপোজিট" বাটন — দুটোই ৯.০৬৭u উঁচু।
 *
 * টাকার অঙ্ক লুকানোর সুইচটা মূল সাইটেই আছে — কেউ পাশে থাকলে ব্যালেন্স
 * ঢেকে রাখা যায়।
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

  return (
    <>
      <div
        className="flex items-center bg-[var(--neutral900)]"
        style={{
          height: "calc(var(--u) * 9.067)",
          borderRadius: "var(--radius-10)",
          paddingInline: "calc(var(--u) * 2.667)",
          gap: "calc(var(--u) * 2.133)",
        }}
      >
        <span
          className="font-bold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-larger)" }}
        >
          {hidden ? "••••••" : `${user?.currency || "BDT"} ${balance}`}
        </span>

        <button
          type="button"
          onClick={() => setHidden((prev) => !prev)}
          aria-label="toggle balance"
          className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
        >
          {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>

        <button
          type="button"
          onClick={refresh}
          aria-label="refresh balance"
          className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--text-secondary)]"
        >
          <RefreshCw size={15} className={busy ? "animate-spin" : ""} />
        </button>
      </div>

      <Link
        to="/member/wallet/deposit"
        className="auth-btn auth-btn--primary flex cursor-pointer items-center justify-center transition-[filter] hover:brightness-110"
        style={{
          height: "calc(var(--u) * 9.067)",
          minWidth: "calc(var(--u) * 24)",
          padding: "0 calc(var(--u) * 2.667)",
          borderRadius: "var(--radius-10)",
          fontSize: "var(--fs-larger)",
        }}
      >
        {t("deposit")}
      </Link>

      <button
        type="button"
        onClick={() => dispatch(logout())}
        aria-label={t("logout")}
        className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral700)] hover:text-[var(--neutral100)]"
        style={{
          height: "calc(var(--u) * 9.067)",
          width: "calc(var(--u) * 9.067)",
          borderRadius: "var(--radius-10)",
        }}
      >
        <LogOut size={15} />
      </button>
    </>
  );
};

export default UserBar;
