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
    providerCode: { type: String, trim: true, uppercase: true },
    percent: { type: Number, default: 100, min: 0, max: 100 },
  },
  { _id: false },
);

const AffiliateDepositCommissionSchema = new Schema(
  {
    affiliatorId: { type: String, default: "", trim: true },
    affiliatorUserId: { type: String, default: "", trim: true },
    percent: { type: Number, default: 0, min: 0 },
    baseAmount: { type: Number, default: 0, min: 0 },
    commissionAmount: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

/** পেমেন্ট শুরুর সময় যে বোনাসটা বেছে নেওয়া হয়েছিল, তার অনুলিপি */
const SelectedBonusSchema = new Schema(
  {
    bonusId: { type: String, default: "", trim: true },
    title: { type: LangTextSchema, default: () => ({}) },
    bonusType: { type: String, enum: ["fixed", "percent", ""], default: "" },
    bonusScope: {
      type: String,
      enum: ["all-time", "first-deposit", ""],
      default: "",
    },
    bonusValue: { type: Number, default: 0, min: 0 },
    bonusAmount: { type: Number, default: 0, min: 0 },
    turnoverMultiplier: { type: Number, default: 1, min: 0 },
    eligibleProviders: { type: [EligibleProviderSchema], default: [] },
  },
  { _id: false },
);

const CalcSchema = new Schema(
  {
    depositAmount: { type: Number, default: 0, min: 0 },
    bonusAmount: { type: Number, default: 0, min: 0 },
    creditedAmount: { type: Number, default: 0, min: 0 },
    turnoverMultiplier: { type: Number, default: 1, min: 0 },
    targetTurnover: { type: Number, default: 0, min: 0 },
    affiliateDepositCommission: {
      type: AffiliateDepositCommissionSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

/**
 * অটো ডিপোজিটের একটা লেনদেন।
 *
 * গেটওয়ে পাঠানোর আগে PENDING হয়ে বসে, আর গেটওয়ের নিশ্চিতকরণ এলে PAID
 * হয়ে টাকা ঢোকে। `balanceAdded` আলাদা রাখা হয়েছে কারণ নিশ্চিতকরণ
 * একাধিকবার আসতে পারে — টাকা যেন একবারই যোগ হয়।
 */
const autoDepositSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userIdText: { type: String, default: "", trim: true },

    amount: { type: Number, required: true, min: 0 },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },

    transactionId: { type: String, default: "", trim: true },
    bank: { type: String, default: "", trim: true },

    paidAt: { type: Date, default: null },

    /** টাকা ব্যালেন্সে যোগ হয়ে গেছে কিনা — দুবার যোগ ঠেকাতে */
    balanceAdded: { type: Boolean, default: false, index: true },

    selectedBonus: { type: SelectedBonusSchema, default: () => ({}) },
    calc: { type: CalcSchema, default: () => ({}) },
  },
  { timestamps: true },
);

autoDepositSchema.index({ user: 1, createdAt: -1 });
autoDepositSchema.index({ status: 1, createdAt: -1 });

const AutoDeposit =
  mongoose.models.AutoDeposit || mongoose.model("AutoDeposit", autoDepositSchema);

export default AutoDeposit;
