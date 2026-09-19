import mongoose from "mongoose";

const { Schema } = mongoose;

const Lang = new Schema(
  { bn: { type: String, default: "", trim: true }, en: { type: String, default: "", trim: true } },
  { _id: false },
);

/**
 * অ্যাফিলিয়েট ফুটারের অ্যাডমিন-নিয়ন্ত্রিত অংশ।
 */
const affFooterSettingSchema = new Schema(
  {
    logo: { type: String, default: "", trim: true },
    description: { type: Lang, default: () => ({}) },
    copyright: { type: Lang, default: () => ({}) },
    ageNotice: { type: Lang, default: () => ({}) },
  },
  { timestamps: true },
);

affFooterSettingSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const AffFooterSetting =
  mongoose.models.AffFooterSetting ||
  mongoose.model("AffFooterSetting", affFooterSettingSchema);

export default AffFooterSetting;
