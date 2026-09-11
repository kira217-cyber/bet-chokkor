/**
 * ক্লায়েন্ট সাইটের স্ট্যাটিক সাইট-ডেটা।
 *
 * সার্ভার তৈরি হওয়ার পর globalSlice এর thunk এই ফাইলের বদলে
 * `/api/global/client/site-data` থেকে হুবহু এই শেপের ডেটা আনবে।
 */

export const siteIdentify = {
  siteName: "BET CHOKKOR",
  logo: "/assets/brand/header-logo.png",
  brandLogo: "/assets/brand/logo.png",
  favicon: "/assets/icons/pwa/PWAicon-192px.png",
  tagline: { bn: "উইন লাইক এ কিং", en: "Win Like A King" },
};

export const notice = {
  text: {
    bn: "BET CHOKKOR এ স্বাগতম — সকল গেমে ১০০% পর্যন্ত ওয়েলকাম বোনাস। ২৪/৭ লাইভ চ্যাট সাপোর্ট এবং সবচেয়ে দ্রুত ডিপোজিট ও উইথড্র সুবিধা উপভোগ করুন।",
    en: "Welcome to BET CHOKKOR — up to 100% welcome bonus on all games. Enjoy 24/7 live chat support with the fastest deposits and withdrawals.",
  },
};

export const sliders = [
  {
    id: 1,
    title: { bn: "৳২০,০০০ স্লট & ফিশিং বোনাস", en: "৳20,000 Slot & Fishing Bonus" },
    desktopImage: "/assets/banners/desktop/bonus-slot-fishing.jpg",
    mobileImage: "/assets/banners/mobile/bonus-slot-fishing.jpg",
    link: "/promotion",
  },
  {
    id: 2,
    title: { bn: "১০০% স্পোর্টস বোনাস", en: "100% Sports Bonus" },
    desktopImage: "/assets/banners/desktop/bonus-sports.jpg",
    mobileImage: "/assets/banners/mobile/bonus-sports.jpg",
    link: "/promotion",
  },
  {
    id: 3,
    title: { bn: "সকল গেমে ১০০% বোনাস", en: "100% Bonus On All Games" },
    desktopImage: "/assets/banners/desktop/bonus-all-games.jpg",
    mobileImage: "/assets/banners/mobile/bonus-all-games.jpg",
    link: "/promotion",
  },
  {
    id: 4,
    title: { bn: "অ্যাফিলিয়েট", en: "Affiliate" },
    desktopImage: "/assets/banners/desktop/affiliate.jpg",
    mobileImage: "/assets/banners/mobile/affiliate.jpg",
    link: "/affiliate",
  },
];

export const bottomNavItems = [
  { key: "menu", name: { bn: "মেনু", en: "Menu" }, icon: "/assets/icons/menu/chrome/icon-menu.png", path: "/menu" },
  { key: "casino", name: { bn: "ক্যাসিনো", en: "Casino" }, icon: "/assets/icons/menu/chrome/icon-casino.png", path: "/games/casino" },
  { key: "slot", name: { bn: "স্লট", en: "Slot" }, icon: "/assets/icons/menu/chrome/icon-slot.png", path: "/games/slot" },
  { key: "promotion", name: { bn: "প্রমোশন", en: "Promotion" }, icon: "/assets/icons/menu/chrome/icon-promotion.png", path: "/promotion" },
];

// সাইডবারে দুটো আলাদা গ্রুপ — মাঝে বিভাজক রেখা (মূল সাইটের মতো)
export const sideNavLinks = [
  { key: "vip", group: "main", name: { bn: "ভিআইপি ক্লাব", en: "VIP Club" }, icon: "/assets/icons/utility/icon-crown.svg", path: "/vip" },
  { key: "referral", group: "main", name: { bn: "রেফারেল প্রোগ্রাম", en: "Referral Program" }, icon: "/assets/icons/utility/icon-group.svg", path: "/referral" },
  { key: "affiliate", group: "main", name: { bn: "অ্যাফিলিয়েট", en: "Affiliate" }, icon: "/assets/icons/utility/icon-affiliate.svg", path: "/affiliate", external: true },
  { key: "download", group: "main", name: { bn: "অ্যাপ ডাউনলোড", en: "App Download" }, icon: "/assets/icons/utility/icon-download.svg", path: "/download" },
  { key: "contact", group: "support", name: { bn: "যোগাযোগ করুন", en: "Contact Us" }, icon: "/assets/icons/utility/icon-phone.svg", path: "/contact" },
  { key: "help", group: "support", name: { bn: "হেল্প পেজ", en: "Help Page" }, icon: "/assets/icons/utility/icon-open-book.svg", path: "/help", external: true },
];

export const footerSetting = {
  collapses: [
    {
      key: "gaming",
      title: { bn: "গেমিং", en: "Gaming" },
      items: [
        { name: { bn: "ক্যাসিনো", en: "Casino" }, path: "/games/casino" },
        { name: { bn: "স্লট", en: "Slot" }, path: "/games/slot" },
        { name: { bn: "টেবিল", en: "Table" }, path: "/games/table" },
        { name: { bn: "ফিসিং", en: "Fishing" }, path: "/games/fishing" },
        { name: { bn: "ক্রাশ", en: "Crash" }, path: "/games/crash" },
        { name: { bn: "আর্কেড", en: "Arcade" }, path: "/games/arcade" },
        { name: { bn: "লটারী", en: "Lottery" }, path: "/games/lottery" },
      ],
    },
    {
      key: "features",
      title: { bn: "ফিচারসমূহ", en: "Features" },
      items: [
        { name: { bn: "প্রমোশন", en: "Promotion" }, path: "/promotion" },
        { name: { bn: "সুপারিশ", en: "Referral" }, path: "/referral" },
        { name: { bn: "অ্যাপ ডাউনলোড", en: "App Download" }, path: "/download" },
      ],
    },
    {
      key: "help",
      title: { bn: "হেল্প", en: "Help" },
      items: [{ name: { bn: "হেল্প পেজ", en: "Help Page" }, path: "/help" }],
    },
  ],

  gamingLicense: {
    title: { bn: "গেইমিংয়ের লাইসেন্স", en: "Gaming License" },
    items: [
      { key: "curacao", image: "/assets/footer/gaming_license.png", alt: "Gaming Curacao" },
      { key: "anjouan", image: "/assets/footer/anjouan_license.png", alt: "Anjouan eGaming" },
      { key: "montenegro", image: "/assets/footer/montenegro_license.png", alt: "Montenegro" },
    ],
  },

  responsibleGaming: {
    title: { bn: "দায়িত্বশীল গেম্বলিং", en: "Responsible Gaming" },
    items: [
      { key: "regulations", image: "/assets/icons/trivial/regulations.svg", alt: "Regulations" },
      { key: "gamcare", image: "/assets/icons/trivial/gamcare.svg", alt: "GamCare" },
      { key: "age-limit", image: "/assets/icons/trivial/age-limit.svg", alt: "18+" },
    ],
  },

  brand: {
    logo: "/assets/brand/logo.png",
    subtitle: { bn: "উইন লাইক এ কিং", en: "Win Like A King" },
    copyright: {
      bn: "© 2026 BetChokkor কপিরাইট। সমস্ত অধিকার সংরক্ষিত",
      en: "© 2026 BetChokkor Copyright. All rights reserved",
    },
  },

  license: {
    bn: "BetChokkor.com BetChokkor হোল্ডিংস লিমিটেডের মালিকানাধীন এবং এর আওতায় পরিচালিত। রেজিস্ট্রেশন নম্বর: ১৫৮৩৯, নিবন্ধিত ঠিকানা: হামছাকো, মুতসামুদু, আনজোয়ানের স্বায়ত্তশাসিত দ্বীপ, কমোরোস ইউনিয়ন। আমাদের সাথে যোগাযোগের ঠিকানা legal@northernlightsltd.com। BetChokkor.com কমোরোস ইউনিয়নের আনজুয়ান স্বায়ত্তশাসিত দ্বীপ সরকার দ্বারা লাইসেন্সপ্রাপ্ত এবং নিয়ন্ত্রিত এবং লাইসেন্স নং ALSI-202410030-FI1 এর অধীনে কাজ করে। BetChokkor.com সমস্ত আইনগত অনুমোদন ও শর্ত পূর্ণ করেছে এবং যেকোনো ধরণের গেম অফ চান্স এবং বেট পরিচালনার জন্য বৈধভাবে অনুমোদিত।",
    en: "BetChokkor.com is owned and operated by BetChokkor Holdings Limited, registration number 15839, registered address Hamchako, Mutsamudu, Autonomous Island of Anjouan, Union of Comoros. Contact us at legal@northernlightsltd.com. BetChokkor.com is licensed and regulated by the Government of the Autonomous Island of Anjouan, Union of Comoros, and operates under License No. ALSI-202410030-FI1.",
  },
};

export const socialLinks = [
  { key: "livechat", name: { bn: "লাইভ চ্যাট", en: "Live Chat" }, icon: "/assets/icons/utility/icon-livechat.svg", link: "#" },
  { key: "phone", name: { bn: "কল সেন্টার", en: "Call Center" }, icon: "/assets/icons/utility/icon-phone.svg", link: "#" },
];

export const siteData = {
  siteIdentify,
  notice,
  sliders,
  bottomNavItems,
  sideNavLinks,
  footerSetting,
  socialLinks,
};

export default siteData;
