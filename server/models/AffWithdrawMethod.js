import mongoose from "mongoose";

/**
 * অ্যাফিলিয়েট কোন কোন উপায়ে টাকা তুলতে পারবেন।
 *
 * খেলোয়াড়ের উইথড্র থেকে আলাদা রাখা হয়েছে, কারণ চাহিদাটাই আলাদা:
 * খেলোয়াড় সেভ করা মোবাইল নম্বরে টাকা নেন, আর অ্যাফিলিয়েট প্রায়ই
 * ব্যাংকে — যেখানে অ্যাকাউন্টের নাম, নম্বর, শাখা, রাউটিং এরকম কয়েকটা
 * ঘর লাগে। কোন ঘরগুলো লাগবে সেটা অ্যাডমিন প্রতিটা উপায়ের জন্য আলাদা
 * করে ঠিক করেন, তাই নতুন ব্যাংক যোগ করতে কোড বদলাতে হয় না।
 */
const fieldSchema = new mongoose.Schema(
  {
    /** ফর্মের ঘরটার নাম — আবেদনে এই নামেই মান সেভ হয় */
    key: { type: String, required: true, trim: true },

    label: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    placeholder: {
      bn: { type: String, default: "", trim: true },
      en: { type: String, default: "", trim: true },
    },

    type: {
      type: String,
      enum: ["text", "number", "tel", "email"],
      default: "text",
    },

    required: { type: Boolean, default: true },
  },
  { _id: false },
);

const affWithdrawMethodSchema = new mongoose.Schema(
  {
    methodId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      bn: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },

    logoUrl: { type: String, default: "", trim: true },

    minimumWithdrawAmount: { type: Number, default: 0, min: 0 },
    maximumWithdrawAmount: { type: Number, default: 0, min: 0 },

    fields: { type: [fieldSchema], default: [] },

    sort: { type: Number, default: 0, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const AffWithdrawMethod =
  mongoose.models.AffWithdrawMethod ||
  mongoose.model("AffWithdrawMethod", affWithdrawMethodSchema);

export default AffWithdrawMethod;
