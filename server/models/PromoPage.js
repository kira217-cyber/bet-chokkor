import mongoose from "mongoose";

/**
 * প্রমোশন পেজের হেডিং/সাবহেডিং — সবসময় একটাই ডকুমেন্ট।
 *
 * প্রমোশন কার্ডগুলো আলাদাভাবে Promotion মডেল থেকে আসে; এই ডকুমেন্টে
 * শুধু পেজের উপরের লেখা। খালি হলে ক্লায়েন্ট স্ট্যাটিক লেখা দেখায়।
 */
const langText = () => ({
  bn: { type: String, default: "", trim: true },
  en: { type: String, default: "", trim: true },
});

const promoPageSchema = new mongoose.Schema(
  {
    heading: langText(),
    subheading: langText(),
  },
  { timestamps: true },
);

promoPageSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  if (existing) return existing;
  // প্রথমবার মূল সাইটের হেডিং বসিয়ে দেওয়া
  return this.create({ heading: { bn: "প্রমোশন", en: "Promotion" } });
};

const PromoPage =
  mongoose.models.PromoPage || mongoose.model("PromoPage", promoPageSchema);

export default PromoPage;
