import {
  Bell,
  BadgeCheck,
  Crown,
  Lock,
  Receipt,
  RotateCcw,
  ScrollText,
  User,
  Users,
} from "lucide-react";

/**
 * প্রোফাইল মেনুর সারিগুলো — মূল সাইটের ড্রপডাউন থেকে হুবহু ক্রমে।
 *
 * ডেস্কটপের ড্রপডাউন আর মোবাইলের প্রোফাইল পাতা — দুই জায়গাতেই এই এক
 * তালিকা, তাই একটা বদলালে অন্যটা পিছিয়ে থাকে না।
 *
 * যেগুলো এখনো বানানো হয়নি সেগুলোয় `soon: true` — সারি দেখা যাবে
 * (মূল সাইটে আছে), কিন্তু ক্লিক করলে "শীঘ্রই আসছে" বলবে, কোথাও ভাঙা
 * লিংকে নিয়ে যাবে না।
 */
export const buildProfileMenu = (t) => [
  {
    key: "notification",
    label: t("notification"),
    Icon: Bell,
    to: "/member/inbox/notification",
  },
  {
    key: "personal",
    label: t("menuPersonalInfo"),
    Icon: User,
    to: "/member/profile/info",
  },
  {
    key: "security",
    label: t("menuSecurity"),
    Icon: Lock,
    to: "/member/profile/account",
  },
  {
    key: "verify",
    label: t("verification"),
    Icon: BadgeCheck,
    to: "/member/verification",
  },
  // তিনটে নামেই একই ইতিহাসের পাতা, শুধু আলাদা ট্যাব খোলা থাকে —
  // মূল সাইটের মেনুতে এই তিনটেই আছে, আর ভিতরে বাকি ট্যাবগুলোও পাওয়া যায়
  {
    key: "transaction",
    label: t("transactionRecords"),
    Icon: Receipt,
    to: "/member/history/deposit",
  },
  {
    key: "betting",
    label: t("bettingRecords"),
    Icon: ScrollText,
    to: "/member/history/bet",
  },
  {
    key: "turnover",
    label: t("turnoverRecords"),
    Icon: RotateCcw,
    to: "/member/history/turnover",
  },
  { key: "vip", label: t("myVip"), Icon: Crown, to: "/member/vip-info" },
  {
    key: "referral",
    label: t("menuReferral"),
    Icon: Users,
    to: "/member/referral",
  },
];
