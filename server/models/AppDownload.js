import mongoose from "mongoose";

/**
 * অ্যাপ ডাউনলোড — কোন APK দেওয়া হবে, না থাকলে কী বার্তা।
 *
 * একটাই ডকুমেন্ট থাকে। APK না থাকলে ক্লায়েন্টে বোতামের বদলে `note`
 * এর লেখাটা দেখানো হয় — "শীঘ্রই আসছে" জাতীয় কিছু।
 *
 * `originalName` আলাদা করে রাখা হয়, কারণ ডিস্কে ফাইলটা নিরাপদ নামে
 * বসে (../ ঠেকাতে), কিন্তু ব্যবহারকারী যে নামে আপলোড হয়েছে সেই নামেই
 * ডাউনলোড করতে চান।
 */
/* দ্বিভাষিক লেখার ছোট হেল্পার — খালি হলে ক্লায়েন্টে স্ট্যাটিক fallback */
const lang = () => ({
  bn: { type: String, default: "", trim: true },
  en: { type: String, default: "", trim: true },
});

/**
 * অ্যাপ-ডাউনলোড পেজের মার্কেটিং কনটেন্ট (APK ফাইল থেকে আলাদা)।
 *
 * প্রতিটা লেখা bn/en; খালি রাখলে ক্লায়েন্ট আগের স্ট্যাটিক লেখা/ছবি
 * দেখায় — তাই অ্যাডমিন সেট না করলেও পেজ কখনো ভাঙে না। রঙ আলাদা
 * ভাবে section-theme (client:app-download) থেকে নিয়ন্ত্রিত হয়।
 */
const contentSchema = new mongoose.Schema(
  {
    hero: {
      title: lang(),
      lead: lang(),
      text: lang(),
      helpNote: lang(),
      logo: { type: String, default: "", trim: true },
      bgImage: { type: String, default: "", trim: true },
      mainImage: { type: String, default: "", trim: true },
    },
    experience: {
      eyebrow: lang(),
      title: lang(),
      sub: lang(),
      cards: [
        {
          title: lang(),
          text: lang(),
          image: { type: String, default: "", trim: true },
        },
      ],
    },
    features: {
      eyebrow: lang(),
      title: lang(),
      sub: lang(),
      image: { type: String, default: "", trim: true },
      items: [
        {
          label: lang(),
          icon: { type: String, default: "", trim: true },
        },
      ],
    },
  },
  { _id: false },
);

const appDownloadSchema = new mongoose.Schema(
  {
    fileName: { type: String, default: "", trim: true }, // ডিস্কের নিরাপদ নাম
    originalName: { type: String, default: "", trim: true }, // যে নামে নামবে
    size: { type: Number, default: 0 },
    version: { type: String, default: "", trim: true },

    note: {
      bn: {
        type: String,
        default: "অ্যাপটি শীঘ্রই আসছে। একটু পরে আবার দেখুন।",
        trim: true,
      },
      en: {
        type: String,
        default: "The app is coming soon. Please check back later.",
        trim: true,
      },
    },

    content: { type: contentSchema, default: () => ({}) },
  },
  { timestamps: true },
);

appDownloadSchema.statics.current = async function current() {
  return (await this.findOne().sort({ createdAt: 1 })) || this.create({});
};

const AppDownload =
  mongoose.models.AppDownload || mongoose.model("AppDownload", appDownloadSchema);

export default AppDownload;
