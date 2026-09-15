import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * অ্যাফিলিয়েটের টাকা তোলার আবেদন।
 *
 * জমা দেওয়ার সাথে সাথেই ব্যালেন্স থেকে কেটে রাখা হয় — নইলে আবেদন ঝুলে
 * থাকা অবস্থায় সেই টাকা দিয়েই আবার আবেদন করা যেত, আর অনুমোদনের সময়
 * দেখা যেত ব্যালেন্স নেই।
 *
 * উপায়ের নাম ও ঘরের নামগুলো এখানেই তুলে রাখা হয় (`methodSnapshot`) —
 * অ্যাডমিন পরে উপায়টা বদলে ফেললেও পুরোনো আবেদনে যা দেখানো হয়েছিল
 * সেটাই থাকে।
 */
const affWithdrawRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userIdText: { type: String, default: "", trim: true, index: true },

    methodId: { type: String, required: true, trim: true, uppercase: true },

    methodSnapshot: {
      name: {
        bn: { type: String, default: "", trim: true },
        en: { type: String, default: "", trim: true },
      },
      /** কোন ঘরগুলো চাওয়া হয়েছিল, কী নামে */
      fields: { type: Array, default: [] },
    },

    /** ব্যবহারকারীর ভরা মান — `{ accountName: "...", accountNo: "..." }` */
    fields: { type: Object, default: {} },

    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    balanceBefore: { type: Number, default: 0 },
    balanceAfter: { type: Number, default: 0 },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    adminNote: { type: String, default: "", trim: true, maxlength: 300 },

    approvedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

affWithdrawRequestSchema.index({ status: 1, createdAt: -1 });
affWithdrawRequestSchema.index({ user: 1, createdAt: -1 });

const AffWithdrawRequest =
  mongoose.models.AffWithdrawRequest ||
  mongoose.model("AffWithdrawRequest", affWithdrawRequestSchema);

export default AffWithdrawRequest;
