import express from "express";
import mongoose from "mongoose";

import EWallet from "../models/EWallet.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { isOtpRequired, isVerified, clearOtp } from "../utils/otp.js";
import { normalizePhone } from "../utils/phone.js";

const router = express.Router();

/** হাতে যোগ করা নম্বরের সীমা — রেজিস্ট্রেশনেরটা এর বাইরে */
const MANUAL_CAP = 3;

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

/**
 * রেজিস্ট্রেশনের নম্বরটা নিশ্চিত করা।
 *
 * ব্যবহারকারী একটাও নম্বর যোগ না করেও যেন টাকা তুলতে পারেন — যে নম্বরে
 * অ্যাকাউন্ট খুলেছেন সেটা নিজে থেকেই থাকে।
 */
const ensureRegistrationWallet = async (user) => {
  const existing = await EWallet.findOne({
    user: user._id,
    isAutoRegistration: true,
  });

  if (existing) return existing;

  // আগে হাতে একই নম্বর যোগ করা থাকলে সেটাকেই চিহ্নিত করা
  const sameNumber = await EWallet.findOne({
    user: user._id,
    walletNumber: user.phone,
  });

  if (sameNumber) {
    sameNumber.isAutoRegistration = true;
    sameNumber.label = sameNumber.label || "Registration number";
    await sameNumber.save();

    return sameNumber;
  }

  const count = await EWallet.countDocuments({ user: user._id });

  return EWallet.create({
    user: user._id,
    walletNumber: user.phone,
    walletType: "personal",
    label: "Registration number",
    isAutoRegistration: true,
    isDefault: count === 0,
  });
};

/** নিজের সব নম্বর */
router.get("/", protectUser, async (req, res) => {
  try {
    await ensureRegistrationWallet(req.user);

    const wallets = await EWallet.find({ user: req.user._id, isActive: true })
      .sort({ isAutoRegistration: -1, isDefault: -1, createdAt: 1 })
      .lean();

    return successResponse(res, "Wallets loaded", {
      wallets,
      // কয়টা আরও যোগ করা যাবে — ক্লায়েন্টে বাটনটা লুকাতে
      manualCap: MANUAL_CAP,
      manualCount: wallets.filter((item) => !item.isAutoRegistration).length,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নতুন নম্বর যোগ */
router.post("/", protectUser, async (req, res) => {
  try {
    const walletNumber = normalizePhone(req.body?.walletNumber, req.user.countryCode);

    if (!walletNumber || walletNumber.length < 10) {
      return errorResponse(res, "Enter a valid number", 400, "badWalletNumber");
    }

    // নতুন নম্বর যোগ করা টাকা সরানোর মতোই স্পর্শকাতর, তাই একই OTP টগল
    if (await isOtpRequired("client", "withdraw")) {
      const target = {
        flow: "withdraw",
        countryCode: req.user.countryCode,
        phone: req.user.phone,
      };

      if (!isVerified(target)) {
        return errorResponse(res, "Please verify the OTP first", 400, "otpNotVerified");
      }

      clearOtp(target);
    }

    const manualCount = await EWallet.countDocuments({
      user: req.user._id,
      isActive: true,
      isAutoRegistration: { $ne: true },
    });

    if (manualCount >= MANUAL_CAP) {
      return errorResponse(
        res,
        `You can add at most ${MANUAL_CAP} numbers`,
        400,
        "walletCap",
      );
    }

    if (await EWallet.exists({ user: req.user._id, walletNumber })) {
      return errorResponse(res, "This number is already added", 409, "walletExists");
    }

    const total = await EWallet.countDocuments({ user: req.user._id });

    const wallet = await EWallet.create({
      user: req.user._id,
      walletNumber,
      walletType: ["agent", "merchant"].includes(req.body?.walletType)
        ? req.body.walletType
        : "personal",
      label: text(req.body?.label),
      isDefault: total === 0,
    });

    return successResponse(res, "Number added", { wallet }, 201);
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "This number is already added", 409, "walletExists");
    }

    return errorResponse(res, error.message, 500);
  }
});

/** নাম বদলানো — নম্বর নয়, কারণ নম্বর বদলানো মানে নতুন নম্বর */
router.patch("/:id", protectUser, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const wallet = await EWallet.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!wallet) return errorResponse(res, "Number not found", 404);

    if (wallet.isAutoRegistration) {
      return errorResponse(res, "The registration number cannot be changed", 400);
    }

    if (req.body?.label !== undefined) wallet.label = text(req.body.label);

    if (["personal", "agent", "merchant"].includes(req.body?.walletType)) {
      wallet.walletType = req.body.walletType;
    }

    await wallet.save();

    return successResponse(res, "Saved", { wallet });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** কোনটা আগে দেখাবে */
router.patch("/:id/default", protectUser, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const wallet = await EWallet.findOne({
      _id: req.params.id,
      user: req.user._id,
      isActive: true,
    });

    if (!wallet) return errorResponse(res, "Number not found", 404);

    await EWallet.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } },
    );

    wallet.isDefault = true;
    await wallet.save();

    return successResponse(res, "Default number set", { wallet });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** মুছে ফেলা */
router.delete("/:id", protectUser, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const wallet = await EWallet.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!wallet) return errorResponse(res, "Number not found", 404);

    if (wallet.isAutoRegistration) {
      return errorResponse(res, "The registration number cannot be removed", 400);
    }

    await EWallet.deleteOne({ _id: wallet._id });

    // ডিফল্টটা মুছে গেলে আরেকটাকে ডিফল্ট বানানো, নইলে কোনোটাই নয়
    if (wallet.isDefault) {
      const next = await EWallet.findOne({
        user: req.user._id,
        isActive: true,
      }).sort({ isAutoRegistration: -1, createdAt: 1 });

      if (next) {
        next.isDefault = true;
        await next.save();
      }
    }

    return successResponse(res, "Number removed");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
export { ensureRegistrationWallet };
