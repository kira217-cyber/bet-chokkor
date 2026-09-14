import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * রেজিস্টার বোনাস — টাকাটা সাথে সাথে ব্যালেন্সে যায় না।
 *
 * টার্নওভার পূরণ হলে তবেই যোগ হয়, তাই এখানে অপেক্ষমাণ অবস্থায় বসে
 * থাকে। `isApplied` হয়ে গেলে আর দ্বিতীয়বার দেওয়া হয় না।
 */
const pendingRegisterBonusSchema = new Schema(
  {
    bonusId: {
      type: Schema.Types.ObjectId,
      ref: "RegisterBonusCampaign",
      default: null,
    },
    amount: { type: Number, default: 0, min: 0 },
    turnoverMultiplier: { type: Number, default: 0, min: 0 },
    isApplied: { type: Boolean, default: false, index: true },
    appliedAt: { type: Date, default: null },
  },
  { _id: false },
);

/**
 * সাইটের ব্যবহারকারী।
 *
 * সাধারণ প্লেয়ার আর অ্যাফিলিয়েট একই কালেকশনে, আলাদা `role` দিয়ে —
 * তাতে রেফারেল সম্পর্ক (`referredBy`) একই মডেলের ভিতরেই থাকে, দুই
 * কালেকশনের মধ্যে জোড়া লাগাতে হয় না।
 */
const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 4,
      maxlength: 15,
    },

    /** গেম প্ল্যাটফর্মে পাঠানোর নাম — ১০ অক্ষরের ছোট হাতের */
    userGamePlayName: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      match: /^[a-z]{10}$/,
    },

    email: { type: String, default: "", trim: true, lowercase: true },

    countryCode: { type: String, required: true, trim: true, default: "+880" },
    phone: { type: String, required: true, trim: true },

    password: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["user", "aff-user"],
      default: "user",
      index: true,
    },

    isActive: { type: Boolean, default: true, index: true },

    currency: { type: String, default: "BDT" },
    balance: { type: Number, default: 0 },

    pendingRegisterBonus: {
      type: pendingRegisterBonusSchema,
      default: () => ({}),
    },

    /* ── রেফারেল ── */
    referralCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    referralCount: { type: Number, default: 0, min: 0 },

    /* ── কমিশনের হার (%) — অ্যাডমিন প্রতিটা অ্যাফিলিয়েটের জন্য বসায় ── */
    referCommission: { type: Number, default: 0, min: 0 },
    depositCommission: { type: Number, default: 0, min: 0 },
    gameWinCommission: { type: Number, default: 0, min: 0 },
    gameLossCommission: { type: Number, default: 0, min: 0 },

    /* ── জমা হওয়া কমিশন (টাকা) ── */
    referCommissionBalance: { type: Number, default: 0 },
    depositCommissionBalance: { type: Number, default: 0 },
    gameWinCommissionBalance: { type: Number, default: 0 },
    gameLossCommissionBalance: { type: Number, default: 0 },

    firstName: { type: String, default: "", trim: true },
    lastName: { type: String, default: "", trim: true },

    /* ── নিরাপত্তা ── */
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockedUntil: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// একই নম্বরে দুবার অ্যাকাউন্ট হবে না
userSchema.index({ countryCode: 1, phone: 1 }, { unique: true });
userSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
userSchema.index({ userGamePlayName: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ referredBy: 1 });

/** অ্যাফিলিয়েটের মোট তোলার মতো কমিশন */
userSchema.methods.totalCommissionBalance = function totalCommissionBalance() {
  return (
    Number(this.referCommissionBalance || 0) +
    Number(this.depositCommissionBalance || 0) +
    Number(this.gameWinCommissionBalance || 0) +
    Number(this.gameLossCommissionBalance || 0)
  );
};

/** বাইরে পাঠানোর নিরাপদ রূপ — পাসওয়ার্ড বা লক কখনো যায় না */
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    userId: this.userId,
    userGamePlayName: this.userGamePlayName,
    email: this.email,
    countryCode: this.countryCode,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    currency: this.currency,
    balance: this.balance,
    referralCode: this.referralCode,
    referralCount: this.referralCount,
    firstName: this.firstName,
    lastName: this.lastName,
    pendingRegisterBonus: this.pendingRegisterBonus,
    createdAt: this.createdAt,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
