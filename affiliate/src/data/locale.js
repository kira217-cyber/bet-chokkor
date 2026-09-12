/**
 * অ্যাফিলিয়েট সাইটের সব UI টেক্সট — বাংলা ও ইংরেজি।
 *
 * `useLanguage()` থেকে `t("key")` দিয়ে পড়া হয়। হেডারের পতাকা থেকে টগল
 * করলে পুরো সাইট বদলে যায়, পছন্দ localStorage এ সেভ থাকে।
 */
export const locale = {
  // ── সাধারণ ──
  brand: { bn: "বেট চক্কর অ্যাফিলিয়েট", en: "BET CHOKKOR Affiliates" },
  login: { bn: "লগইন", en: "Login" },
  signup: { bn: "রেজিস্টার", en: "Register" },
  joinNow: { bn: "এখনই যোগ দিন", en: "Join Now" },
  close: { bn: "বন্ধ করুন", en: "Close" },
  back: { bn: "ফিরে যান", en: "Back" },
  currencyAndLanguage: { bn: "কারেন্সি এবং ভাষা", en: "Currency & Language" },
  bangla: { bn: "বাংলা", en: "বাংলা" },
  english: { bn: "English", en: "English" },

  // ── নেভিগেশন ──
  navCommission: { bn: "কমিশন", en: "Commission" },
  navHowItWorks: { bn: "কীভাবে কাজ করে", en: "How It Works" },
  navWhyUs: { bn: "কেন আমরা", en: "Why Us" },
  navFaq: { bn: "সাধারণ প্রশ্ন", en: "FAQ" },

  // ── হিরো ──
  heroBadge: {
    bn: "বেট চক্কর অ্যাফিলিয়েট প্রোগ্রাম",
    en: "BET CHOKKOR Affiliate Program",
  },
  heroTitle: {
    bn: "আপনার সার্কেলই হোক আয়ের সোনার খনি",
    en: "Turn your circle into a goldmine",
  },
  heroText: {
    bn: "বন্ধু ও ফলোয়ারদের রেফার করুন, প্রতি মাসে ৫০% পর্যন্ত রেভিনিউ শেয়ার নিন। যোগ দিতে কোনো খরচ নেই, কোনো মাসিক লক্ষ্যমাত্রাও নেই।",
    en: "Refer your friends and followers and earn up to 50% revenue share every month. No joining cost, no monthly targets.",
  },

  // ── স্ট্যাট ──
  statCommission: { bn: "পর্যন্ত কমিশন", en: "commission" },
  statSupport: { bn: "ডেডিকেটেড সাপোর্ট", en: "dedicated support" },
  statPayout: { bn: "ঘণ্টায় পেমেন্ট", en: "hour payouts" },
  statCost: { bn: "টাকা যোগদান খরচ", en: "joining cost" },

  // ── কমিশন ──
  commissionTitle: { bn: "কমিশন স্ল্যাব", en: "Commission Tiers" },
  commissionText: {
    bn: "যত বেশি সক্রিয় প্লেয়ার, তত বেশি রেভিনিউ শেয়ার। প্রতি মাসের ১ তারিখে স্ল্যাব নতুন করে হিসাব হয়।",
    en: "The more active players you bring, the higher your revenue share. Tiers are recalculated on the 1st of every month.",
  },
  tierLabel: { bn: "স্ল্যাব", en: "Tier" },
  activePlayers: { bn: "সক্রিয় প্লেয়ার", en: "Active players" },
  revenueShare: { bn: "রেভিনিউ শেয়ার", en: "Revenue share" },

  // ── ক্যালকুলেটর ──
  calcTitle: { bn: "আয়ের হিসাব করুন", en: "Estimate your earnings" },
  calcPlayers: { bn: "সক্রিয় প্লেয়ার", en: "Active players" },
  calcAverage: { bn: "প্লেয়ার প্রতি মাসিক গড় লস", en: "Avg. monthly loss per player" },
  calcResult: { bn: "আনুমানিক মাসিক আয়", en: "Estimated monthly income" },
  calcNote: {
    bn: "এটি শুধু একটি ধারণা — আসল আয় প্লেয়ারদের কার্যক্রমের উপর নির্ভর করে।",
    en: "This is an estimate only — actual income depends on player activity.",
  },

  // ── কীভাবে কাজ করে ──
  howTitle: { bn: "তিন ধাপেই শুরু", en: "Start in three steps" },
  step1Title: { bn: "রেজিস্টার করুন", en: "Register" },
  step1Text: {
    bn: "দুই মিনিটে ফ্রি অ্যাকাউন্ট খুলুন। কোনো ফি বা ডিপোজিট লাগবে না।",
    en: "Open a free account in two minutes. No fee, no deposit needed.",
  },
  step2Title: { bn: "লিংক শেয়ার করুন", en: "Share your link" },
  step2Text: {
    bn: "আপনার রেফারেল লিংক ও ব্যানার ফেসবুক, টেলিগ্রাম বা ইউটিউবে ছড়িয়ে দিন।",
    en: "Spread your referral link and banners on Facebook, Telegram or YouTube.",
  },
  step3Title: { bn: "আয় করুন", en: "Earn" },
  step3Text: {
    bn: "প্রতি মাসে কমিশন হিসাব হয়, ২৪ ঘণ্টার মধ্যে টাকা তুলে নিন।",
    en: "Commission is settled monthly — withdraw your money within 24 hours.",
  },

  // ── কেন আমরা ──
  whyTitle: { bn: "কেন বেট চক্কর অ্যাফিলিয়েট", en: "Why BET CHOKKOR Affiliates" },
  why1Title: { bn: "সর্বোচ্চ কমিশন", en: "Highest commission" },
  why1Text: {
    bn: "বাজারের সেরা ৫০% পর্যন্ত রেভিনিউ শেয়ার, কোনো লুকানো কাটছাঁট নেই।",
    en: "Up to 50% revenue share — among the best in the market, with no hidden deductions.",
  },
  why2Title: { bn: "রিয়েল-টাইম রিপোর্ট", en: "Real-time reports" },
  why2Text: {
    bn: "ক্লিক, সাইনআপ ও আয়ের হিসাব সরাসরি ড্যাশবোর্ডে দেখুন।",
    en: "Track clicks, signups and earnings live from your dashboard.",
  },
  why3Title: { bn: "দ্রুত পেমেন্ট", en: "Fast payouts" },
  why3Text: {
    bn: "বিকাশ, নগদ ও ব্যাংক — ২৪ ঘণ্টার মধ্যে টাকা হাতে।",
    en: "bKash, Nagad and bank transfer — money in hand within 24 hours.",
  },
  why4Title: { bn: "নেগেটিভ ক্যারি ফরওয়ার্ড নেই", en: "No negative carry forward" },
  why4Text: {
    bn: "কোনো মাসে লস হলে তা পরের মাসে যোগ হবে না — প্রতি মাস নতুন শুরু।",
    en: "A losing month never carries into the next — every month starts fresh.",
  },
  why5Title: { bn: "ডেডিকেটেড ম্যানেজার", en: "Dedicated manager" },
  why5Text: {
    bn: "আপনার জন্য আলাদা অ্যাকাউন্ট ম্যানেজার, ২৪/৭ বাংলায় সাপোর্ট।",
    en: "Your own account manager, with 24/7 support in Bangla.",
  },
  why6Title: { bn: "মার্কেটিং টুলস", en: "Marketing tools" },
  why6Text: {
    bn: "রেডিমেড ব্যানার, ল্যান্ডিং পেজ ও প্রোমো কোড — সব একসাথে।",
    en: "Ready-made banners, landing pages and promo codes — all in one place.",
  },

  // ── প্রোভাইডার ──
  providersTitle: { bn: "১০০+ গেম প্রোভাইডার", en: "100+ game providers" },
  providersText: {
    bn: "স্পোর্টস, ক্যাসিনো, স্লট — যা খেলতে চান সব আছে, তাই প্লেয়ার ধরে রাখা সহজ।",
    en: "Sports, casino, slots — everything players want, so they keep coming back.",
  },

  // ── FAQ ──
  faqTitle: { bn: "সাধারণ প্রশ্ন", en: "Frequently asked questions" },

  // ── CTA ──
  ctaTitle: { bn: "আজই শুরু করুন", en: "Start today" },
  ctaText: {
    bn: "যোগ দিতে কোনো খরচ নেই। অ্যাকাউন্ট খুলুন, লিংক শেয়ার করুন, আয় শুরু করুন।",
    en: "Joining costs nothing. Open an account, share your link, start earning.",
  },

  // ── ফর্ম ──
  username: { bn: "ব্যবহারকারীর নাম", en: "Username" },
  usernamePlaceholder: { bn: "আপনার ইউজার নেম লিখুন", en: "Enter your username" },
  password: { bn: "পাসওয়ার্ড", en: "Password" },
  passwordPlaceholder: { bn: "আপনার পাসওয়ার্ড লিখুন", en: "Enter your password" },
  confirmPassword: { bn: "পাসওয়ার্ড নিশ্চিত করুন", en: "Confirm password" },
  confirmPasswordPlaceholder: { bn: "আবার পাসওয়ার্ড লিখুন", en: "Re-enter your password" },
  passwordMismatch: { bn: "পাসওয়ার্ড মিলছে না", en: "Passwords do not match" },
  forgotPassword: { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot password?" },
  fullName: { bn: "পুরো নাম", en: "Full name" },
  fullNamePlaceholder: { bn: "আপনার পুরো নাম লিখুন", en: "Enter your full name" },
  email: { bn: "ইমেইল", en: "Email" },
  emailPlaceholder: { bn: "আপনার ইমেইল লিখুন", en: "Enter your email" },
  phoneNumber: { bn: "ফোন নম্বর", en: "Phone number" },
  phoneLengthError: { bn: "১১ ডিজিটের নম্বর দিন", en: "Enter an 11 digit number" },
  promoChannel: { bn: "প্রচারের মাধ্যম", en: "Promotion channel" },
  promoChannelPlaceholder: {
    bn: "যেমন: ফেসবুক পেজ, টেলিগ্রাম গ্রুপ, ইউটিউব",
    en: "e.g. Facebook page, Telegram group, YouTube",
  },
  agreeTerms: {
    bn: "আমি শর্তাবলি ও গোপনীয়তা নীতিতে সম্মত",
    en: "I agree to the Terms and Privacy Policy",
  },
  loginTitle: { bn: "অ্যাফিলিয়েট লগইন", en: "Affiliate Login" },
  loginSubtitle: {
    bn: "আপনার ড্যাশবোর্ডে ফিরে যান",
    en: "Get back to your dashboard",
  },
  registerTitle: { bn: "অ্যাফিলিয়েট রেজিস্ট্রেশন", en: "Affiliate Registration" },
  registerSubtitle: {
    bn: "ফ্রি অ্যাকাউন্ট খুলুন, আজ থেকেই আয় শুরু",
    en: "Open a free account and start earning today",
  },
  noAccount: { bn: "অ্যাকাউন্ট নেই?", en: "No account?" },
  haveAccount: { bn: "অ্যাকাউন্ট আছে?", en: "Already have an account?" },

  // ── ফুটার ──
  footerLinks: { bn: "লিংক", en: "Links" },
  footerSupport: { bn: "সাপোর্ট", en: "Support" },
  footerLicense: { bn: "গেইমিংয়ের লাইসেন্স", en: "Gaming License" },
  footerResponsible: { bn: "দায়িত্বশীল গেম্বলিং", en: "Responsible Gaming" },
  mainSite: { bn: "মূল সাইট", en: "Main site" },
  terms: { bn: "শর্তাবলি", en: "Terms" },
  privacy: { bn: "গোপনীয়তা নীতি", en: "Privacy Policy" },
  contactUs: { bn: "যোগাযোগ করুন", en: "Contact us" },
  liveChat: { bn: "লাইভ চ্যাট", en: "Live chat" },
  copyright: {
    bn: "© 2026 BetChokkor Affiliates। সমস্ত অধিকার সংরক্ষিত।",
    en: "© 2026 BetChokkor Affiliates. All rights reserved.",
  },
  ageNotice: {
    bn: "১৮ বছরের কম বয়সীদের জন্য নয়। দায়িত্বের সাথে খেলুন।",
    en: "Not for under 18s. Please play responsibly.",
  },

  // ── 404 ──
  notFoundText: {
    bn: "দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।",
    en: "Sorry, the page you are looking for was not found.",
  },
  backToHome: { bn: "হোমে ফিরুন", en: "Back to Home" },
};

export default locale;
