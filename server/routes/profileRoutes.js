import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { isOtpRequired, sendOtp, verifyOtp } from "../utils/otp.js";
import { normalizeCountryCode, normalizePhone, displayPhone } from "../utils/phone.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

const BCRYPT_ROUNDS = 12;

/**
 * নিজের প্রোফাইল বদলানোর ধাপগুলো।
 *
 * প্রতিটা ঘর আলাদা রুট, একটা বড় "সব সেভ করো" রুট নয় — মূল সাইটেও
 * প্রতিটা ঘর আলাদা পর্দায় খোলে। আলাদা রাখায় নিয়মগুলোও আলাদা রাখা
 * যায়: নাম আর জন্ম তারিখ একবারই বসে, ফোন বদলাতে OTP লাগে, পাসওয়ার্ড
 * বদলাতে পুরোনোটা লাগে।
 */

/* পাসওয়ার্ড আর OTP এর রুটে বারবার চেষ্টা আটকানো */
const tightLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please wait" },
});

/**
 * পাসওয়ার্ডের নিয়ম — মূল সাইটের তালিকা অনুযায়ী।
 *
 * ক্লায়েন্টেও একই নিয়ম দেখানো হয় টিক-ক্রস দিয়ে, কিন্তু আসল যাচাই
 * এখানেই — ব্রাউজারের যাচাই বাইপাস করা যায়।
 */
export const passwordProblems = (password) => {
  const value = String(password || "");
  const problems = [];

  if (value.length < 6 || value.length > 20) problems.push("length");
  if (!/[A-Z]/.test(value)) problems.push("upper");
  if (!/[a-z]/.test(value)) problems.push("lower");
  if (!/[0-9]/.test(value)) problems.push("digit");
  if (/[^A-Za-z0-9!@#$%*]/.test(value)) problems.push("charset");

  return problems;
};

/* =========================
   সম্পূর্ণ লিগ্যাল নাম
   ========================= */

router.put("/full-name", protectUser, async (req, res) => {
  try {
    const fullName = text(req.body?.fullName).replace(/\s+/g, " ");

    if (fullName.length < 3 || fullName.length > 60) {
      return errorResponse(res, "Please write your full name", 400, "badFullName");
    }

    if (!/^[A-Za-z. ]+$/.test(fullName)) {
      return errorResponse(res, "Use English letters only", 400, "badFullName");
    }

    // একবার বসে গেলে আর নয় — টাকা তোলার সময় এই নামেই পরিচয় মেলে
    if (text(req.user.fullName)) {
      return errorResponse(res, "Name is already set", 409, "alreadySet");
    }

    req.user.fullName = fullName;
    await req.user.save();

    return successResponse(res, "Name saved", { user: req.user.toSafeJSON() });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   জন্ম তারিখ
   ========================= */

router.put("/birthday", protectUser, async (req, res) => {
  try {
    const raw = text(req.body?.dateOfBirth);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return errorResponse(res, "Use YYYY-MM-DD", 400, "badBirthday");
    }

    const date = new Date(`${raw}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      return errorResponse(res, "That date is not valid", 400, "badBirthday");
    }

    /*
     * বয়সটা দিন ধরে হিসাব করা, বছর বিয়োগ করে নয় — জন্মদিন এখনো না
     * এলে বছর বিয়োগে এক বছর বেশি দেখাত, আর ঠিক ১৮ ছোঁয়ার আগেই পাশ
     * করে যেত।
     */
    const eighteen = new Date(date);
    eighteen.setUTCFullYear(eighteen.getUTCFullYear() + 18);

    if (eighteen > new Date()) {
      return errorResponse(res, "You must be at least 18", 400, "tooYoung");
    }

    if (date.getUTCFullYear() < 1920) {
      return errorResponse(res, "That date is not valid", 400, "badBirthday");
    }

    if (req.user.dateOfBirth) {
      return errorResponse(res, "Date of birth is already set", 409, "alreadySet");
    }

    req.user.dateOfBirth = date;
    await req.user.save();

    return successResponse(res, "Date of birth saved", {
      user: req.user.toSafeJSON(),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   ইমেইল
   ========================= */

router.put("/email", protectUser, async (req, res) => {
  try {
    const email = text(req.body?.email).toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return errorResponse(res, "That email is not valid", 400, "badEmail");
    }

    const taken = await User.exists({ email, _id: { $ne: req.user._id } });

    if (taken) {
      return errorResponse(res, "This email is already used", 409, "emailTaken");
    }

    req.user.email = email;
    await req.user.save();

    return successResponse(res, "Email saved", { user: req.user.toSafeJSON() });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   ফোন নম্বর
   ========================= */

/**
 * নতুন নম্বরে কোড পাঠানো।
 *
 * কোডটা নতুন নম্বরেই যায়, পুরোনোটায় নয় — নইলে নম্বর হারিয়ে ফেললে
 * আর বদলানোই যেত না। অ্যাডমিন `profileVerify` বন্ধ রাখলে ধাপটা
 * নিঃশব্দে এড়িয়ে যায়।
 */
router.post("/phone/send-otp", protectUser, tightLimiter, async (req, res) => {
  try {
    const countryCode = normalizeCountryCode(req.body?.countryCode);
    const phone = normalizePhone(req.body?.phone, countryCode);

    if (phone.length < 6) {
      return errorResponse(res, "Enter a valid phone number", 400, "missingFields");
    }

    const taken = await User.exists({
      countryCode,
      phone,
      _id: { $ne: req.user._id },
    });

    if (taken) {
      return errorResponse(res, "This number already has an account", 409, "phoneTaken");
    }

    if (!(await isOtpRequired("client", "profileVerify"))) {
      return successResponse(res, "OTP is not needed for this step", {
        required: false,
      });
    }

    const result = await sendOtp({
      site: "client",
      flow: "profileVerify",
      countryCode,
      phone,
    });

    if (!result.ok) return errorResponse(res, result.message, 400, result.code);

    return successResponse(res, result.message, { required: true });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put("/phone", protectUser, tightLimiter, async (req, res) => {
  try {
    const countryCode = normalizeCountryCode(req.body?.countryCode);
    const phone = normalizePhone(req.body?.phone, countryCode);
    const otp = text(req.body?.otp);

    if (phone.length < 6) {
      return errorResponse(res, "Enter a valid phone number", 400, "missingFields");
    }

    const taken = await User.exists({
      countryCode,
      phone,
      _id: { $ne: req.user._id },
    });

    if (taken) {
      return errorResponse(res, "This number already has an account", 409, "phoneTaken");
    }

    const needsOtp = await isOtpRequired("client", "profileVerify");

    if (needsOtp) {
      const result = verifyOtp({
        flow: "profileVerify",
        countryCode,
        phone,
        otp,
      });

      if (!result.ok) return errorResponse(res, result.message, 400, result.code);
    }

    req.user.countryCode = countryCode;
    req.user.phone = phone;
    req.user.isPhoneVerified = needsOtp;

    await req.user.save();

    return successResponse(res, "Phone number saved", {
      user: req.user.toSafeJSON(),
      phone: displayPhone(phone, countryCode),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   পাসওয়ার্ড
   ========================= */

router.put("/password", protectUser, tightLimiter, async (req, res) => {
  try {
    const currentPassword = text(req.body?.currentPassword);
    const newPassword = text(req.body?.newPassword);

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Both passwords are required", 400, "missingFields");
    }

    const problems = passwordProblems(newPassword);

    if (problems.length) {
      return errorResponse(
        res,
        "The new password does not meet the rules",
        400,
        "weakPassword",
      );
    }

    if (currentPassword === newPassword) {
      return errorResponse(
        res,
        "The new password must be different",
        400,
        "samePassword",
      );
    }

    // `password` মডেলে select:false, তাই আলাদা করে চাইতে হয়
    const user = await User.findById(req.user._id).select("+password");

    if (!user) return errorResponse(res, "No account found", 404, "noAccount");

    const matches = await bcrypt.compare(currentPassword, user.password);

    if (!matches) {
      return errorResponse(res, "Your current password is not correct", 400, "badPassword");
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await user.save();

    return successResponse(res, "Password changed", {});
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
