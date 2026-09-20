import mongoose from "mongoose";

/**
 * অ্যাফিলিয়েট Login ও Register পেজের কনটেন্ট — সবসময় একটাই ডকুমেন্ট।
 *
 * শুধু লেখা (bn/en) ও একটা ছবি (লোগো/ব্যানার কার্ডের উপরে)। খালি হলে
 * ক্লায়েন্ট আগের স্ট্যাটিক লেখা দেখায়। রঙ আলাদাভাবে section-theme
 * (affiliate:auth-login / affiliate:auth-register) থেকে নিয়ন্ত্রিত।
 */
const lang = () => ({
  bn: { type: String, default: "", trim: true },
  en: { type: String, default: "", trim: true },
});

const pageSchema = () => ({
  title: lang(),
  subtitle: lang(),
  footerText: lang(),
  image: { type: String, default: "", trim: true },
});

const affiliateAuthSchema = new mongoose.Schema(
  {
    login: pageSchema(),
    register: pageSchema(),
    forgot: pageSchema(),
  },
  { timestamps: true },
);

affiliateAuthSchema.statics.current = async function current() {
  return (await this.findOne().sort({ createdAt: 1 })) || this.create({});
};

const AffiliateAuth =
  mongoose.models.AffiliateAuth ||
  mongoose.model("AffiliateAuth", affiliateAuthSchema);

export default AffiliateAuth;
