import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * রেফারেল থেকে পাওয়া এক-একটা টাকা।
 *
 * দুই রকম:
 *   commission  — বন্ধু খেলেছেন, তার একটা শতাংশ
 *   achievement — এক মাসে এতজনকে এনেছেন, তার থোক বোনাস
 *
 * অটো-ক্লেইম বন্ধ থাকলে সারিটা `claimable` হয়ে বসে থাকে; ব্যবহারকারী
 * claim চাপলে টাকাটা ব্যালেন্সে যায় আর সারিটা `claimed` হয়।
 *
 * একই রাউন্ড বা একই মাইলফলক দুবার যেন টাকা না দেয়, সেজন্য দুটো
 * partial unique index।
 */
const referralRewardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userIdText: { type: String, default: "", trim: true },

    type: {
      type: String,
      enum: ["commission", "achievement"],
      required: true,
      index: true,
    },

    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["claimable", "claimed"],
      default: "claimable",
      index: true,
    },

    /* ── কমিশনের জন্য ── */

    /** কার খেলা থেকে */
    fromUser: { type: Schema.Types.ObjectId, ref: "User", default: null },
    fromUserIdText: { type: String, default: "", trim: true },

    /** কত দূরের সম্পর্ক — ১ মানে সরাসরি বন্ধু */
    tier: { type: Number, default: 0 },

    /** যে বাজির উপর হিসাব */
    wager: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },

    /** কোন রাউন্ড — একই রাউন্ডে দুবার যেন না বসে */
    gameHistory: {
      type: Schema.Types.ObjectId,
      ref: "GameHistory",
      default: null,
    },

    /* ── মাইলফলকের জন্য ── */

    /** কোন সময়কাল — "2026-09" এর মতো */
    periodKey: { type: String, default: "", trim: true },
    milestoneCount: { type: Number, default: 0 },

    claimedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

referralRewardSchema.index({ user: 1, status: 1, createdAt: -1 });

// একই রাউন্ডে একই জনকে একই tier এ দুবার নয়
referralRewardSchema.index(
  { user: 1, gameHistory: 1, tier: 1 },
  {
    unique: true,
    partialFilterExpression: { gameHistory: { $type: "objectId" } },
  },
);

// একই সময়কালের একই মাইলফলক একবারই
referralRewardSchema.index(
  { user: 1, periodKey: 1, milestoneCount: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "achievement" },
  },
);

const ReferralReward =
  mongoose.models.ReferralReward ||
  mongoose.model("ReferralReward", referralRewardSchema);

export default ReferralReward;
