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
  },
  { timestamps: true },
);

appDownloadSchema.statics.current = async function current() {
  return (await this.findOne().sort({ createdAt: 1 })) || this.create({});
};

const AppDownload =
  mongoose.models.AppDownload || mongoose.model("AppDownload", appDownloadSchema);

export default AppDownload;
