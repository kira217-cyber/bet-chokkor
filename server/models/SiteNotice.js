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
 * হোম পেজের উপরে চলমান নোটিশ (মার্কি) — সবসময় একটাই ডকুমেন্ট।
 *
 * বাংলা ও ইংরেজি আলাদা; বন্ধ থাকলে নোটিশ বারটা দেখায় না।
 */
const siteNoticeSchema = new Schema(
  {
    text: { type: LangTextSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

siteNoticeSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  if (existing) return existing;
  return this.create({});
};

const SiteNotice =
  mongoose.models.SiteNotice || mongoose.model("SiteNotice", siteNoticeSchema);

export default SiteNotice;
