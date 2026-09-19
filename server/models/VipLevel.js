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
 * VIP ল্যাডারের একটা লেভেল — Normal → Elite I → Elite II …
 *
 * `xpRequired` = এই লেভেলে পৌঁছাতে যত XP লাগে (ক্রমবর্ধমান)। খেলোয়াড়ের
 * মোট XP এই সংখ্যা ছাড়ালে সে এই লেভেলে ওঠে। সব কিছু অ্যাডমিন থেকে
 * সম্পাদনযোগ্য — কয়টা লেভেল, নাম, XP শর্ত, আইকন, রঙ, বোনাস, রিবেট।
 */
const vipLevelSchema = new Schema(
  {
    lv: { type: Number, required: true, unique: true, min: 1, index: true },

    name: { type: LangTextSchema, default: () => ({}) },

    xpRequired: { type: Number, default: 0, min: 0 },

    icon: { type: String, default: "", trim: true },
    /** টিয়ার ব্যাজ ছবি (৩ডি ট্রফি) — vip-detail পেজে */
    badge: { type: String, default: "", trim: true },
    color: { type: String, default: "#f9b901", trim: true },

    /** এই টিয়ারে কত VP = ১ টাকা (কম মানে ভালো রেট) */
    convertRatio: { type: Number, default: 400, min: 1 },
    /** শুধু ইনভাইটেশনে পাওয়া যায় (যেমন Grandmaster) */
    inviteOnly: { type: Boolean, default: false },

    /** এই টিয়ারে তালিকার প্রথম কয়টা বেনিফিট আনলকড (বাকিগুলো ধূসর) */
    benefitCount: { type: Number, default: 8, min: 0 },

    /** এই লেভেলে ওঠার সময় একবার দেওয়া ক্যাশ বোনাস */
    upgradeBonus: { type: Number, default: 0, min: 0 },

    /** মাসিক ক্যাশ বোনাস (ঐচ্ছিক — অ্যাডমিন হাতে/ভবিষ্যতে অটো দিতে পারে) */
    monthlyBonus: { type: Number, default: 0, min: 0 },

    /** রিবেট শতাংশ — এই লেভেলের জন্য দেখানোর মতো সুবিধা */
    rebatePercent: { type: Number, default: 0, min: 0 },

    /** ল্যাডার পেজে দেখানোর সুবিধার তালিকা (বাং/ইং) */
    perks: { type: [LangTextSchema], default: () => [] },

    order: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const VipLevel =
  mongoose.models.VipLevel || mongoose.model("VipLevel", vipLevelSchema);

export default VipLevel;
