import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * ক্লায়েন্ট সাইটের থিম কালার — সবসময় একটাই ডকুমেন্ট।
 *
 * `colors` হলো টোকেন→হেক্স ম্যাপ (key = CSS ভ্যারিয়েবলের নাম, "--" ছাড়া;
 * যেমন "primary500", "neutral900", "status-success")। শুধু অ্যাডমিন যা
 * বদলায় তাই এখানে থাকে; বাকিগুলো index.css এর ডিফল্টই থাকে। সেমান্টিক
 * ভ্যারিয়েবল (header-bg, text-* ইত্যাদি) এই raw টোকেনগুলোকে follow করে,
 * তাই palette বদলালেই পুরো সাইট থিম হয়।
 */
const clientThemeSchema = new Schema(
  {
    active: { type: Boolean, default: true },
    colors: { type: Map, of: String, default: () => ({}) },
  },
  { timestamps: true },
);

clientThemeSchema.statics.current = async function current() {
  const existing = await this.findOne().sort({ createdAt: 1 });
  return existing || this.create({});
};

const ClientTheme =
  mongoose.models.ClientTheme ||
  mongoose.model("ClientTheme", clientThemeSchema);

export default ClientTheme;
