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
 * একটা নোটিফিকেশন (নোটিশ) — সব ব্যবহারকারীর জন্য একই।
 *
 * অ্যাডমিন বাংলা ও ইংরেজিতে শিরোনাম ও বিবরণ লেখে, চাইলে একটা ছবি
 * (ঐচ্ছিক)। "না-পড়া" আলাদা করে রাখা হয় না; ব্যবহারকারীর
 * `notificationsSeenAt` এর পরে তৈরি হওয়া সক্রিয় নোটিফিকেশনই না-পড়া।
 */
const notificationSchema = new Schema(
  {
    title: { type: LangTextSchema, default: () => ({}) },
    description: { type: LangTextSchema, default: () => ({}) },

    imageUrl: { type: String, default: "", trim: true },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

notificationSchema.index({ isActive: 1, createdAt: -1 });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
