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


  // ── সাধারণ ──
  loading: { bn: "লোড হচ্ছে…", en: "Loading…" },
  logout: { bn: "লগআউট", en: "Logout" },
  menu: { bn: "মেনু", en: "Menu" },
  continue: { bn: "চালিয়ে যান", en: "Continue" },
  copied: { bn: "কপি হয়েছে", en: "Copied" },
  copyLink: { bn: "লিংক কপি করুন", en: "Copy link" },
  somethingWrong: {
    bn: "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন",
    en: "Something went wrong, please try again",
  },
  filterAll: { bn: "সব", en: "All" },
  labelPrev: { bn: "আগের", en: "Prev" },
  labelNext: { bn: "পরের", en: "Next" },
  currency: { bn: "মুদ্রা", en: "Currency" },
  joined: { bn: "যোগ দিয়েছেন", en: "Joined" },
  accountStatus: { bn: "অ্যাকাউন্টের অবস্থা", en: "Account status" },
  statusActive: { bn: "সক্রিয়", en: "Active" },
  statusInactive: { bn: "নিষ্ক্রিয়", en: "Inactive" },
  statusPending: { bn: "পেন্ডিং", en: "Pending" },
  statusApproved: { bn: "অনুমোদিত", en: "Approved" },
  statusRejected: { bn: "বাতিল", en: "Rejected" },

  // ── OTP ও পাসওয়ার্ড ──
  otpTitle: { bn: "যাচাইকরণ কোড", en: "Verification code" },
  otpPlaceholder: { bn: "৬ সংখ্যার কোড", en: "6 digit code" },
  otpSentTo: { bn: "কোড পাঠানো হয়েছে", en: "Code sent to" },
  resendOtp: { bn: "কোড আবার পাঠান", en: "Resend code" },
  resendIn: { bn: "আবার পাঠাতে পারবেন", en: "Resend in" },
  seconds: { bn: "সেকেন্ড", en: "s" },
  verify: { bn: "যাচাই করুন", en: "Verify" },
  newPassword: { bn: "নতুন পাসওয়ার্ড", en: "New password" },
  newPasswordPlaceholder: { bn: "নতুন পাসওয়ার্ড লিখুন", en: "Enter a new password" },
  savePassword: { bn: "পাসওয়ার্ড সেভ করুন", en: "Save password" },
  passwordChanged: {
    bn: "পাসওয়ার্ড বদলে গেছে। এখন লগইন করুন।",
    en: "Password changed. Please log in.",
  },
  passwordTooShort: {
    bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
    en: "Password must be at least 6 characters",
  },

  // ── ড্যাশবোর্ডের মেনু ──
  affiliatePanel: { bn: "অ্যাফিলিয়েট প্যানেল", en: "Affiliate panel" },
  affiliateRole: { bn: "অ্যাফিলিয়েট", en: "Affiliate" },
  navDashboard: { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  navMyUsers: { bn: "আমার খেলোয়াড়", en: "My players" },
  navCommissionStatus: { bn: "কমিশনের হিসাব", en: "Commission" },
  navWithdraw: { bn: "টাকা তুলুন", en: "Withdraw" },
  navWithdrawHistory: { bn: "উইথড্র ইতিহাস", en: "Withdraw history" },
  navProfile: { bn: "প্রোফাইল", en: "Profile" },

  // ── ড্যাশবোর্ড ──
  statTotalPlayers: { bn: "মোট খেলোয়াড়", en: "Total players" },
  statActive: { bn: "সক্রিয়", en: "Active" },
  statThisMonth: { bn: "এই মাসে এসেছেন", en: "Joined this month" },
  statNewPlayers: { bn: "নতুন খেলোয়াড়", en: "New players" },
  statPlayerDeposit: { bn: "তাঁদের মোট জমা", en: "Their deposits" },
  statDeposits: { bn: "টি জমা", en: "deposits" },
  statNetCommission: { bn: "শেষ কমিশন", en: "Net commission" },
  statPayable: { bn: "আপনার পাওনা", en: "Payable to you" },
  statOwed: { bn: "আপনার দেনা", en: "You owe" },
  statRounds: { bn: "মোট রাউন্ড", en: "Rounds" },
  statTurnover: { bn: "টার্নওভার", en: "Turnover" },
  statGameCommission: { bn: "খেলা থেকে কমিশন", en: "Commission from play" },
  statMonthCommission: { bn: "এই মাসের কমিশন", en: "This month" },
  statReferred: { bn: "আপনার আনা", en: "Referred by you" },

  commissionBalances: { bn: "জমে থাকা কমিশন", en: "Commission balances" },
  commissionBalancesText: {
    bn: "অ্যাডমিন হিসাব মেলালে এই টাকা ব্যালেন্সে চলে যায়।",
    en: "These move into your balance when the admin settles up.",
  },
  commissionRates: { bn: "কমিশনের হার", en: "Commission rates" },
  commissionRatesText: {
    bn: "কোন খাত থেকে কত শতাংশ পাবেন।",
    en: "What share you earn from each source.",
  },
  cmRefer: { bn: "রেফার কমিশন", en: "Refer commission" },
  cmDeposit: { bn: "ডিপোজিট কমিশন", en: "Deposit commission" },
  cmGameLoss: { bn: "খেলোয়াড় হারলে", en: "When a player loses" },
  cmGameWin: { bn: "খেলোয়াড় জিতলে", en: "When a player wins" },
  cmNet: { bn: "শেষ হিসাব", en: "Net" },
  cmGross: { bn: "মোট পাওনা", en: "Gross" },
  cmGrossText: { bn: "জেতার ভাগ বাদ দেওয়ার আগে", en: "Before the win share is taken out" },

  gameSummary: { bn: "খেলার হিসাব", en: "Play summary" },
  gameSummaryText: {
    bn: "আপনার খেলোয়াড়েরা কত খেলেছেন।",
    en: "How much your players have played.",
  },
  myReferralLink: { bn: "আপনার রেফারেল লিংক", en: "Your referral link" },
  myReferralLinkText: {
    bn: "এই লিংক দিয়ে কেউ অ্যাকাউন্ট খুললে তিনি আপনার খেলোয়াড়।",
    en: "Anyone signing up with this link becomes your player.",
  },
  myReferralHint: {
    bn: "যত বেশি সক্রিয় খেলোয়াড়, তত বেশি কমিশন।",
    en: "The more active players, the more commission.",
  },
  dashboardNote: {
    bn: "খেলোয়াড় হারলে আপনার পাওনা বাড়ে, জিতলে জেতার ভাগটা বাদ যায় — তাই শেষ হিসাব ঋণাত্মকও হতে পারে।",
    en: "A player's loss adds to what you are owed; their win is deducted — so the net can be negative.",
  },

  // ── আমার খেলোয়াড় ──
  myUsersText: {
    bn: "আপনার লিংক দিয়ে যাঁরা এসেছেন।",
    en: "Everyone who signed up with your link.",
  },
  searchPlayer: { bn: "নাম বা নম্বর দিয়ে খুঁজুন", en: "Search name or number" },
  noPlayersYet: { bn: "এখনো কেউ আসেননি", en: "Nobody yet" },
  thPlayer: { bn: "খেলোয়াড়", en: "Player" },
  thJoined: { bn: "কবে এসেছেন", en: "Joined" },
  thDeposit: { bn: "জমা", en: "Deposit" },
  thTurnover: { bn: "টার্নওভার", en: "Turnover" },
  thLastLogin: { bn: "শেষ লগইন", en: "Last login" },
  thStatus: { bn: "অবস্থা", en: "Status" },
  thWhen: { bn: "কখন", en: "When" },
  thGame: { bn: "গেম", en: "Game" },
  thBet: { bn: "বাজি", en: "Bet" },
  thResult: { bn: "ফল", en: "Result" },
  thCommission: { bn: "কমিশন", en: "Commission" },
  thMethod: { bn: "মাধ্যম", en: "Method" },
  thNumber: { bn: "নম্বর", en: "Number" },
  thAmount: { bn: "পরিমাণ", en: "Amount" },
  thAfter: { bn: "পরের ব্যালেন্স", en: "Balance after" },

  // ── কমিশনের হিসাব ──
  mainBalance: { bn: "ব্যালেন্স", en: "Balance" },
  mainBalanceText: { bn: "এখান থেকেই টাকা তোলা যায়", en: "This is what you can withdraw" },
  commissionHistory: { bn: "কমিশন কোথা থেকে এল", en: "Where the commission came from" },
  commissionHistoryText: {
    bn: "কোন খেলোয়াড়ের কোন রাউন্ড থেকে কত।",
    en: "Which player, which round, how much.",
  },
  noCommissionYet: { bn: "এখনো কোনো কমিশন নেই", en: "No commission yet" },
  commissionSettleNote: {
    bn: "জমে থাকা কমিশন অ্যাডমিন হিসাব মিলিয়ে ব্যালেন্সে বসিয়ে দেন; তারপর সেখান থেকে তোলা যায়।",
    en: "The admin settles your commission into your balance, and you withdraw from there.",
  },

  // ── প্রোফাইল ──
  myInfo: { bn: "আমার তথ্য", en: "My details" },
  myInfoText: { bn: "অ্যাকাউন্টে যা আছে", en: "What the account holds" },
  profileChangeNote: {
    bn: "নাম, নম্বর বা কমিশনের হার বদলাতে সাপোর্টে যোগাযোগ করুন।",
    en: "To change your name, number or commission rates, contact support.",
  },

  // ── উইথড্র ──
  withdrawText: {
    bn: "ব্যালেন্স থেকে নিজের নম্বরে টাকা নিন।",
    en: "Move money from your balance to your own number.",
  },
  withdrawHistoryText: { bn: "আগের আবেদনগুলো", en: "Your earlier requests" },
  availableBalance: { bn: "তোলার মতো আছে", en: "Available" },
  myNumbers: { bn: "সেভ করা নম্বর", en: "Saved numbers" },
  myNumbersText: { bn: "যেখানে টাকা যাবে", en: "Where the money goes" },
  selectWithdrawMethod: { bn: "উপায় নির্বাচন করুন", en: "Select a method" },
  selectWallet: { bn: "নম্বর নির্বাচন করুন", en: "Select a number" },
  addNumber: { bn: "যোগ করুন", en: "Add" },
  noNumberYet: { bn: "কোনো নম্বর সেভ করা নেই", en: "No number saved yet" },
  noWithdrawMethod: { bn: "এখন কোনো উপায় চালু নেই", en: "No method is open right now" },
  registrationNumber: { bn: "রেজিস্ট্রেশনের নম্বর", en: "Registration number" },
  withdrawAmount: { bn: "কত টাকা তুলবেন", en: "How much to withdraw" },
  amountPlaceholder: { bn: "টাকার পরিমাণ লিখুন", en: "Enter an amount" },
  minMax: { bn: "সর্বনিম্ন / সর্বোচ্চ", en: "Min / Max" },
  withdrawNow: { bn: "উইথড্র করুন", en: "Withdraw" },
  withdrawDone: { bn: "আপনার উইথড্র জমা হয়েছে", en: "Your withdraw has been submitted" },
  withdrawDoneText: {
    bn: "অ্যাডমিন দেখে অনুমোদন দিলে টাকা আপনার নম্বরে চলে যাবে।",
    en: "Once an admin approves it, the money goes to your number.",
  },
  noWithdrawYet: { bn: "এখনো কোনো উইথড্র নেই", en: "No withdraw yet" },
  pendingWithdrawText: {
    bn: "আপনার একটা আবেদন এখনো দেখা হচ্ছে। সেটা শেষ হলে আবার চেষ্টা করুন।",
    en: "You already have a request being checked. Try again once it is done.",
  },
  turnoverLeftText: { bn: "টার্নওভার বাকি আছে:", en: "Turnover still to play:" },
  needVerificationText: {
    bn: "আগে পরিচয় যাচাই সম্পন্ন করতে হবে।",
    en: "Please complete identity verification first.",
  },

  // ── সার্ভারের ভুলের বার্তা ──
  errMissingFields: { bn: "সব ঘর পূরণ করুন", en: "Please fill in every field" },
  errBadLogin: {
    bn: "ইউজারনেম বা পাসওয়ার্ড ঠিক নেই",
    en: "Username or password is not correct",
  },
  errAccountLocked: {
    bn: "অ্যাকাউন্ট সাময়িক বন্ধ, একটু পরে চেষ্টা করুন",
    en: "Account is locked, please try again later",
  },
  errAccountDisabled: { bn: "এই অ্যাকাউন্টটি বন্ধ আছে", en: "This account is disabled" },
  errNoAccount: { bn: "এই নম্বরে কোনো অ্যাকাউন্ট নেই", en: "No account found" },
  errUsernameTaken: { bn: "এই ইউজারনেম নেওয়া হয়ে গেছে", en: "This username is taken" },
  errUsernameChars: {
    bn: "ইউজারনেমে শুধু অক্ষর ও সংখ্যা চলবে",
    en: "Username allows only letters and numbers",
  },
  errUsernameLength: {
    bn: "ইউজারনেম ৪ থেকে ১৫ অক্ষরের হতে হবে",
    en: "Username must be 4 to 15 characters",
  },
  errPhoneTaken: { bn: "এই নম্বরে আগেই অ্যাকাউন্ট আছে", en: "This number already has an account" },
  errPasswordTooShort: {
    bn: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে",
    en: "Password must be at least 6 characters",
  },
  errOtpWrong: { bn: "কোডটা ঠিক নেই", en: "That code is not right" },
  errOtpExpired: { bn: "কোডের মেয়াদ শেষ, আবার পাঠান", en: "The code expired, send it again" },
  errOtpWait: { bn: "একটু পরে আবার চেষ্টা করুন", en: "Please wait a moment" },
  errOtpNotVerified: { bn: "আগে কোডটা যাচাই করুন", en: "Verify the code first" },
  errLowBalance: { bn: "ব্যালেন্সে যথেষ্ট টাকা নেই", en: "Not enough balance" },
  errPendingWithdraw: {
    bn: "আপনার একটা আবেদন এখনো ঝুলে আছে",
    en: "You already have a request waiting",
  },
  errNotAffiliate: {
    bn: "এই অংশটা অ্যাফিলিয়েটদের জন্য",
    en: "This area is for affiliates",
  },

  // ── 404 ──
  notFoundText: {
    bn: "দুঃখিত, আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।",
    en: "Sorry, the page you are looking for was not found.",
  },
  backToHome: { bn: "হোমে ফিরুন", en: "Back to Home" },
};

export default locale;
