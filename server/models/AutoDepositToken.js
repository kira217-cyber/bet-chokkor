import mongoose from "mongoose";

const { Schema } = mongoose;

const LangTextSchema = new Schema(
  {
    bn: { type: String, default: "", trim: true },
    en: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const EligibleProviderSchema = new Schema(
  {
    providerCode: { type: String, required: true, trim: true, uppercase: true },
    percent: { type: Number, default: 100, min: 0, max: 100 },
  },
  { _id: false },
);

/**
 * অটো ডিপোজিটে বেছে নেওয়ার মতো একটা বোনাস।
 *
 * ম্যানুয়ালে বোনাস আসে চ্যানেল ও প্রোমো থেকে; অটোতে গেটওয়ে নিজেই টাকা
 * নিশ্চিত করে বলে চ্যানেল নেই — এই তালিকাটাই বোনাসের জায়গা।
 */
const BonusSchema = new Schema(
  {
    title: { type: LangTextSchema, default: () => ({}) },

    bonusType: { type: String, enum: ["fixed", "percent"], default: "fixed" },
    bonusValue: { type: Number, default: 0, min: 0 },

    turnoverMultiplier: { type: Number, default: 1, min: 0 },

    bonusScope: {
      type: String,
      enum: ["all-time", "first-deposit"],
      default: "all-time",
    },

    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0, min: 0 },

    eligibleProviders: { type: [EligibleProviderSchema], default: [] },
  },
  { _id: true },
);

/**
 * অটো ডিপোজিটের গেটওয়ে সেটিং — সবসময় একটাই ডকুমেন্ট।
 *
 * টোকেনটা অ্যাডমিন প্যানেল থেকে বসে, কোডে বা .env এ নয়, তাই টোকেন
 * বদলালে ডিপ্লয় লাগে না। বন্ধ থাকলে ক্লায়েন্টে অটো অংশটা দেখায় না,
 * ম্যানুয়াল উপায়গুলো দিয়েই কাজ চলে।
 */
const autoDepositTokenSchema = new Schema(
  {
    businessToken: { type: String, default: "", trim: true, select: false },

    active: { type: Boolean, default: false },

    minAmount: { type: Number, default: 100, min: 1 },
    maxAmount: { type: Number, default: 500000, min: 0 },

    bonuses: { type: [BonusSchema], default: [] },

    lastError: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

/** সবসময় একটাই ডকুমেন্ট */
autoDepositTokenSchema.statics.current = async function current() {
  const existing = await this.findOne()
    .sort({ createdAt: 1 })
    .select("+businessToken");

  if (existing) return existing;

  return this.create({});
};

/** অ্যাডমিনে দেখানোর রূপ — টোকেন কখনো পুরো যায় না */
autoDepositTokenSchema.methods.toSafeJSON = function toSafeJSON() {
  const token = String(this.businessToken || "");

  return {
    tokenPreview: token ? `••••••••${token.slice(-4)}` : "",
    hasToken: Boolean(token),
    active: this.active,
    minAmount: this.minAmount,
    maxAmount: this.maxAmount,
    bonuses: this.bonuses,
    lastError: this.lastError,
    updatedAt: this.updatedAt,
  };
};

const AutoDepositToken =
  mongoose.models.AutoDepositToken ||
  mongoose.model("AutoDepositToken", autoDepositTokenSchema);

export default AutoDepositToken;
