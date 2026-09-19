import mongoose from "mongoose";

const { Schema } = mongoose;

const LangTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

/**
 * VIP সিস্টেমের সেটিং — সবসময় একটাই ডকুমেন্ট।
 *
 * বন্ধ থাকলে ক্লায়েন্টে VIP অংশ দেখায় না ও পয়েন্ট জমে না। আর্নিং রেট,
 * পয়েন্ট→ক্যাশ রূপান্তরের হার, সব অ্যাডমিন থেকে বদলানো যায়।
 */
const vipSettingSchema = new Schema(
  {
    active: { type: Boolean, default: true },

    /** প্রতি ১ টাকা টার্নওভারে কত XP (লেভেল ওঠায়) */
    xpPerTurnover: { type: Number, default: 1, min: 0 },

    /** প্রতি ১ টাকা টার্নওভারে কত VIP পয়েন্ট (রিবেটে খরচ হয়) */
    pointPerTurnover: { type: Number, default: 0.1, min: 0 },

    /** কত পয়েন্ট = ১ টাকা (কনভার্টের সময়) */
    convertRatio: { type: Number, default: 400, min: 1 },

    /** রূপান্তর করতে ন্যূনতম কত পয়েন্ট লাগে */
    minConvertPoints: { type: Number, default: 4000, min: 0 },

    /** রূপান্তরিত ক্যাশে টার্নওভার শর্ত (0 = কোনো শর্ত নেই) */
    convertTurnoverMultiplier: { type: Number, default: 0, min: 0 },

    /** vip-detail (VIP ক্লাব) পেজের হিরো লেখা ও ব্যানার */
    title: { type: LangTextSchema, default: () => ({}) },
    subtitle: { type: LangTextSchema, default: () => ({}) },
    description: { type: LangTextSchema, default: () => ({}) },
    bannerDesktop: { type: String, default: "", trim: true },
    bannerMobile: { type: String, default: "", trim: true },

    /** প্রতি টিয়ারের বেনিফিট কার্ড (সব টিয়ারে একই তালিকা দেখায়) */
    benefits: {
      type: [
        new Schema(
          {
            icon: { type: String, default: "", trim: true },
            title: { type: LangTextSchema, default: () => ({}) },
            desc: { type: LangTextSchema, default: () => ({}) },
          },
          { _id: false },
        ),
      ],
      default: () => [],
    },

    /** পয়েন্ট অর্জনের টেবিল (প্রোডাক্ট → টার্নওভার → VP) */
    earnRates: {
      type: [
        new Schema(
          {
            icon: { type: String, default: "", trim: true },
            name: { type: LangTextSchema, default: () => ({}) },
            turnover: { type: Number, default: 1 },
            vp: { type: Number, default: 1 },
          },
          { _id: false },
        ),
      ],
      default: () => [],
    },

    tips: { type: LangTextSchema, default: () => ({}) },
    didYouKnow: { type: LangTextSchema, default: () => ({}) },
  },
  { timestamps: true },
);

/* ── vip-detail পেজের ডিফল্ট কনটেন্ট (মূল সাইট থেকে) ── */
const DEFAULT_BENEFITS = [
  { icon: "/vip/benefit-1.png", title: { bn: "ভিআইপি পয়েন্ট থেকে ক্যাশ", en: "VIP Points to Cash" }, desc: { bn: "VP পয়েন্ট সরাসরি ক্যাশে রূপান্তর", en: "Convert VP points directly to cash" } },
  { icon: "/vip/benefit-2.png", title: { bn: "ভিআইপি লেভেল-আপ রিওয়ার্ড", en: "VIP Level-up Reward" }, desc: { bn: "এক্সক্লুসিভ টিয়ার-আপ রিওয়ার্ড", en: "Exclusive tier-up reward" } },
  { icon: "/vip/benefit-3.png", title: { bn: "ভিআইপি পেমেন্ট চ্যানেল", en: "VIP Payment Channel" }, desc: { bn: "অগ্রাধিকার ভিত্তিক উইথড্র সুবিধা", en: "Priority withdrawal channel" } },
  { icon: "/vip/benefit-4.png", title: { bn: "২৪/৭ ভিআইপি সাপোর্ট", en: "24/7 VIP Support" }, desc: { bn: "যেকোনো সময় ডেডিকেটেড ভিআইপি সাপোর্ট", en: "Dedicated VIP support anytime" } },
  { icon: "/vip/benefit-5.png", title: { bn: "ভিআইপি জন্মদিনের বোনাস", en: "VIP Birthday Bonus" }, desc: { bn: "জন্মদিনের-এক্সক্লুসিভ বোনাস", en: "Birthday-exclusive bonus" } },
  { icon: "/vip/benefit-6.png", title: { bn: "ভিআইপি লয়ালটি বোনাস", en: "VIP Loyalty Bonus" }, desc: { bn: "রেগুলার লয়ালটি রিওয়ার্ড", en: "Regular loyalty reward" } },
  { icon: "/vip/benefit-7.png", title: { bn: "ভিআইপি এক্সক্লুসিভ বোনাস", en: "VIP Exclusive Bonus" }, desc: { bn: "শুধুমাত্র সদস্যদের জন্য প্রমোশন", en: "Members-only promotions" } },
  { icon: "/vip/benefit-8.png", title: { bn: "ভিআইপি এক্সক্লুসিভ রিওয়ার্ড", en: "VIP Exclusive Reward" }, desc: { bn: "বিশেষভাবে সাজানো রিওয়ার্ড", en: "Specially curated rewards" } },
];

const DEFAULT_EARN = [
  { icon: "/vip/prod-slot.png", name: { bn: "স্লট", en: "Slots" }, turnover: 1, vp: 1.4 },
  { icon: "/vip/prod-fishing.png", name: { bn: "ফিশিং", en: "Fishing" }, turnover: 1, vp: 1.4 },
  { icon: "/vip/prod-crash.png", name: { bn: "ক্রাশ", en: "Crash" }, turnover: 1, vp: 1.4 },
  { icon: "/vip/prod-lottery.png", name: { bn: "লটারি", en: "Lottery" }, turnover: 1, vp: 1.1 },
  { icon: "/vip/prod-table.png", name: { bn: "টেবিল গেম", en: "Table Games" }, turnover: 1, vp: 0.9 },
  { icon: "/vip/prod-livecasino.png", name: { bn: "লাইভ ক্যাসিনো", en: "Live Casino" }, turnover: 1, vp: 0.5 },
  { icon: "/vip/prod-p2p.png", name: { bn: "P2P", en: "P2P" }, turnover: 1, vp: 0.4 },
  { icon: "/vip/prod-arcade.png", name: { bn: "আর্কেড", en: "Arcade" }, turnover: 1, vp: 0.4 },
];

const DEFAULT_CONTENT = {
  title: { bn: "BetChokkor ভিআইপি ক্লাব", en: "BetChokkor VIP Club" },
  subtitle: { bn: "যেখানে আভিজাত্য আর অনন্যতার মেলবন্ধন", en: "Where prestige meets exclusivity" },
  description: {
    bn: "BetChokkor ভিআইপি ক্লাবে জয়েন করুন—যেখানে প্রতিটি মুহূর্ত সাজানো হয়েছে কেবল অভিজাতদের জন্য। উপভোগ করুন অগ্রাধিকার ভিত্তিক পেমেন্ট ব্যবস্থা, দিনরাত ২৪ ঘণ্টা পার্সোনাল ভিআইপি সহায়তা, আর এক্সক্লুসিভ প্রাইজ যা প্রতিটি গেমকে এক রাজকীয় এক্সপেরিয়েন্সে রূপান্তর করে।",
    en: "Join the BetChokkor VIP Club—where every moment is crafted for the elite. Enjoy priority payments, 24/7 personal VIP support and exclusive prizes that turn every game into a royal experience.",
  },
  tips: {
    bn: "হায়ার ভিআইপি টিয়ারে আনলক করুন আরও উন্নত কনভার্সন রেট।\nভিআইপি পয়েন্ট অর্জন করুন, সেগুলো ক্যাশে রূপান্তর করুন এবং খেলা চালিয়ে যান!\nআপনার ভিআইপি পয়েন্ট রিডিম করুন এখানে: প্রোফাইল → মাই ভিআইপি → ভিআইপি ইনস্ট্যান্ট রিবেট",
    en: "Unlock better conversion rates at higher VIP tiers.\nEarn VIP points, convert them to cash and keep playing!\nRedeem your VIP points here: Profile → My VIP → VIP Instant Rebate",
  },
  didYouKnow: {
    bn: "ভিআইপি পয়েন্টের মেয়াদ কখনোই শেষ হয় না। নিজের ইচ্ছেমতো খেলুন, পয়েন্ট অর্জন করুন এবং ক্যাশে কনভার্ট করুন—আপনি যত বেশি খেলবেন, ভিআইপি টিয়ারে তত দ্রুত উপরে উঠবেন।",
    en: "VIP points never expire. Play at your own pace, earn points and convert to cash—the more you play, the faster you climb the VIP tiers.",
  },
};

vipSettingSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });

  if (existing) {
    // পুরোনো ডকুমেন্টে কনটেন্ট না থাকলে একবার ডিফল্ট বসিয়ে দেওয়া
    let touched = false;
    if (!existing.benefits || existing.benefits.length === 0) {
      existing.benefits = DEFAULT_BENEFITS;
      touched = true;
    }
    if (!existing.earnRates || existing.earnRates.length === 0) {
      existing.earnRates = DEFAULT_EARN;
      touched = true;
    }
    if (!existing.title?.en) {
      existing.title = DEFAULT_CONTENT.title;
      existing.subtitle = DEFAULT_CONTENT.subtitle;
      existing.description = DEFAULT_CONTENT.description;
      existing.tips = DEFAULT_CONTENT.tips;
      existing.didYouKnow = DEFAULT_CONTENT.didYouKnow;
      touched = true;
    }
    if (touched) await existing.save();
    return existing;
  }

  return this.create({ ...DEFAULT_CONTENT, benefits: DEFAULT_BENEFITS, earnRates: DEFAULT_EARN });
};

vipSettingSchema.methods.toClientJSON = function toClientJSON() {
  return {
    active: this.active,
    convertRatio: this.convertRatio,
    minConvertPoints: this.minConvertPoints,
    convertTurnoverMultiplier: this.convertTurnoverMultiplier,
    title: this.title,
    subtitle: this.subtitle,
    description: this.description,
    bannerDesktop: this.bannerDesktop,
    bannerMobile: this.bannerMobile,
    benefits: this.benefits,
    earnRates: this.earnRates,
    tips: this.tips,
    didYouKnow: this.didYouKnow,
  };
};

const VipSetting =
  mongoose.models.VipSetting || mongoose.model("VipSetting", vipSettingSchema);

export default VipSetting;
