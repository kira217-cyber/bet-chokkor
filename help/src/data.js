/**
 * Help-VIP এর সব কনটেন্ট — টপিক, প্রশ্ন-উত্তর, দুই ভাষায়।
 *
 * এক জায়গায় রাখা, যাতে নতুন প্রশ্ন যোগ করতে শুধু এই ফাইলটা ছুঁলেই চলে।
 * প্রতিটা টপিকের নিচে কয়েকটা FAQ; পাতাগুলো এই ডেটা ধরেই তৈরি হয়।
 */

export const UI = {
  brand: { en: "Help-VIP", bn: "হেল্প-ভিআইপি" },
  login: { en: "Log in", bn: "লগইন" },
  navHome: { en: "Home", bn: "হোম" },
  navTerms: { en: "Terms and Conditions", bn: "শর্তাবলী" },
  navMain: { en: "BET CHOKKOR", bn: "বেট চক্কর" },
  heroTitle: {
    en: "Welcome to the BET CHOKKOR Help Center",
    bn: "বেট চক্করের সাহায্য কেন্দ্রে স্বাগতম",
  },
  heroText: {
    en: "Need assistance? You've come to the right place. Whether it's your account, deposits and withdrawals, game rules, or technical support — our Help Center guides you every step of the way. Browse the topics or reach out to our support team.",
    bn: "সাহায্য দরকার? ঠিক জায়গাতেই এসেছেন। অ্যাকাউন্ট, জমা-উত্তোলন, খেলার নিয়ম কিংবা কারিগরি সমস্যা — সব ব্যাপারে এই সাহায্য কেন্দ্র আপনাকে ধাপে ধাপে পথ দেখাবে। টপিক ঘেঁটে দেখুন বা সাপোর্টে যোগাযোগ করুন।",
  },
  helpLead: { en: "Hi, how can we ", bn: "হ্যালো, আমরা কীভাবে " },
  helpWord: { en: "help", bn: "সাহায্য" },
  helpTail: { en: " you?", bn: " করতে পারি?" },
  searchPlaceholder: {
    en: "Search our help articles ...",
    bn: "সাহায্য নিবন্ধ খুঁজুন ...",
  },
  breadcrumbHome: { en: "Home", bn: "হোম" },
  breadcrumbHelp: { en: "Help Center", bn: "সাহায্য কেন্দ্র" },
  topics: { en: "Topics", bn: "টপিকসমূহ" },
  viewAll: { en: "View All", bn: "সব দেখুন" },
  noResult: {
    en: "No articles matched your search.",
    bn: "আপনার খোঁজার সাথে কোনো নিবন্ধ মেলেনি।",
  },
  quickLinks: { en: "Quick Links", bn: "কুইক লিংক" },
  information: { en: "Information", bn: "তথ্য" },
  footerAbout: {
    en: "BET CHOKKOR — a trusted iGaming destination with top-tier games and an exclusive VIP experience, all in one place.",
    bn: "বেট চক্কর — সেরা মানের গেম আর এক্সক্লুসিভ ভিআইপি অভিজ্ঞতার এক নির্ভরযোগ্য ঠিকানা, সবকিছু এক জায়গায়।",
  },
  copyright: { en: "All Rights Reserved", bn: "সর্বস্বত্ব সংরক্ষিত" },
  privacy: { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি" },
  terms: { en: "Terms & Conditions", bn: "শর্তাবলী" },
  backToTopics: { en: "Back to all topics", bn: "সব টপিকে ফিরুন" },
};

export const TOPICS = [
  {
    key: "account",
    icon: "user",
    name: { en: "Account", bn: "অ্যাকাউন্ট" },
    faqs: [
      {
        q: { en: "How do I create an account?", bn: "কীভাবে অ্যাকাউন্ট খুলব?" },
        a: {
          en: "Tap Sign Up on the main site, enter your phone number, choose a username and password, and confirm. Your account is ready in under a minute.",
          bn: "মূল সাইটে সাইন আপে চাপুন, ফোন নম্বর দিন, একটা ইউজারনেম ও পাসওয়ার্ড বেছে নিন, তারপর নিশ্চিত করুন। এক মিনিটের মধ্যেই অ্যাকাউন্ট তৈরি।",
        },
      },
      {
        q: { en: "I forgot my password. What do I do?", bn: "পাসওয়ার্ড ভুলে গেছি, কী করব?" },
        a: {
          en: "On the login screen tap 'Forgot Password', enter your username, and verify the code sent to your phone to set a new password.",
          bn: "লগইন পর্দায় 'পাসওয়ার্ড ভুলে গেছেন' চাপুন, ইউজারনেম দিন, ফোনে পাঠানো কোড যাচাই করে নতুন পাসওয়ার্ড দিন।",
        },
      },
      {
        q: { en: "How do I verify my identity (KYC)?", bn: "পরিচয় যাচাই (KYC) কীভাবে করব?" },
        a: {
          en: "Go to Profile → Verification, fill in your legal name and date of birth, upload your document and a selfie, then submit. An admin reviews it before approval.",
          bn: "প্রোফাইল → প্রতিপাদন এ যান, লিগ্যাল নাম ও জন্ম তারিখ দিন, কাগজপত্র ও একটা সেলফি আপলোড করে জমা দিন। অ্যাডমিন দেখে অনুমোদন দেন।",
        },
      },
    ],
  },
  {
    key: "payment",
    icon: "wallet",
    name: { en: "Payment", bn: "পেমেন্ট" },
    faqs: [
      {
        q: { en: "How do I make a deposit?", bn: "কীভাবে ডিপোজিট করব?" },
        a: {
          en: "Open Deposit, pick a method, send the money to the shown number, then submit the amount and transaction details. Balance is added after confirmation.",
          bn: "ডিপোজিট খুলুন, একটা মাধ্যম বাছুন, দেখানো নম্বরে টাকা পাঠান, তারপর পরিমাণ ও ট্রানজেকশনের তথ্য দিন। নিশ্চিত হলে ব্যালেন্স যোগ হয়।",
        },
      },
      {
        q: { en: "How long do withdrawals take?", bn: "উত্তোলনে কত সময় লাগে?" },
        a: {
          en: "Most withdrawals are processed within a few minutes to a few hours after an admin reviews the request, depending on the method.",
          bn: "অ্যাডমিন আবেদন দেখার পর মাধ্যম অনুযায়ী বেশিরভাগ উত্তোলন কয়েক মিনিট থেকে কয়েক ঘণ্টার মধ্যে সম্পন্ন হয়।",
        },
      },
      {
        q: { en: "Why is my withdrawal blocked?", bn: "উত্তোলন আটকে আছে কেন?" },
        a: {
          en: "Withdrawals may be held until identity verification is complete or the turnover requirement on a bonus is met. The withdraw page shows exactly what is pending.",
          bn: "পরিচয় যাচাই শেষ না হলে বা বোনাসের টার্নওভার শর্ত না মিটলে উত্তোলন আটকে থাকতে পারে। উইথড্র পাতায় ঠিক কী বাকি তা দেখানো হয়।",
        },
      },
    ],
  },
  {
    key: "tips",
    icon: "lightbulb",
    name: { en: "VIP Tips", bn: "ভিআইপি টিপস" },
    faqs: [
      {
        q: { en: "How does the VIP program work?", bn: "ভিআইপি প্রোগ্রাম কীভাবে কাজ করে?" },
        a: {
          en: "The more you play, the higher your VIP tier climbs, unlocking bigger rewards, faster withdrawals and dedicated support.",
          bn: "যত বেশি খেলবেন, ভিআইপি ধাপ তত উপরে উঠবে — বড় পুরস্কার, দ্রুত উত্তোলন আর আলাদা সাপোর্ট মেলে।",
        },
      },
      {
        q: { en: "How do I earn more from referrals?", bn: "রেফার থেকে বেশি আয় কীভাবে?" },
        a: {
          en: "Share your referral link. Every active player you bring earns you commission — and the more they play, the more you keep earning.",
          bn: "আপনার রেফারেল লিংক শেয়ার করুন। প্রতিটি সক্রিয় খেলোয়াড় আনলে কমিশন পান — তাঁরা যত খেলবেন, আপনি তত আয় করতে থাকবেন।",
        },
      },
    ],
  },
  {
    key: "promotions",
    icon: "gift",
    name: { en: "Promotions", bn: "প্রমোশন" },
    faqs: [
      {
        q: { en: "How do I claim a bonus?", bn: "বোনাস কীভাবে নেব?" },
        a: {
          en: "Eligible bonuses apply automatically, such as the register bonus. Check the Promotions page for current offers and their conditions.",
          bn: "উপযুক্ত বোনাস নিজে থেকেই বসে যায়, যেমন রেজিস্টার বোনাস। চলতি অফার ও শর্তের জন্য প্রমোশন পাতা দেখুন।",
        },
      },
      {
        q: { en: "What is a turnover requirement?", bn: "টার্নওভার শর্ত কী?" },
        a: {
          en: "A bonus must be played through a set number of times before it can be withdrawn. Your turnover progress is shown on the withdraw page.",
          bn: "উত্তোলনের আগে বোনাসটা নির্দিষ্ট কতবার খেলতে হয়। আপনার টার্নওভারের অগ্রগতি উইথড্র পাতায় দেখা যায়।",
        },
      },
    ],
  },
  {
    key: "sports",
    icon: "trophy",
    name: { en: "Sports", bn: "স্পোর্টস" },
    faqs: [
      {
        q: { en: "How do I place a sports bet?", bn: "স্পোর্টস বেট কীভাবে ধরব?" },
        a: {
          en: "Open the Sports section, pick a match and market, enter your stake and confirm. Live betting is available on selected events.",
          bn: "স্পোর্টস অংশে যান, একটা ম্যাচ ও মার্কেট বাছুন, বাজির পরিমাণ দিয়ে নিশ্চিত করুন। নির্দিষ্ট ইভেন্টে লাইভ বেটিংও আছে।",
        },
      },
      {
        q: { en: "When are winnings settled?", bn: "জেতা টাকা কখন বসে?" },
        a: {
          en: "Winnings are credited automatically once the event officially ends and results are confirmed by the provider.",
          bn: "ইভেন্ট আনুষ্ঠানিকভাবে শেষ হয়ে প্রোভাইডার ফল নিশ্চিত করলেই জেতা টাকা নিজে থেকে জমা হয়।",
        },
      },
    ],
  },
  {
    key: "casino",
    icon: "dice",
    name: { en: "Casino", bn: "ক্যাসিনো" },
    faqs: [
      {
        q: { en: "What casino games are available?", bn: "কোন কোন ক্যাসিনো গেম আছে?" },
        a: {
          en: "Live casino, slots, table games and more from top providers. Browse the Casino and Slots sections to explore all titles.",
          bn: "সেরা প্রোভাইডারদের লাইভ ক্যাসিনো, স্লট, টেবিল গেম আরও অনেক কিছু। সব গেম দেখতে ক্যাসিনো ও স্লট অংশ ঘুরে দেখুন।",
        },
      },
      {
        q: { en: "Are the games fair?", bn: "গেমগুলো কি ন্যায্য?" },
        a: {
          en: "All games run on licensed providers using certified random number generators, so every result is independent and fair.",
          bn: "সব গেম লাইসেন্সপ্রাপ্ত প্রোভাইডারে সার্টিফায়েড র‍্যান্ডম নম্বর জেনারেটরে চলে, তাই প্রতিটি ফলই স্বাধীন ও ন্যায্য।",
        },
      },
    ],
  },
];

export const FOOTER_QUICK = [
  { en: "Account", bn: "অ্যাকাউন্ট", to: "/topic/account" },
  { en: "Payment", bn: "পেমেন্ট", to: "/topic/payment" },
  { en: "VIP Tips", bn: "ভিআইপি টিপস", to: "/topic/tips" },
  { en: "Casino", bn: "ক্যাসিনো", to: "/topic/casino" },
  { en: "Sports", bn: "স্পোর্টস", to: "/topic/sports" },
  { en: "Promotions", bn: "প্রমোশন", to: "/topic/promotions" },
];

export const FOOTER_INFO = [
  { en: "Terms & Conditions", bn: "শর্তাবলী", to: "/terms" },
  { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি", to: "/privacy" },
  { en: "Responsible Gaming", bn: "দায়িত্বশীল গেমিং", to: "/terms" },
  { en: "KYC", bn: "কেওয়াইসি", to: "/topic/account" },
];
