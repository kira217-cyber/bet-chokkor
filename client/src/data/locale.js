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
  ok: { bn: "ঠিক আছে", en: "OK" },
  yes: { bn: "হ্যাঁ", en: "Yes" },
  no: { bn: "না", en: "No" },
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
  manualDeposit: { bn: "ম্যানুয়াল ডিপোজিট", en: "Manual Deposit" },
  manualDepositHint: {
    bn: "নিজে টাকা পাঠিয়ে তথ্য দিন",
    en: "Send the money yourself, then tell us",
  },
  autoDeposit: { bn: "অটো ডিপোজিট", en: "Auto Deposit" },
  autoDepositHint: {
    bn: "পেমেন্ট পাতায় গিয়ে সাথে সাথেই",
    en: "Pay on the gateway page, credited at once",
  },
  payNow: { bn: "পেমেন্ট করুন", en: "Pay now" },
  selectBonus: { bn: "বোনাস বেছে নিন", en: "Select a bonus" },
  noBonus: { bn: "বোনাস ছাড়া", en: "No bonus" },
  selectMethod: { bn: "উপায় বেছে নিন", en: "Select a method" },
  autoOffNow: {
    bn: "অটো ডিপোজিট এখন বন্ধ আছে",
    en: "Auto deposit is off right now",
  },
  manualWithdraw: { bn: "ম্যানুয়াল উইথড্র", en: "Manual Withdraw" },
  manualWithdrawHint: {
    bn: "নিজের নম্বর দিন, অ্যাডমিন অনুমোদন করবে",
    en: "Give your number, an admin approves it",
  },
  autoWithdraw: { bn: "অটো উইথড্র", en: "Auto Withdraw" },
  autoWithdrawHint: {
    bn: "সরাসরি আপনার ওয়ালেটে, নিজে থেকেই",
    en: "Straight to your wallet, automatically",
  },
  autoWithdrawOffNow: {
    bn: "অটো উইথড্র এখন বন্ধ আছে",
    en: "Auto withdraw is off right now",
  },
  walletNumberLabel: { bn: "ওয়ালেট নম্বর", en: "Wallet number" },
  walletNumberPlaceholder: {
    bn: "যে নম্বরে টাকা পাবেন",
    en: "The number to receive money",
  },
  autoWithdrawDoneText: {
    bn: "আপনার উইথড্র প্রক্রিয়াধীন — শীঘ্রই আপনার ওয়ালেটে পৌঁছাবে।",
    en: "Your withdrawal is processing — it will reach your wallet soon.",
  },
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

  // ── উইথড্র ──
  withdrawTitle: { bn: "উইথড্র", en: "Withdraw" },
  selectWithdrawMethod: { bn: "উপায় নির্বাচন করুন", en: "Select a method" },
  selectWallet: { bn: "নম্বর নির্বাচন করুন", en: "Select a number" },
  addNumber: { bn: "নতুন নম্বর যোগ করুন", en: "Add a number" },
  numberLabel: { bn: "নামের ঘর (ঐচ্ছিক)", en: "Label (optional)" },
  numberPlaceholder: { bn: "০১XXXXXXXXX", en: "01XXXXXXXXX" },
  registrationNumber: { bn: "রেজিস্ট্রেশনের নম্বর", en: "Registration number" },
  withdrawAmount: { bn: "কত টাকা তুলবেন", en: "How much to withdraw" },
  availableBalance: { bn: "তোলার মতো আছে", en: "Available" },
  withdrawNow: { bn: "উইথড্র করুন", en: "Withdraw" },
  withdrawDone: {
    bn: "আপনার উইথড্র জমা হয়েছে",
    en: "Your withdraw has been submitted",
  },
  withdrawDoneText: {
    bn: "অ্যাডমিন দেখে অনুমোদন দিলে টাকা আপনার নম্বরে চলে যাবে।",
    en: "Once an admin approves it, the money goes to your number.",
  },
  noWithdrawMethod: {
    bn: "এখন কোনো উইথড্রের উপায় চালু নেই",
    en: "No withdraw method is open right now",
  },
  turnoverLeftTitle: { bn: "টার্নওভার বাকি আছে", en: "Turnover is not finished" },
  turnoverLeftText: {
    bn: "শর্ত পূরণ হলে টাকা তুলতে পারবেন। এখনো বাকি",
    en: "You can withdraw once the condition is met. Still left",
  },
  pendingWithdrawTitle: {
    bn: "একটি উইথড্র অপেক্ষা করছে",
    en: "A withdraw is waiting",
  },
  pendingWithdrawText: {
    bn: "আগেরটি শেষ হলে নতুন করে আবেদন করতে পারবেন।",
    en: "You can ask again once that one is finished.",
  },
  removeNumber: { bn: "সরান", en: "Remove" },
  numberRemoved: { bn: "নম্বরটি সরানো হয়েছে", en: "The number was removed" },
  numberAdded: { bn: "নম্বর যোগ হয়েছে", en: "The number was added" },

  // ── প্রোফাইল ──
  profileTitle: { bn: "প্রোফাইল", en: "Profile" },
  balanceLabel: { bn: "আপনার ব্যালেন্স", en: "Your balance" },
  runningTurnover: { bn: "চলতি টার্নওভার", en: "Running turnover" },
  recentDeposits: { bn: "সাম্প্রতিক ডিপোজিট", en: "Recent deposits" },
  noDepositYet: { bn: "এখনো কোনো ডিপোজিট নেই", en: "No deposit yet" },
  logoutConfirm: {
    bn: "আপনি কি লগআউট করতে চান?",
    en: "Do you want to log out?",
  },
  status_pending: { bn: "অপেক্ষমাণ", en: "Pending" },
  status_approved: { bn: "অনুমোদিত", en: "Approved" },
  status_rejected: { bn: "বাতিল", en: "Rejected" },

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
  errBadWalletNumber: {
    bn: "নম্বরটি ঠিক নয়",
    en: "That number is not valid",
  },
  errWalletCap: {
    bn: "এর বেশি নম্বর যোগ করা যাবে না",
    en: "You cannot add more numbers",
  },
  errWalletExists: {
    bn: "এই নম্বরটি আগেই যোগ করা আছে",
    en: "This number is already added",
  },
  errLowBalance: {
    bn: "ব্যালেন্সে যথেষ্ট টাকা নেই",
    en: "Not enough balance",
  },
  errPendingWithdraw: {
    bn: "আপনার একটি উইথড্র এখনো অপেক্ষমাণ",
    en: "You already have a withdraw waiting",
  },
  errTurnoverLeft: {
    bn: "টার্নওভারের শর্ত এখনো পূরণ হয়নি",
    en: "The turnover condition is not met yet",
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

  // ── ইতিহাস (ট্রানজেকশন / বেটিং / টার্নওভার) ──
  transactionRecords: { bn: "ট্রানজেকশন রেকর্ডস", en: "Transaction Records" },
  bettingRecords: { bn: "বেটিং রেকর্ডস", en: "Betting Records" },
  turnoverRecords: { bn: "টার্নওভার", en: "Turnover" },
  nothingYet: { bn: "এখনো কিছু নেই", en: "Nothing here yet" },
  refresh: { bn: "রিফ্রেশ", en: "Refresh" },

  tabDeposit: { bn: "ডিপোজিট", en: "Deposit" },
  tabAutoDeposit: { bn: "অটো ডিপোজিট", en: "Auto Deposit" },
  tabWithdraw: { bn: "উইথড্র", en: "Withdraw" },
  tabAutoWithdraw: { bn: "অটো উইথড্র", en: "Auto Withdraw" },
  tabBet: { bn: "বেট", en: "Bet" },
  tabTurnover: { bn: "টার্নওভার", en: "Turnover" },

  // ইতিহাসের ট্যাব — কী `tab_<route segment>` আকারে, তাই URL থেকেই মেলে
  tab_deposit: { bn: "ডিপোজিট হিস্টোরি", en: "Deposit History" },
  tab_auto_deposit: { bn: "অটো ডিপোজিট হিস্টোরি", en: "Auto Deposit History" },
  tab_withdraw: { bn: "উইথড্র হিস্টোরি", en: "Withdraw History" },
  tab_auto_withdraw: { bn: "অটো উইথড্র হিস্টোরি", en: "Auto Withdraw History" },
  tab_bet: { bn: "বেট হিস্টোরি", en: "Bet History" },
  tab_turnover: { bn: "টার্নওভার হিস্টোরি", en: "Turnover History" },

  labelTotal: { bn: "মোট", en: "Total" },
  labelPage: { bn: "পেজ", en: "Page" },
  labelOf: { bn: "/", en: "of" },
  labelPrev: { bn: "আগের", en: "Prev" },
  labelTransaction: { bn: "ট্রানজেকশন", en: "Transaction" },
  labelProvider: { bn: "প্রোভাইডার", en: "Provider" },
  labelSerial: { bn: "সিরিয়াল", en: "Serial" },
  labelLeft: { bn: "বাকি", en: "Left" },

  filterAll: { bn: "সব", en: "All" },
  statusPending: { bn: "পেন্ডিং", en: "Pending" },
  statusApproved: { bn: "অনুমোদিত", en: "Approved" },
  statusRejected: { bn: "বাতিল", en: "Rejected" },
  statusPaid: { bn: "পেইড", en: "Paid" },
  statusFailed: { bn: "ব্যর্থ", en: "Failed" },
  statusProcessing: { bn: "প্রসেসিং", en: "Processing" },
  statusRunning: { bn: "চলমান", en: "Running" },
  statusCompleted: { bn: "সম্পন্ন", en: "Completed" },
  resultWin: { bn: "জিতেছেন", en: "Won" },
  resultLoss: { bn: "হেরেছেন", en: "Lost" },
  resultPush: { bn: "পুশ", en: "Push" },

  labelAmount: { bn: "পরিমাণ", en: "Amount" },
  labelBonus: { bn: "বোনাস", en: "Bonus" },
  labelCredited: { bn: "জমা হয়েছে", en: "Credited" },
  labelTurnover: { bn: "টার্নওভার", en: "Turnover" },
  labelMethod: { bn: "মাধ্যম", en: "Method" },
  labelFee: { bn: "ফি", en: "Fee" },
  labelReason: { bn: "কারণ", en: "Reason" },
  labelProof: { bn: "প্রমাণ", en: "Proof" },
  labelChannel: { bn: "চ্যানেল", en: "Channel" },
  labelWallet: { bn: "নম্বর", en: "Wallet" },
  labelDate: { bn: "তারিখ", en: "Date" },
  labelInvoice: { bn: "ইনভয়েস", en: "Invoice" },
  labelGame: { bn: "গেম", en: "Game" },
  labelRound: { bn: "রাউন্ড", en: "Round" },
  labelBet: { bn: "বেট", en: "Bet" },
  labelWin: { bn: "উইন", en: "Win" },
  labelNet: { bn: "নেট", en: "Net" },
  labelBalanceBefore: { bn: "আগের ব্যালেন্স", en: "Balance before" },
  labelBalanceAfter: { bn: "পরের ব্যালেন্স", en: "Balance after" },
  labelAdminNote: { bn: "নোট", en: "Note" },
  labelRequired: { bn: "প্রয়োজন", en: "Required" },
  labelProgress: { bn: "হয়েছে", en: "Progress" },
  labelCompletedAt: { bn: "সম্পন্ন হয়েছে", en: "Completed at" },

  sourceDeposit: { bn: "ডিপোজিট", en: "Deposit" },
  sourceAutoDeposit: { bn: "অটো ডিপোজিট", en: "Auto Deposit" },
  sourceRegisterBonus: { bn: "রেজিস্টার বোনাস", en: "Register Bonus" },
  sourceAdminDeposit: { bn: "অ্যাডমিন ডিপোজিট", en: "Admin Deposit" },

  providerBreakdown: { bn: "প্রোভাইডার অনুযায়ী", en: "By provider" },
  anyProvider: { bn: "যেকোনো প্রোভাইডার", en: "Any provider" },

  appHeroTitle: { bn: "ডাউনলোড BET CHOKKOR অ্যাপ", en: "Download the BET CHOKKOR app" },
  appHeroLead: { bn: "ব্যবহারকারীদের তাৎক্ষণিক অর্থ উপার্জন শুরু করার জন্য সেরা প্ল্যাটফর্ম প্রদান করে।", en: "The best platform to start earning instantly." },
  appHeroText: { bn: "অ্যাপটি ব্যবহারকারীদের তাৎক্ষণিক বেট করতে এবং বড় জিততে সবচেয়ে বিস্তৃত ক্রীড়া এবং গেম সংগ্রহ প্রদান করে। এখনই আপনার অ্যান্ড্রয়েড ডিভাইসে BET CHOKKOR অ্যাপ ডাউনলোড করুন।", en: "The app gives you the widest range of sports and games to bet instantly and win big. Download the BET CHOKKOR app on your Android device now." },
  appHelpNeeded: { bn: "ইনস্টলেশনে সাহায্য প্রয়োজন?", en: "Need help installing?" },
  appComingSoon: { bn: "অ্যাপটি শীঘ্রই আসছে। একটু পরে আবার দেখুন।", en: "The app is coming soon. Please check back later." },
  appExpSub: { bn: "বিস্তৃত পণ্যের পরিসর সহ", en: "With a wide range of products" },
  appFeatSub: { bn: "BET CHOKKOR অ্যাপের", en: "of the BET CHOKKOR app" },
  appExpEyebrow: { bn: "এখনই শুরু করুন — কোনো সীমা নেই", en: "Start now — no limits" },
  appExpTitle: { bn: "অভিজ্ঞতা", en: "The experience" },
  appExpSports: { bn: "স্পোর্টস", en: "Sports" },
  appExpSportsText: { bn: "বৃহত্তম ক্রীড়া ইভেন্টে প্রতিযোগিতামূলক অডস", en: "Competitive odds on the biggest sporting events" },
  appExpCasino: { bn: "ক্যাসিনো", en: "Casino" },
  appExpCasinoText: { bn: "বিভিন্ন ধরনের লাইভ ক্যাসিনো অভিজ্ঞতা", en: "A wide variety of live casino experiences" },
  appExpSlots: { bn: "স্লটস", en: "Slots" },
  appExpSlotsText: { bn: "উচ্চ RTP সহ ১০০০+ স্লট গেম", en: "1000+ slot games with high RTP" },
  appExpTable: { bn: "টেবিল", en: "Table" },
  appExpTableText: { bn: "প্রথম শ্রেণীর মানের হট ও উত্তেজনাপূর্ণ টেবিল গেম", en: "First-class hot and exciting table games" },
  appFeatEyebrow: { bn: "আবিষ্কার করুন", en: "Discover" },
  appFeatTitle: { bn: "৬টি মূল বৈশিষ্ট্য", en: "6 key features" },
  appFeatFree: { bn: "বিনামূল্যে ডাউনলোড ও ব্যবহার", en: "Free to download and use" },
  appFeatBiometric: { bn: "বায়োমেট্রিক লগইন", en: "Biometric login" },
  appFeatLiveScore: { bn: "লাইভ স্কোর আপডেট", en: "Live score updates" },
  appFeatLiveBet: { bn: "লাইভ বেটিং এর মাধ্যমে তাৎক্ষণিক আয়", en: "Instant earning through live betting" },
  appFeatFast: { bn: "দ্রুত ডিপোজিট ও উইথড্র", en: "Fast deposits and withdrawals" },
  appFeatSecure: { bn: "নিরাপদ ও এনক্রিপ্টেড", en: "Secure and encrypted" },

  refWhatIsTitle: { bn: "রেফারেল প্রোগ্রাম কি?", en: "What is the referral program?" },
  refWhatIsText: { bn: "আপনার বন্ধুকে রেফার করে মোট তিনটি ধাপে ক্যাশ প্রাইজ উপভোগ করতে পারেন। এটি হবে আপনার দীর্ঘমেয়াদী ইনকাম, এবং যতবার তারা বেট ধরবে, ততবারই আপনি আলাদা কমিশনের পার্সেন্টেজ পাবেন।", en: "Refer your friends and enjoy cash prizes across three levels. It becomes your long-term income — every time they bet, you earn a commission percentage." },
  refRulesBtn: { bn: "নিয়মাবলী", en: "Rules" },
  refCashRatio: { bn: "ক্যাশ রিওয়ার্ড রেশিও", en: "Cash reward ratio" },
  refTurnoverRange: { bn: "টার্নওভার রেঞ্জ", en: "Turnover range" },
  refDepositRange: { bn: "ডিপোজিট রেঞ্জ", en: "Deposit range" },
  refWinLossRange: { bn: "জয়-পরাজয়ের রেঞ্জ", en: "Win-loss range" },
  refOver: { bn: "এর বেশি", en: "over" },
  refLevel: { bn: "লেভেল", en: "Level" },
  refMorePrizeTitle: { bn: "কিভাবে আরো প্রাইজ পাবেন?", en: "How to win more prizes?" },
  refStep1Title: { bn: "ইনভিটেশন পাঠান", en: "Send an invitation" },
  refStep1Text: { bn: "আপনার রেফারেল জার্নি শুরু করতে", en: "To start your referral journey" },
  refStep2Title: { bn: "ফ্রেন্ড রেজিস্ট্রেশন", en: "Friend registers" },
  refStep2Text: { bn: "বেট ধরার সাথে", en: "As they place bets" },
  refStep3Title: { bn: "প্রতিদিন আনলিমিটেড ক্যাশ উপার্জন শুরু করুন", en: "Start earning unlimited cash daily" },
  refStep3Text: { bn: "কিছু না করেই।", en: "Without doing anything." },

  // ── প্রোফাইল ড্রপডাউন ──
  signupDate: { bn: "সাইন আপ এর তারিখ", en: "Sign up date" },
  menuPersonalInfo: { bn: "ব্যক্তিগত তথ্য", en: "Personal Info" },
  menuSecurity: { bn: "লগইন ও সিকিউরিটি", en: "Login & Security" },
  menuReferral: { bn: "মাই রেফারেল", en: "My Referral" },

  // ── প্রোফাইলের ঘরগুলো ──
  manage: { bn: "ম্যানেজ", en: "Manage" },
  copy: { bn: "কপি করুন", en: "Copy" },
  show: { bn: "দেখান", en: "Show" },
  hide: { bn: "লুকান", en: "Hide" },
  savedTitle: { bn: "সেভ হয়েছে", en: "Saved" },
  notVerified: { bn: "যাচাই করা হয়নি", en: "Not verified" },

  rowUsername: { bn: "ব্যবহারকারীর নাম", en: "Username" },
  rowFullName: { bn: "সম্পূর্ণ লিগ্যাল নাম", en: "Full legal name" },
  rowBirthday: { bn: "জন্ম তারিখ", en: "Date of birth" },
  rowPhone: { bn: "ফোন", en: "Phone" },
  rowEmail: { bn: "ইমেইল", en: "Email" },

  legalNamePlaceholder: {
    bn: "আপনার সম্পূর্ণ লিগ্যাল নেম লিখুন",
    en: "Enter your full legal name",
  },
  profileLockNote: {
    bn: "গোপনীয়তা এবং নিরাপত্তার জন্য, নিশ্চিতকরণের পরে তথ্য পরিবর্তন করা যাবে না। প্রয়োজনে কাস্টমার সার্ভিসে যোগাযোগ করুন।",
    en: "For privacy and security, this cannot be changed once confirmed. Please contact customer service if you need to.",
  },
  emailAddress: { bn: "ইমেইল অ্যাড্রেস", en: "Email address" },
  emailModalText: {
    bn: "আপনার ইমেইল অ্যাড্রেসটি অ্যাকাউন্টের সাথে যুক্ত থাকবে।",
    en: "This email will be linked to your account.",
  },
  phoneModalText: {
    bn: "আপনার ফোন নম্বরে SMS এর মাধ্যমে একটি ভেরিফিকেশন কোড পাবেন।",
    en: "You will get a verification code by SMS on this number.",
  },
  otpLabel: { bn: "ভেরিফিকেশন কোড", en: "Verification code" },

  fullNameSaved: { bn: "আপনার নাম সেভ হয়েছে।", en: "Your name has been saved." },
  birthdaySaved: {
    bn: "আপনার জন্ম তারিখ সেভ হয়েছে।",
    en: "Your date of birth has been saved.",
  },
  phoneSaved: { bn: "ফোন নম্বর সেভ হয়েছে।", en: "Your phone number has been saved." },
  emailSaved: { bn: "ইমেইল সেভ হয়েছে।", en: "Your email has been saved." },

  // ── লগইন ও সিকিউরিটি ──
  passwordLabel: { bn: "পাসওয়ার্ড", en: "Password" },
  changePassword: { bn: "চেঞ্জ পাসওয়ার্ড", en: "Change password" },
  currentPassword: { bn: "বর্তমান পাসওয়ার্ড", en: "Current password" },
  confirmNewPassword: {
    bn: "নিশ্চিত করুন নতুন পাসওয়ার্ড",
    en: "Confirm new password",
  },
  passwordChangedNote: {
    bn: "আপনার পাসওয়ার্ড বদলে গেছে।",
    en: "Your password has been changed.",
  },

  pwRule_length: { bn: "৬-২০ অক্ষর হতে হবে", en: "Must be 6-20 characters" },
  pwRule_upper: {
    bn: "১টি বড় হাতের বর্ণমালা (A-Z) থাকতে হবে",
    en: "Must have one uppercase letter (A-Z)",
  },
  pwRule_lower: {
    bn: "১টি ছোট হাতের বর্ণমালা (a-z) থাকতে হবে",
    en: "Must have one lowercase letter (a-z)",
  },
  pwRule_digit: {
    bn: "(0-9) এর মধ্যে অবশ্যই একটি নাম্বার থাকতে হবে",
    en: "Must have one number (0-9)",
  },
  pwRule_charset: {
    bn: "অনুমোদিত স্পেশাল চিহ্ন (!@#$%*)",
    en: "Allowed special characters (!@#$%*)",
  },

  // ── প্রোফাইলের ভুলগুলো ──
  errBadFullName: {
    bn: "নামটা ইংরেজি অক্ষরে, ৩ থেকে ৬০ অক্ষরের মধ্যে লিখুন",
    en: "Write the name in English letters, 3 to 60 characters",
  },
  errBadBirthday: { bn: "তারিখটা ঠিক নেই", en: "That date is not valid" },
  errTooYoung: { bn: "কমপক্ষে ১৮ বছর হতে হবে", en: "You must be at least 18" },
  errAlreadySet: {
    bn: "এই তথ্য আগেই বসানো হয়েছে, বদলাতে কাস্টমার সার্ভিসে যোগাযোগ করুন",
    en: "This is already set — contact customer service to change it",
  },
  errBadEmail: { bn: "ইমেইলটা ঠিক নেই", en: "That email is not valid" },
  errEmailTaken: {
    bn: "এই ইমেইলে আগেই অ্যাকাউন্ট আছে",
    en: "This email is already used",
  },
  errBadPassword: {
    bn: "বর্তমান পাসওয়ার্ডটা ঠিক নেই",
    en: "Your current password is not correct",
  },
  errWeakPassword: {
    bn: "নতুন পাসওয়ার্ডটা নিয়মগুলো মানছে না",
    en: "The new password does not meet the rules",
  },
  errSamePassword: {
    bn: "নতুন পাসওয়ার্ড আগেরটার থেকে আলাদা হতে হবে",
    en: "The new password must be different",
  },
  errPasswordMismatch: {
    bn: "দুটো পাসওয়ার্ড মিলছে না",
    en: "The two passwords do not match",
  },

  // ── গেম ──
  gamePreparing: { bn: "গেম প্রস্তুত করা হচ্ছে…", en: "Preparing your game…" },
  gameFailedTitle: { bn: "গেম চালু হয়নি", en: "Game did not start" },
  gameFailedText: {
    bn: "গেমটি চালু করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
    en: "There was a problem starting this game. Please try again.",
  },
  gameLaunchFailed: { bn: "গেম চালু করা যায়নি", en: "Could not start the game" },
  errGameNotReady: {
    bn: "গেম এখন চালু করা যাচ্ছে না, একটু পরে চেষ্টা করুন",
    en: "Games are unavailable right now, please try again later",
  },
  notification: { bn: "নোটিফিকেশন", en: "Notification" },
  noNotification: {
    bn: "এখন কোনো নোটিফিকেশন নেই",
    en: "No notifications right now",
  },
  verification: { bn: "প্রতিপাদন", en: "Verification" },
  myVip: { bn: "মাই ভিআইপি", en: "My VIP" },
  profileMenu: { bn: "প্রোফাইল", en: "Profile" },
  soonTitle: { bn: "শীঘ্রই আসছে", en: "Coming soon" },
  soonText: {
    bn: "এই অংশটা এখনো তৈরি হচ্ছে। খুব শিগগিরই চালু হবে।",
    en: "This section is still being built. It will be available soon.",
  },

  // ── পরিচয় যাচাই (KYC) ──
  verifyIntro: {
    bn: "নিজের পরিচয় যাচাই করে নিলে অ্যাকাউন্টটা নিরাপদ থাকে।",
    en: "Verifying your identity keeps your account safe.",
  },
  verifyGateBoth: {
    bn: "যাচাই সম্পন্ন হলে তবেই ডিপোজিট ও উইথড্র করা যাবে।",
    en: "Deposit and withdraw open up once verification is done.",
  },
  verifyGateDeposit: {
    bn: "যাচাই সম্পন্ন হলে তবেই ডিপোজিট করা যাবে।",
    en: "Deposit opens up once verification is done.",
  },
  verifyGateWithdraw: {
    bn: "যাচাই সম্পন্ন হলে তবেই উইথড্র করা যাবে।",
    en: "Withdraw opens up once verification is done.",
  },
  verifyFullName: { bn: "কাগজে যে নাম আছে", en: "Name as on the document" },
  verifyFullNameHint: { bn: "পুরো নাম লিখুন", en: "Enter the full name" },
  verifyBirthDate: { bn: "জন্ম তারিখ", en: "Date of birth" },
  verifyDocType: { bn: "কোন কাগজ দিচ্ছেন", en: "Document type" },
  docNid: { bn: "এনআইডি", en: "NID" },
  docPassport: { bn: "পাসপোর্ট", en: "Passport" },
  docDriving: { bn: "ড্রাইভিং লাইসেন্স", en: "Driving licence" },
  verifyDocNumber: { bn: "কাগজের নম্বর", en: "Document number" },
  verifyDocNumberHint: { bn: "নম্বরটা লিখুন", en: "Enter the number" },
  verifyFront: { bn: "কাগজের সামনের দিক", en: "Front of the document" },
  verifyFrontHint: { bn: "ছবি তুলে দিন", en: "Upload a photo" },
  verifyBack: { bn: "কাগজের পিছনের দিক", en: "Back of the document" },
  verifyBackHint: { bn: "থাকলে দিন (ঐচ্ছিক)", en: "If there is one (optional)" },
  verifySelfie: { bn: "কাগজ হাতে নিজের ছবি", en: "Selfie holding the document" },
  verifySelfieHint: { bn: "মুখ ও কাগজ দুটোই দেখা যেন যায়", en: "Both your face and the document must be readable" },
  verifyNeedImages: {
    bn: "কাগজের সামনের দিক আর নিজের ছবি দুটোই দিতে হবে",
    en: "The front of the document and a selfie are both required",
  },
  verifySubmit: { bn: "যাচাইয়ের জন্য পাঠান", en: "Submit for review" },
  optional: { bn: "ঐচ্ছিক", en: "optional" },
  referralLockedNote: {
    bn: "রেফারেল লিংক দিয়ে এসেছেন, তাই কোডটি বসানোই আছে।",
    en: "You arrived with a referral link, so this code is fixed.",
  },
  withdrawNeedVerifyTitle: {
    bn: "আগে পরিচয় যাচাই করুন",
    en: "Verify your identity first",
  },
  withdrawNeedVerifyText: {
    bn: "টাকা তোলার আগে পরিচয় যাচাই শেষ করতে হবে। অ্যাডমিন দেখে অনুমোদন দিলেই উইথড্র খুলে যাবে।",
    en: "You must finish identity verification before withdrawing. Once an admin reviews and approves it, withdrawing opens up.",
  },
  goToVerification: {
    bn: "পরিচয় যাচাই করুন",
    en: "Verify identity",
  },

  verifiedBadge: {
    bn: "পরিচয় যাচাই হয়েছে",
    en: "Identity verified",
  },

  verifyPendingTitle: { bn: "যাচাই চলছে", en: "Being checked" },
  verifyPendingText: {
    bn: "আপনার কাগজপত্র দেখা হচ্ছে। হয়ে গেলে জানিয়ে দেওয়া হবে।",
    en: "Your documents are being reviewed. You will be told once it is done.",
  },
  verifyApprovedTitle: { bn: "যাচাই সম্পন্ন", en: "Verified" },
  verifyApprovedText: {
    bn: "আপনার পরিচয় যাচাই হয়ে গেছে।",
    en: "Your identity has been verified.",
  },
  verifyRejected: { bn: "আবেদনটি বাতিল হয়েছে", en: "Your submission was rejected" },
  errNeedVerification: {
    bn: "আগে পরিচয় যাচাই সম্পন্ন করুন",
    en: "Please complete identity verification first",
  },
  errAlreadyVerified: {
    bn: "আপনার পরিচয় আগেই যাচাই হয়ে গেছে",
    en: "Your identity is already verified",
  },

  // ── রেফারেল প্রোগ্রাম ──
  referralOff: {
    bn: "রেফারেল প্রোগ্রাম এখন বন্ধ আছে",
    en: "The referral program is off right now",
  },
  yourReferralCode: { bn: "আপনার রেফারেল কোড", en: "Your referral code" },
  copyLink: { bn: "কপি লিংক", en: "Copy link" },
  copyCode: { bn: "কোড কপি", en: "Copy code" },

  refTabInfo: { bn: "তথ্য", en: "Info" },
  refTabDetails: { bn: "বিস্তারিত", en: "Details" },
  refTabRewards: { bn: "পুরস্কার", en: "Rewards" },

  refHowItWorks: { bn: "রেফারেল প্রোগ্রাম কী?", en: "What is the referral program?" },
  refHowItWorksText: {
    bn: "আপনার কোড দিয়ে বন্ধু অ্যাকাউন্ট খুললে তিনি যত খেলবেন, তার একটা অংশ আপনি পাবেন। মাসে বেশি বন্ধু আনলে বাড়তি থোক বোনাসও আছে।",
    en: "When a friend signs up with your code, you earn a share of everything they play. Bring in more friends in a month and there are extra lump-sum bonuses too.",
  },
  refCommissionTable: { bn: "কত শতাংশ পাবেন", en: "How much you earn" },
  refTurnoverFrom: { bn: "বন্ধুর টার্নওভার", en: "Friend's turnover" },
  refTier: { bn: "ধাপ", en: "Tier" },
  refTierNote: {
    bn: "ধাপ ১ মানে সরাসরি আপনার আনা বন্ধু, ধাপ ২ তাঁর আনা বন্ধু — এভাবে।",
    en: "Tier 1 is a friend you brought in, tier 2 is a friend they brought in, and so on.",
  },

  refActiveDownline: { bn: "সক্রিয় বন্ধু", en: "Active friends" },
  refDownlineTurnover: { bn: "তাঁদের টার্নওভার", en: "Their turnover" },
  refClaimReadyTitle: { bn: "আপনার বোনাস তৈরি!", en: "Your bonus is ready!" },
  refCongratsTitle: { bn: "অভিনন্দন! 🎉", en: "Congratulations! 🎉" },
  refCongratsText: { bn: "আপনার বোনাস ব্যালেন্সে যোগ হয়েছে:", en: "Your bonus has been added to your balance:" },
  refCongratsOk: { bn: "দারুণ!", en: "Awesome!" },
  refClaimable: { bn: "তুলতে পারবেন", en: "Ready to claim" },
  refClaimed: { bn: "নেওয়া হয়েছে", en: "Claimed" },
  refPending: { bn: "জমা আছে", en: "Waiting" },
  refClaimNow: { bn: "নিয়ে নিন", en: "Claim" },
  referralClaimed: { bn: "টাকা যোগ হয়েছে", en: "Added to your balance" },
  referralClaimedText: { bn: "ব্যালেন্সে যোগ হলো", en: "Added to your balance:" },

  refMilestones: { bn: "মাইলফলক বোনাস", en: "Milestone bonus" },
  refInvite: { bn: "ইনভাইট", en: "Invite" },
  refInvited: { bn: "এনেছেন", en: "brought in" },
  refGiven: { bn: "পেয়েছেন", en: "earned" },
  refMyDownline: { bn: "আমার বন্ধুরা", en: "My friends" },
  refNoDownline: {
    bn: "এখনো কেউ আপনার কোড দিয়ে আসেননি",
    en: "Nobody has signed up with your code yet",
  },
  refProgramStatus: {
    bn: "রেফারেল প্রোগ্রামের স্ট্যাটাস",
    en: "Referral program status",
  },
  refEarnedStatus: { bn: "অর্জিত রেফারেল স্ট্যাটাস", en: "Earned referral status" },
  refBonusRules: { bn: "অর্জিত বোনাসের নিয়মাবলী", en: "Bonus rules" },
  refTotalReward: { bn: "মোট পুরস্কার", en: "Total reward" },
  refRewardTaka: { bn: "রিওয়ার্ড (৳)", en: "Reward (৳)" },
  shareIt: { bn: "শেয়ার করুন", en: "Share" },
  refCommission: { bn: "কমিশন", en: "Commission" },
  refMilestone: { bn: "মাইলফলক", en: "Milestone" },

  periodDaily: { bn: "প্রতিদিন", en: "Daily" },
  periodWeekly: { bn: "সাপ্তাহিক", en: "Weekly" },
  periodMonthly: { bn: "মান্থলি", en: "Monthly" },

  // ── 404 ──
  notFoundText: {
    bn: "দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।",
    en: "Sorry, the page you are looking for was not found.",
  },
  backToHome: { bn: "হোমে ফিরুন", en: "Back to Home" },
};

export default locale;
