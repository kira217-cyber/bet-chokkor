import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ক্লায়েন্ট সাইটের পরিচয় — সবসময় একটাই ডকুমেন্ট।
 *
 * siteName ব্রাউজার টাইটেলে বসে, logo হেডারে, favicon ট্যাব আইকনে,
 * brandLogo ফুটারে। সব অ্যাডমিন থেকে বদলানো যায়।
 */
const siteIdentifySchema = new Schema(
  {
    siteName: { type: String, default: "BET CHOKKOR", trim: true },
    logo: { type: String, default: "", trim: true },
    brandLogo: { type: String, default: "", trim: true },
    favicon: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

siteIdentifySchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const SiteIdentify =
  mongoose.models.SiteIdentify ||
  mongoose.model("SiteIdentify", siteIdentifySchema);

export default SiteIdentify;
