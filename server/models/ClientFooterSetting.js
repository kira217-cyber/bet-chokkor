import mongoose from "mongoose";

const { Schema } = mongoose;

const Lang = new Schema(
  { bn: { type: String, default: "", trim: true }, en: { type: String, default: "", trim: true } },
  { _id: false },
);

/**
 * ক্লায়েন্ট ফুটারের অ্যাডমিন-নিয়ন্ত্রিত অংশ — ব্র্যান্ড ও আইনি লেখা।
 *
 * লিংক গ্রুপ ও লাইসেন্স আইকন কাঠামোগত, তাই স্ট্যাটিক থাকে; এখানকার
 * মানগুলো তার উপরে বসে (globalSlice এ merge)।
 */
const clientFooterSettingSchema = new Schema(
  {
    brandLogo: { type: String, default: "", trim: true },
    subtitle: { type: Lang, default: () => ({}) },
    copyright: { type: Lang, default: () => ({}) },
    license: { type: Lang, default: () => ({}) },
  },
  { timestamps: true },
);

clientFooterSettingSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const ClientFooterSetting =
  mongoose.models.ClientFooterSetting ||
  mongoose.model("ClientFooterSetting", clientFooterSettingSchema);

export default ClientFooterSetting;
