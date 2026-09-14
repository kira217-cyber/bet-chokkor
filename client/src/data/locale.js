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

  // ── OTP ও পাসওয়ার্ড পুনরুদ্ধার ──
  otpTitle: { bn: "যাচাইকরণ কোড", en: "Verification code" },
  otpSentTo: { bn: "কোড পাঠানো হয়েছে", en: "Code sent to" },
  otpPlaceholder: { bn: "৬ সংখ্যার কোড", en: "6 digit code" },
  resendOtp: { bn: "কোড আবার পাঠান", en: "Resend code" },
  resendIn: { bn: "আবার পাঠাতে পারবেন", en: "Resend in" },
  seconds: { bn: "সেকেন্ড", en: "s" },
  verify: { bn: "যাচাই করুন", en: "Verify" },
  newPassword: { bn: "নতুন পাসওয়ার্ড", en: "New password" },
  newPasswordPlaceholder: {
    bn: "নতুন পাসওয়ার্ড লিখুন",
    en: "Enter a new password",
  },
  savePassword: { bn: "পাসওয়ার্ড সেভ করুন", en: "Save password" },
  passwordChanged: {
    bn: "পাসওয়ার্ড বদলে গেছে। এখন লগইন করুন।",
    en: "Password changed. Please log in.",
  },
  passwordTooShort: {
    bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
    en: "Password must be at least 6 characters",
  },

  // ── রেজিস্টার বোনাস ও ফল ──
  referralCode: { bn: "রেফারেল কোড", en: "Referral code" },
  referralCodePlaceholder: {
    bn: "থাকলে লিখুন (ঐচ্ছিক)",
    en: "If you have one (optional)",
  },
  registerBonusNote: {
    bn: "রেজিস্টার করলেই বোনাস",
    en: "Bonus on sign up",
  },
  registerDone: {
    bn: "অ্যাকাউন্ট তৈরি হয়েছে",
    en: "Your account is ready",
  },
  somethingWrong: {
    bn: "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন",
    en: "Something went wrong, please try again",
  },

  // ── ডিপোজিট ──
  deposit: { bn: "ডিপোজিট", en: "Deposit" },
  withdraw: { bn: "উইথড্র", en: "Withdraw" },
  groupEwallet: { bn: "ই-ওয়ালেট", en: "E-Wallet" },
  groupCrypto: { bn: "ক্রিপ্টো", en: "Crypto" },
  groupBank: { bn: "ব্যাংক", en: "Bank" },
  upToPercent: { bn: "{n}% পর্যন্ত", en: "Up to {n}%" },
  selectPromotion: { bn: "প্রমোশন সিলেক্ট করুন", en: "Select a promotion" },
  promotionLabel: { bn: "প্রমোশন", en: "Promotion" },
  noPromotion: { bn: "সাধারণ", en: "Normal" },
  selectPayment: { bn: "পেমেন্ট নির্বাচন করুন", en: "Select a payment" },
  selectChannel: { bn: "চ্যানেল সিলেক্ট করুন", en: "Select a channel" },
  depositChannel: { bn: "ডিপোজিট চ্যানেল", en: "Deposit channel" },
  depositAmount: { bn: "ডিপোজিটের পরিমাণ", en: "Deposit amount" },
  amountPlaceholder: { bn: "টাকার পরিমাণ লিখুন", en: "Enter an amount" },
  minMax: { bn: "সর্বনিম্ন / সর্বোচ্চ", en: "Min / Max" },
  bonusLine: { bn: "বোনাস", en: "Bonus" },
  totalGet: { bn: "মোট পাবেন", en: "You get" },
  turnoverLine: { bn: "টার্নওভার", en: "Turnover" },
  sendMoneyTo: { bn: "এই নম্বরে টাকা পাঠান", en: "Send the money to" },
  copied: { bn: "কপি হয়েছে", en: "Copied" },
  submitDeposit: { bn: "জমা দিন", en: "Submit" },
  depositDone: {
    bn: "আপনার ডিপোজিট জমা হয়েছে",
    en: "Your deposit has been submitted",
  },
  depositDoneText: {
    bn: "অ্যাডমিন মিলিয়ে দেখে অনুমোদন দিলে টাকা আপনার ব্যালেন্সে যোগ হবে।",
    en: "Once an admin checks it, the money will be added to your balance.",
  },
  noMethodYet: {
    bn: "এখন কোনো ডিপোজিটের উপায় চালু নেই",
    en: "No deposit method is open right now",
  },
  amountRange: {
    bn: "টাকার অঙ্কটা সীমার ভিতরে দিন",
    en: "Enter an amount within the limit",
  },

  // ── সার্ভারের ভুলের বার্তা (code → লেখা) ──
  errMissingFields: {
    bn: "সব ঘর পূরণ করুন",
    en: "Please fill in every field",
  },
  errBadLogin: {
    bn: "ব্যবহারকারীর নাম বা পাসওয়ার্ড ঠিক নয়",
    en: "Username or password is not correct",
  },
  errAccountLocked: {
    bn: "অনেকবার ভুল হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
    en: "Too many wrong tries. Please try again in a little while.",
  },
  errAccountDisabled: {
    bn: "এই অ্যাকাউন্টটি বন্ধ করা আছে",
    en: "This account is disabled",
  },
  errNoAccount: {
    bn: "এই নামে কোনো অ্যাকাউন্ট নেই",
    en: "No account found",
  },
  errAccountExists: {
    bn: "এই অ্যাকাউন্টটি আগে থেকেই আছে",
    en: "This account already exists",
  },
  errUsernameTaken: {
    bn: "এই ব্যবহারকারীর নামটি নেওয়া হয়ে গেছে",
    en: "This username is taken",
  },
  errUsernameChars: {
    bn: "ব্যবহারকারীর নামে শুধু ইংরেজি অক্ষর ও সংখ্যা চলবে",
    en: "Username allows only letters and numbers",
  },
  errUsernameLength: {
    bn: "ব্যবহারকারীর নাম ৪ থেকে ১৫ অক্ষরের হতে হবে",
    en: "Username must be 4 to 15 characters",
  },
  errPhoneTaken: {
    bn: "এই নম্বরে আগেই একটা অ্যাকাউন্ট আছে",
    en: "This number already has an account",
  },
  errPasswordTooShort: {
    bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
    en: "Password must be at least 6 characters",
  },
  errBadReferral: {
    bn: "রেফারেল কোডটি ঠিক নয়",
    en: "Referral code is not valid",
  },
  errOtpNotConfigured: {
    bn: "এখন কোড পাঠানো যাচ্ছে না, একটু পরে চেষ্টা করুন",
    en: "Codes cannot be sent right now, please try later",
  },
  errOtpWait: {
    bn: "একটু পরে আবার কোড চান",
    en: "Please wait a moment before asking again",
  },
  errOtpSendFailed: {
    bn: "কোড পাঠানো যায়নি, আবার চেষ্টা করুন",
    en: "The code could not be sent, please try again",
  },
  errOtpNotAsked: {
    bn: "আগে কোড চেয়ে নিন",
    en: "Please ask for a code first",
  },
  errOtpExpired: {
    bn: "কোডের সময় শেষ, নতুন কোড নিন",
    en: "The code has expired, ask for a new one",
  },
  errOtpWrong: {
    bn: "কোডটি মিলছে না",
    en: "The code did not match",
  },
  errOtpTooManyTries: {
    bn: "অনেকবার ভুল হয়েছে, নতুন কোড নিন",
    en: "Too many wrong tries, ask for a new code",
  },
  errOtpNotVerified: {
    bn: "আগে কোডটি যাচাই করুন",
    en: "Please verify the code first",
  },

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
  recentSearches: { bn: "সাম্প্রতিক সার্চ", en: "Recent searches" },
  clearAll: { bn: "সব মুছুন", en: "Clear all" },
  filter: { bn: "ফিল্টার", en: "Filter" },
  providers: { bn: "প্রোভাইডার", en: "Providers" },
  badges: { bn: "ব্যাজ", en: "Badges" },
  applyFilters: { bn: "ফিল্টার প্রয়োগ করুন", en: "Apply filters" },
  noGamesFound: { bn: "কোনো গেম পাওয়া যায়নি", en: "No games found" },

  // ── 404 ──
  notFoundText: {
    bn: "দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।",
    en: "Sorry, the page you are looking for was not found.",
  },
  backToHome: { bn: "হোমে ফিরুন", en: "Back to Home" },
};

export default locale;
