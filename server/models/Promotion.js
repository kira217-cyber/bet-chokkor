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
 * প্রমোশন — /promotion পাতার কার্ড ও বিস্তারিত মডাল (মূল সাইটের মতো)।
 *
 * প্রতিটা প্রমোশনে ছবি, বাংলা+ইংরেজি শিরোনাম ও বিবরণ থাকে; ঐচ্ছিক
 * ক্যাটাগরি (যেমন Sports, Casino) দিয়ে ট্যাব করা যায়।
 */
const promotionSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },

    title: { type: LangTextSchema, default: () => ({}) },
    description: { type: LangTextSchema, default: () => ({}) },

    // মূল সাইটের কার্ডের ছোট ব্যাজ (যেমন "FDB") ও ক্যাটাগরি
    tag: { type: String, default: "", trim: true },
    category: { type: String, default: "welcome-offer", trim: true, lowercase: true },

    // কবে থেকে কবে — কার্ডে তারিখ রেঞ্জ দেখায়
    startAt: { type: Date, default: null },
    endAt: { type: Date, default: null },

    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true },
);

promotionSchema.index({ isActive: 1, order: 1 });

const Promotion =
  mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);

export default Promotion;
