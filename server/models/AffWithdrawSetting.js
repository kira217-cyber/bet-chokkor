import mongoose from "mongoose";

/**
 * অ্যাফিলিয়েট কখন টাকা তুলতে পারবেন তার শর্ত।
 *
 * Bajiman এ সংখ্যাটা কোডে লেখা ছিল (৫ জন), তাই বদলাতে হলে সার্ভার নতুন
 * করে ডেপ্লয় করতে হতো। এখানে অ্যাডমিন থেকেই বদলানো যায়।
 *
 * একটাই ডকুমেন্ট থাকে।
 */
const affWithdrawSettingSchema = new mongoose.Schema(
  {
    /** কতজন সক্রিয় খেলোয়াড় না আনলে তোলা যাবে না */
    requiredActiveReferrals: { type: Number, default: 5, min: 0 },

    /**
     * জমে থাকা কমিশন মেলানোর আগে তোলা যাবে কিনা।
     *
     * চালু থাকলে অ্যাডমিন Bulk Adjustment না করা পর্যন্ত আবেদন করা যায়
     * না — নইলে কমিশন দুবার দেওয়ার ঝুঁকি থাকত: একবার ব্যালেন্স থেকে
     * তুলে, আরেকবার মেলানোর সময়।
     */
    requireSettledCommission: { type: Boolean, default: true },

    /** ব্যবহারকারীকে দেখানোর কথা */
    note: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true },
);

affWithdrawSettingSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const AffWithdrawSetting =
  mongoose.models.AffWithdrawSetting ||
  mongoose.model("AffWithdrawSetting", affWithdrawSettingSchema);

export default AffWithdrawSetting;
