/**
 * সাইটের সব UI টেক্সট — বাংলা ও ইংরেজি।
 *
 * কম্পোনেন্টে `useLanguage()` থেকে `t()` নিয়ে `t("login")` এভাবে ব্যবহার
 * করা হয়। নতুন লেখা যোগ করতে শুধু এখানে একটা কী বসালেই দুই ভাষাতেই
 * কাজ করবে — হেডারের পতাকা থেকে টগল করলে পুরো সাইট বদলে যায়।
 *
 * ডাইনামিক লেখা (গেমের নাম, ক্যাটাগরি, ফুটার লাইসেন্স ইত্যাদি) siteData
 * ও gameData তে `{ bn, en }` আকারে আছে — সেগুলো `tv()` দিয়ে পড়া হয়।
 */
export const locale = {
  // ── সাধারণ ──
  login: { bn: "লগইন", en: "Login" },
  signup: { bn: "সাইন আপ", en: "Sign Up" },
  logout: { bn: "লগআউট", en: "Logout" },
  menu: { bn: "মেনু", en: "Menu" },
  viewAll: { bn: "সব দেখুন", en: "View All" },
  next: { bn: "পরবর্তী", en: "Next" },
  back: { bn: "ফিরে যান", en: "Back" },
  close: { bn: "বন্ধ করুন", en: "Close" },
  search: { bn: "খুঁজুন", en: "Search" },
  loading: { bn: "লোড হচ্ছে…", en: "Loading…" },

  // ── নেভিগেশন ও সেকশন ──
  liveSupport: { bn: "লাইভ সাপোর্ট", en: "Live Support" },
  promotion: { bn: "প্রমোশন", en: "Promotion" },
  provider: { bn: "প্রোভাইডার", en: "Provider" },
  event: { bn: "ইভেন্ট", en: "Event" },
  featuredGames: { bn: "ফিচার্ড গেমস", en: "Featured Games" },
  liveMatchOdds: { bn: "লাইভ ম্যাচ অডস", en: "Live match odds" },

  // ── ভাষা প্যানেল ──
  currencyAndLanguage: { bn: "কারেন্সি এবং ভাষা", en: "Currency & Language" },
  bangla: { bn: "বাংলা", en: "বাংলা" },
  english: { bn: "English", en: "English" },

  // ── ফর্ম ──
  username: { bn: "ব্যবহারকারীর নাম", en: "Username" },
  usernamePlaceholder: {
    bn: "আপনার ইউজার নেম লিখুন",
    en: "Enter your username",
  },
  password: { bn: "পাসওয়ার্ড", en: "Password" },
  passwordPlaceholder: {
    bn: "আপনার পাসওয়ার্ড লিখুন",
    en: "Enter your password",
  },
  confirmPassword: { bn: "পাসওয়ার্ড নিশ্চিত করুন", en: "Confirm password" },
  confirmPasswordPlaceholder: {
    bn: "আবার পাসওয়ার্ড লিখুন",
    en: "Re-enter your password",
  },
  passwordMismatch: { bn: "পাসওয়ার্ড মিলছে না", en: "Passwords do not match" },
  forgotPassword: { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot password?" },
  forgotPasswordTitle: { bn: "ফরগেট পাসওয়ার্ড", en: "Forgot Password" },
  fullName: { bn: "পুরো নাম", en: "Full name" },
  fullNamePlaceholder: {
    bn: "আপনার পুরো নাম লিখুন",
    en: "Enter your full name",
  },
  email: { bn: "ইমেইল", en: "Email" },
  emailPlaceholder: { bn: "আপনার ইমেইল লিখুন", en: "Enter your email" },
  selectCurrency: { bn: "মুদ্রা বেছে নিন", en: "Select currency" },
  phoneNumber: { bn: "ফোন নম্বর", en: "Phone number" },
  phoneLengthError: {
    bn: "১১ ডিজিটের নম্বর দিন",
    en: "Enter an 11 digit number",
  },

  // ── রেজিস্টার ধাপ ──
  stepContact: { bn: "যোগাযোগের তথ্য", en: "Contact Info" },
  stepPersonal: { bn: "ব্যক্তিগত তথ্য", en: "Personal Info" },
  stepPassword: { bn: "পাসওয়ার্ড", en: "Password" },
  continue: { bn: "চালিয়ে যান", en: "Continue" },
  register: { bn: "রেজিস্টার করুন", en: "Register" },

  // ── রক্ষণাবেক্ষণ ──
  maintenanceTitle: {
    bn: "সাইট রক্ষণাবেক্ষণে আছে",
    en: "Site is under maintenance",
  },
  maintenanceText: {
    bn: "আমরা কিছু কাজ করছি। অল্প কিছুক্ষণের মধ্যেই সাইট আবার চালু হবে — একটু পরে আবার দেখুন।",
    en: "We are doing some work. The site will be back shortly — please check again in a little while.",
  },
  tryAgain: { bn: "আবার চেষ্টা করুন", en: "Try again" },

  // ── গেম খেলা এখনো আসেনি ──
  comingSoonTitle: { bn: "গেম খেলা শীঘ্রই আসছে", en: "Game play coming soon" },
  comingSoonText: {
    bn: "এই গেমটি এখনো খেলার জন্য চালু হয়নি। খুব শীঘ্রই চালু হবে — সাথে থাকুন।",
    en: "This game is not playable yet. It will open very soon — stay tuned.",
  },
  gotIt: { bn: "বুঝেছি", en: "Got it" },

  // ── গেম পেজ ──
  searchGames: { bn: "গেম খুঁজুন", en: "Search games" },
  loadMore: { bn: "আরও লোড করুন", en: "Load more" },
  noGamesFound: { bn: "কোনো গেম পাওয়া যায়নি", en: "No games found" },

  // ── 404 ──
  notFoundText: {
    bn: "দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।",
    en: "Sorry, the page you are looking for was not found.",
  },
  backToHome: { bn: "হোমে ফিরুন", en: "Back to Home" },
};

export default locale;
