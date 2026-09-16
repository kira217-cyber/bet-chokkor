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

    /**
     * এ পর্যন্ত মোট কত বাজি ধরেছেন ও কত জমা দিয়েছেন।
     *
     * রেফারেল কমিশনের ধাপ ঠিক হয় এই দুটো দেখে। প্রতিবার যোগ করে না
     * বের করে চলতি যোগফল রাখা হয় — নইলে প্রতিটা রাউন্ডে পুরো ইতিহাস
     * গুনতে হতো।
     */
    totalTurnover: { type: Number, default: 0, min: 0 },
    totalDeposit: { type: Number, default: 0, min: 0 },

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
    /* ── অ্যাফিলিয়েট অনুমোদন ──
     *
     * রেজিস্টার করলেই ঢোকা যায় না। অ্যাডমিন কমিশনের হারগুলো বসিয়ে
     * অনুমোদন দিলে তবেই লগইন খোলে — নইলে হার শূন্য অবস্থায় কেউ
     * খেলোয়াড় আনতে শুরু করতেন আর কমিশন জমত না।
     *
     * ডিফল্ট "approved", তাই খেলোয়াড় ও আগে থেকে থাকা অ্যাফিলিয়েটরা
     * অচল হয়ে যান না; রেজিস্টার রুট নতুনদের জন্য "pending" বসায়।
     */
    affiliateStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    affiliateNote: { type: String, default: "", trim: true },
    affiliateReviewedAt: { type: Date, default: null },
    affiliateReviewedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },

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

    /* ── প্রোফাইলের তথ্য ──
     *
     * নাম আর জন্ম তারিখ একবারই বসে। পরে বদলাতে হলে সাপোর্টের মাধ্যমে —
     * মূল সাইটেও তাই, কারণ এই দুটো দিয়েই টাকা তোলার সময় পরিচয় মেলানো
     * হয়; ব্যবহারকারী নিজে বদলাতে পারলে সেই মেলানোর কোনো মানে থাকত না।
     */
    fullName: { type: String, default: "", trim: true },
    dateOfBirth: { type: Date, default: null },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    /*
     * পরিচয় যাচাইয়ের অবস্থা — আসল রেকর্ড `Verification` কালেকশনে,
     * এটা তার প্রতিচ্ছবি।
     *
     * নকল করে রাখা হয় বলে হেডারে ব্যাজ দেখাতে প্রতি পাতায় আলাদা
     * রিকোয়েস্ট করতে হয় না; `/api/user/me` তেই চলে আসে।
     */
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },

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
    fullName: this.fullName,
    dateOfBirth: this.dateOfBirth,
    isEmailVerified: this.isEmailVerified,
    isPhoneVerified: this.isPhoneVerified,
    affiliateStatus: this.affiliateStatus,
    affiliateNote: this.affiliateNote,
    verificationStatus: this.verificationStatus,
    pendingRegisterBonus: this.pendingRegisterBonus,
    createdAt: this.createdAt,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
