import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * এক-একটা সেকশনের কালার — যেমন "client:navbar", "client:sidebar",
 * "affiliate:navbar"। প্রতি scope এ একটাই ডকুমেন্ট।
 *
 * colors = টোকেন→হেক্স ম্যাপ (key = namespaced CSS ভ্যারিয়েবল নাম,
 * "--" ছাড়া; যেমন "nav-header-bg")। কম্পোনেন্ট এগুলো
 * var(--nav-header-bg, <বেস ফলব্যাক>) হিসেবে ব্যবহার করে, তাই সেট না
 * করলে global theme/বেস follow করে।
 */
const sectionThemeSchema = new Schema(
  {
    scope: { type: String, required: true, unique: true, index: true },
    colors: { type: Map, of: String, default: () => ({}) },
  },
  { timestamps: true },
);

sectionThemeSchema.statics.forScope = async function forScope(scope) {
  const existing = await this.findOne({ scope });
  return existing || this.create({ scope });
};

const SectionTheme =
  mongoose.models.SectionTheme ||
  mongoose.model("SectionTheme", sectionThemeSchema);

export default SectionTheme;
