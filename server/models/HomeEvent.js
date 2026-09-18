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
 * হোম পেজের ইভেন্ট ব্যানার (স্লাইড করে)।
 *
 * শুধু ছবি হতে পারে; চাইলে ক্লিকে একটা লিংকে যেতে পারে, অথবা একটা
 * প্রমোশন মডাল খুলতে পারে (ছবি + বাংলা/ইংরেজি বিবরণসহ)।
 *
 * actionType:
 *   none    → শুধু ছবি, ক্লিকে কিছু হয় না
 *   link    → linkUrl এ যায়
 *   modal   → modal অংশ দিয়ে একটা পপআপ খোলে
 */
const homeEventSchema = new Schema(
  {
    image: { type: String, default: "", trim: true },

    actionType: {
      type: String,
      enum: ["none", "link", "modal"],
      default: "none",
    },

    linkUrl: { type: String, default: "", trim: true },

    // actionType === "modal" হলে যে পপআপ দেখাবে
    modal: {
      title: { type: LangTextSchema, default: () => ({}) },
      description: { type: LangTextSchema, default: () => ({}) },
      image: { type: String, default: "", trim: true },
    },

    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true },
);

homeEventSchema.index({ isActive: 1, order: 1 });

const HomeEvent =
  mongoose.models.HomeEvent || mongoose.model("HomeEvent", homeEventSchema);

export default HomeEvent;
