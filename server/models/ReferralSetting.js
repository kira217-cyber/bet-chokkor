import mongoose from "mongoose";

/**
 * রেফারেল প্রোগ্রামের নিয়ম — সবটাই অ্যাডমিন থেকে।
 *
 * মূল সাইটের নিয়ম দুই ভাগে:
 *
 * ১. **কমিশন** — বন্ধু যত খেলবেন, রেফারকারী তার একটা শতাংশ পাবেন।
 *    শতাংশটা নির্ভর করে বন্ধুর মোট টার্নওভার কোন ধাপে পড়ে তার উপর, আর
 *    কত দূরের সম্পর্ক (tier ১ = সরাসরি বন্ধু, ২ = বন্ধুর বন্ধু, ৩ =
 *    তারও পরের) তার উপর।
 *
 * ২. **মাইলফলক বোনাস** — এক মাসে কতজনকে আনলেন তার উপর থোক টাকা।
 *
 * একটাই ডকুমেন্ট থাকে।
 */

const tierSchema = new mongoose.Schema(
  {
    tier: { type: Number, required: true, min: 1, max: 5 },
    /** শতাংশে — ০.১ মানে ০.১% */
    percent: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false },
);

const bandSchema = new mongoose.Schema(
  {
    /**
     * এই ধাপে পড়তে বন্ধুর যা যা লাগবে।
     *
     * সবচেয়ে বেশি টার্নওভারের যে ধাপে সে পৌঁছেছে, সেই ধাপের শতাংশই
     * প্রযোজ্য — তাই ধাপগুলো ছোট থেকে বড় সাজানো থাকে।
     */
    requireTurnover: { type: Number, default: 0, min: 0 },
    requireDeposit: { type: Number, default: 0, min: 0 },
    requireWinLoss: { type: Number, default: 0 },

    tiers: { type: [tierSchema], default: [] },
  },
  { _id: false },
);

const milestoneSchema = new mongoose.Schema(
  {
    /** কতজন বন্ধু আনলে */
    count: { type: Number, required: true, min: 1 },
    /** কত টাকা */
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const referralSettingSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: false },

    /**
     * টাকাটা নিজে থেকেই ব্যালেন্সে যাবে, নাকি ব্যবহারকারী "claim"
     * চাপবেন। মূল সাইটে claim করতে হয়।
     */
    isAutoClaim: { type: Boolean, default: false },

    /** কাকে "সক্রিয় ডাউনলাইন" ধরা হবে */
    activeDownline: {
      depositRequirement: { type: Number, default: 0, min: 0 },
      turnoverRequirement: { type: Number, default: 0, min: 0 },
    },

    /** কত দূর পর্যন্ত সম্পর্ক গোনা হবে */
    maxTier: { type: Number, default: 3, min: 1, max: 5 },

    commissionBands: { type: [bandSchema], default: [] },

    achievement: {
      period: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "monthly",
      },
      milestones: { type: [milestoneSchema], default: [] },
    },

    /** ব্যবহারকারীকে দেখানোর নিয়মাবলী */
    rules: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true },
);

/**
 * সব সময় একটাই ডকুমেন্ট।
 *
 * প্রথমবার মূল সাইটের নিয়মগুলোই বসানো থাকে, যাতে অ্যাডমিন শূন্য থেকে
 * শুরু না করে চালু করলেই কাজ করে।
 */
referralSettingSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });

  if (existing) return existing;

  return this.create({
    commissionBands: [
      {
        requireTurnover: 100,
        tiers: [
          { tier: 1, percent: 0.1 },
          { tier: 2, percent: 0.05 },
          { tier: 3, percent: 0.01 },
        ],
      },
      {
        requireTurnover: 10000,
        tiers: [
          { tier: 1, percent: 0.15 },
          { tier: 2, percent: 0.06 },
          { tier: 3, percent: 0.02 },
        ],
      },
      {
        requireTurnover: 20000,
        tiers: [
          { tier: 1, percent: 0.2 },
          { tier: 2, percent: 0.07 },
          { tier: 3, percent: 0.03 },
        ],
      },
    ],
    achievement: {
      period: "monthly",
      milestones: [
        { count: 5, amount: 500 },
        { count: 15, amount: 1300 },
        { count: 25, amount: 2100 },
        { count: 50, amount: 4100 },
        { count: 100, amount: 11000 },
        { count: 200, amount: 21000 },
      ],
    },
  });
};

const ReferralSetting =
  mongoose.models.ReferralSetting ||
  mongoose.model("ReferralSetting", referralSettingSchema);

export default ReferralSetting;
