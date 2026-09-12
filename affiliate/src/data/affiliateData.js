/**
 * অ্যাফিলিয়েট ল্যান্ডিং পেজের স্ট্যাটিক ডেটা।
 *
 * server তৈরি হলে globalSlice এর thunk এই ফাইলের বদলে
 * `/api/global/affiliate/site-data` থেকে একই শেপের ডেটা আনবে।
 */

export const siteIdentify = {
  siteName: "BET CHOKKOR Affiliates",
  logo: "/assets/brand/header-logo.png",
  brandLogo: "/assets/brand/logo.png",
  favicon: "/assets/icons/pwa/PWAicon-192px.png",
};

/** হিরোর নিচের চারটি সংখ্যা */
export const stats = [
  { key: "commission", value: "৫০%", valueEn: "50%", labelKey: "statCommission" },
  { key: "support", value: "২৪/৭", valueEn: "24/7", labelKey: "statSupport" },
  { key: "payout", value: "২৪", valueEn: "24", labelKey: "statPayout" },
  { key: "cost", value: "০", valueEn: "0", labelKey: "statCost" },
];

/** কমিশন স্ল্যাব — সক্রিয় প্লেয়ার অনুযায়ী রেভিনিউ শেয়ার */
export const commissionTiers = [
  { key: "t1", tier: 1, players: { bn: "১ – ১০", en: "1 – 10" }, share: 30 },
  { key: "t2", tier: 2, players: { bn: "১১ – ৩০", en: "11 – 30" }, share: 35 },
  { key: "t3", tier: 3, players: { bn: "৩১ – ৬০", en: "31 – 60" }, share: 40 },
  { key: "t4", tier: 4, players: { bn: "৬১ – ১০০", en: "61 – 100" }, share: 45 },
  { key: "t5", tier: 5, players: { bn: "১০০+", en: "100+" }, share: 50 },
];

/** তিন ধাপ — আইকনের নাম lucide-react এর */
export const steps = [
  { key: "register", icon: "UserPlus", titleKey: "step1Title", textKey: "step1Text" },
  { key: "share", icon: "Share2", titleKey: "step2Title", textKey: "step2Text" },
  { key: "earn", icon: "Wallet", titleKey: "step3Title", textKey: "step3Text" },
];

/** কেন আমরা — ছয়টি ফিচার কার্ড */
export const features = [
  { key: "commission", icon: "TrendingUp", titleKey: "why1Title", textKey: "why1Text" },
  { key: "reports", icon: "BarChart3", titleKey: "why2Title", textKey: "why2Text" },
  { key: "payout", icon: "Zap", titleKey: "why3Title", textKey: "why3Text" },
  { key: "carry", icon: "ShieldCheck", titleKey: "why4Title", textKey: "why4Text" },
  { key: "manager", icon: "Headset", titleKey: "why5Title", textKey: "why5Text" },
  { key: "tools", icon: "Megaphone", titleKey: "why6Title", textKey: "why6Text" },
];

/** প্রোভাইডার স্ট্রিপ — client সাইটের আসল ভেন্ডর লোগো */
export const providers = [
  { key: "jili", name: "JILI", icon: "/assets/vendors/vendor-awcmjili.png" },
  { key: "evolution", name: "Evolution", icon: "/assets/vendors/vendor-evo.png" },
  { key: "spribe", name: "Spribe", icon: "/assets/vendors/vendor-spribe.png" },
  { key: "pg", name: "PG Soft", icon: "/assets/vendors/vendor-pg.png" },
  { key: "pp", name: "Pragmatic Play", icon: "/assets/vendors/vendor-awcmpp.png" },
  { key: "jdb", name: "JDB", icon: "/assets/vendors/vendor-jdb.png" },
  { key: "sexy", name: "Sexy", icon: "/assets/vendors/vendor-awcmsexy.png" },
  { key: "fc", name: "Fa Chai", icon: "/assets/vendors/vendor-awcmfc.png" },
  { key: "mg", name: "Microgaming", icon: "/assets/vendors/vendor-mg.png" },
  { key: "pt", name: "Playtech", icon: "/assets/vendors/vendor-awcmpt.png" },
];

/** সাধারণ প্রশ্ন */
export const faqs = [
  {
    key: "cost",
    q: { bn: "যোগ দিতে কোনো খরচ আছে?", en: "Is there any joining cost?" },
    a: {
      bn: "না। অ্যাফিলিয়েট অ্যাকাউন্ট খোলা সম্পূর্ণ ফ্রি, কোনো ডিপোজিটও লাগে না।",
      en: "No. Opening an affiliate account is completely free and needs no deposit.",
    },
  },
  {
    key: "payout",
    q: { bn: "কমিশন কখন পাব?", en: "When do I get my commission?" },
    a: {
      bn: "প্রতি মাসের হিসাব পরের মাসের প্রথম সপ্তাহে হয়। উইথড্র রিকোয়েস্ট দিলে ২৪ ঘণ্টার মধ্যে টাকা পৌঁছে যায়।",
      en: "Each month is settled in the first week of the next month. Once you request a withdrawal, the money arrives within 24 hours.",
    },
  },
  {
    key: "methods",
    q: { bn: "টাকা তোলার মাধ্যম কী কী?", en: "Which withdrawal methods are supported?" },
    a: {
      bn: "বিকাশ, নগদ, রকেট এবং সরাসরি ব্যাংক ট্রান্সফার — সবগুলোই সাপোর্টেড।",
      en: "bKash, Nagad, Rocket and direct bank transfer are all supported.",
    },
  },
  {
    key: "active",
    q: { bn: "সক্রিয় প্লেয়ার বলতে কী বোঝায়?", en: "What counts as an active player?" },
    a: {
      bn: "যে প্লেয়ার আপনার লিংক দিয়ে রেজিস্টার করেছে এবং ওই মাসে অন্তত একবার ডিপোজিট করে খেলেছে।",
      en: "A player who registered through your link and deposited and played at least once that month.",
    },
  },
  {
    key: "negative",
    q: {
      bn: "কোনো মাসে লস হলে কী হয়?",
      en: "What happens if a month ends in a loss?",
    },
    a: {
      bn: "কিছুই না — নেগেটিভ ব্যালেন্স পরের মাসে যোগ হয় না। প্রতি মাস শূন্য থেকে শুরু।",
      en: "Nothing — a negative balance is never carried forward. Every month starts from zero.",
    },
  },
];

export const affiliateData = {
  siteIdentify,
  stats,
  commissionTiers,
  steps,
  features,
  providers,
  faqs,
};

export default affiliateData;
