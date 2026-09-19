import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * অ্যাফিলিয়েট সাইটের পরিচয় — সবসময় একটাই ডকুমেন্ট।
 */
const affSiteIdentifySchema = new Schema(
  {
    siteName: { type: String, default: "BET CHOKKOR Affiliates", trim: true },
    logo: { type: String, default: "", trim: true },
    brandLogo: { type: String, default: "", trim: true },
    favicon: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

affSiteIdentifySchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const AffSiteIdentify =
  mongoose.models.AffSiteIdentify ||
  mongoose.model("AffSiteIdentify", affSiteIdentifySchema);

export default AffSiteIdentify;
