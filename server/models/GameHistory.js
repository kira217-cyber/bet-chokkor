import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * খেলার একেকটা রাউন্ড — মাস্টারের কলব্যাক থেকে আসে।
 *
 * এখানেই টাকার পুরো গল্পটা থাকে: কত বাজি, কত জেতা, আগে-পরে ব্যালেন্স
 * কত ছিল, টার্নওভারে গোনা হলো কিনা আর অ্যাফিলিয়েট কত কমিশন পেলেন।
 * হিসাব নিয়ে প্রশ্ন উঠলে এই এক জায়গা দেখলেই চলে।
 */
const gameHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: String, required: true, trim: true, index: true },

    /** গেম প্ল্যাটফর্মে যে নামে চেনা */
    userGamePlayName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    memberAccount: { type: String, default: "", trim: true },

    currency: { type: String, default: "BDT", trim: true },

    gameUId: { type: String, required: true, trim: true, index: true },
    gameRound: { type: String, required: true, trim: true, index: true },

    /**
     * মাস্টারের নিজের আইডি।
     *
     * একই রাউন্ড দুবার এলে (রিট্রাই, নেটওয়ার্কের গোলমাল) যেন টাকা
     * দুবার না কাটে — তাই unique।
     */
    serialNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    providerCode: { type: String, default: "", trim: true, uppercase: true },

    betAmount: { type: Number, required: true, min: 0 },
    winAmount: { type: Number, required: true, min: 0 },
    netAmount: { type: Number, required: true },

    resultType: {
      type: String,
      enum: ["win", "loss", "push"],
      required: true,
      index: true,
    },

    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },

    turnoverApplied: { type: Boolean, default: false, index: true },

    affiliateUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    affiliateCommissionAmount: { type: Number, default: 0 },
    affiliateCommissionType: {
      type: String,
      enum: ["none", "game-loss", "game-win"],
      default: "none",
    },

    masterTimestamp: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

gameHistorySchema.index({ user: 1, createdAt: -1 });
gameHistorySchema.index({ resultType: 1, createdAt: -1 });
gameHistorySchema.index({ createdAt: -1 });

const GameHistory =
  mongoose.models.GameHistory || mongoose.model("GameHistory", gameHistorySchema);

export default GameHistory;
