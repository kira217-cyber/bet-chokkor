import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Copy, User, Wallet } from "lucide-react";

import {
  Card,
  Loading,
  Row,
  Stat,
} from "../../components/Panel/Panel";
import { money, referralLink, when } from "../../components/Panel/panelFormat";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { fetchMe } from "../../features/affiliate/affiliateApi";

/**
 * অ্যাফিলিয়েটের নিজের তথ্য।
 *
 * পাতা খোলার সময় সার্ভার থেকে তাজা তথ্য আনা হয় — localStorage এ রাখা
 * কপিটা পুরোনো হতে পারে (ব্যালেন্স, কমিশন অ্যাডমিন বদলে থাকতে পারেন)।
 */
const Profile = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const saved = useSelector(selectUser);

  const [user, setUser] = useState(saved);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;

    fetchMe()
      .then((next) => {
        if (!alive || !next) return;

        setUser(next);
        dispatch(updateUser(next));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [dispatch]);

  if (loading && !user) return <Loading label={t("loading")} />;
  if (!user) return <Card>{t("somethingWrong")}</Card>;

  const link = referralLink(user.referralCode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ক্লিপবোর্ড বন্ধ থাকলে লিংকটা পর্দাতেই দেখা যাচ্ছে
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          label={t("mainBalance")}
          value={money(user.balance)}
          sub={t("mainBalanceText")}
          tone="var(--primary500)"
          Icon={Wallet}
        />
        <Stat
          label={t("statTotalPlayers")}
          value={user.referralCount || 0}
          sub={t("statReferred")}
          Icon={User}
        />
      </div>

      <Card title={t("myInfo")} subtitle={t("myInfoText")}>
        <Row label={t("username")} value={user.userId} />
        <Row
          label={t("fullName")}
          value={[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
        />
        <Row label={t("phoneNumber")} value={`${user.countryCode} ${user.phone}`} />
        <Row label={t("email")} value={user.email || "—"} />
        <Row label={t("currency")} value={user.currency} />
        <Row
          label={t("accountStatus")}
          value={t(user.isActive ? "statusActive" : "statusInactive")}
          tone={
            user.isActive ? "var(--status-success)" : "var(--status-danger)"
          }
        />
        <Row label={t("joined")} value={when(user.createdAt)} />
      </Card>

      <Card title={t("myReferralLink")} subtitle={t("myReferralLinkText")}>
        <p className="text-center text-[26px] font-black tracking-widest text-[var(--primary500)]">
          {user.referralCode}
        </p>

        {/* QR — ফোনে দেখানোর জন্য, টাইপ করতে হয় না */}
        <div className="mt-4 flex justify-center">
          <span className="flex h-[132px] w-[132px] items-center justify-center rounded-[10px] bg-white p-2">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(link)}`}
              alt={user.referralCode}
              className="h-full w-full object-contain"
              draggable="false"
            />
          </span>
        </div>

        <p className="mt-3 break-all rounded-[10px] bg-[var(--neutral800)] p-3 text-center text-[13px] text-[var(--text-secondary)]">
          {link}
        </p>

        <button
          type="button"
          onClick={copy}
          className="aff-btn aff-btn--primary mt-4 w-full"
        >
          <Copy size={15} className="me-2" />
          {copied ? t("copied") : t("copyLink")}
        </button>
      </Card>

      <Card>
        <p className="text-[13px] text-[var(--text-muted)]">
          {t("profileChangeNote")}
        </p>
      </Card>
    </div>
  );
};

export default Profile;
