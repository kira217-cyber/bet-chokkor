import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { protectUser } from "../middleware/protectUser.js";
import {
  clearOtp,
  isOtpRequired,
  isVerified,
  sendOtp,
  verifyOtp,
} from "../utils/otp.js";
import { grantRegisterBonus } from "../utils/registerBonus.js";

const router = express.Router();

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD = 6;
const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

const text = (value) => String(value ?? "").trim();

/** এক IP থেকে বারবার চেষ্টা ঠেকাতে */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later" },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP requests" },
});

/** ৬ অক্ষরের রেফারেল কোড — সংঘর্ষ হলে আবার চেষ্টা */
const makeReferralCode = async () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!(await User.exists({ referralCode: code }))) return code;
  }

  throw new Error("Could not create a referral code");
};

/** গেম প্ল্যাটফর্মের জন্য ১০ অক্ষরের নাম */
const makeGamePlayName = async () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";

  for (let attempt = 0; attempt < 20; attempt += 1) {
    let name = "";
    for (let i = 0; i < 10; i += 1) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!(await User.exists({ userGamePlayName: name }))) return name;
  }

  throw new Error("Could not create a game play name");
};

const issueToken = (user) =>
  generateToken({ id: user._id, kind: "user", role: user.role });

/* =========================
   OTP
   ========================= */

/**
 * OTP চাওয়া। যে ফ্লোতে অ্যাডমিন OTP বন্ধ রেখেছেন, সেখানে
 * `required: false` ফেরত যায় আর SMS পাঠানো হয় না।
 */
router.post("/otp/send", otpLimiter, async (req, res) => {
  try {
    const flow = text(req.body?.flow);
    const site = req.body?.site === "affiliate" ? "affiliate" : "client";
    const countryCode = text(req.body?.countryCode) || "+880";
    const phone = text(req.body?.phone);

    if (!flow || !phone) {
      return errorResponse(res, "Flow and phone are required", 400);
    }

    if (!(await isOtpRequired(site, flow))) {
      return successResponse(res, "OTP is not needed for this step", {
        required: false,
      });
    }

    // রেজিস্টারে নম্বরটা নতুন হতে হবে, বাকি ফ্লোতে চেনা হতে হবে
    const exists = await User.exists({ countryCode, phone });

    if (flow === "register" && exists) {
      return errorResponse(res, "This number already has an account", 409);
    }

    if (flow !== "register" && !exists) {
      return errorResponse(res, "No account found with this number", 404);
    }

    const result = await sendOtp({ site, flow, countryCode, phone });

    if (!result.ok) return errorResponse(res, result.message, 400);

    return successResponse(res, result.message, { required: true });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post("/otp/verify", otpLimiter, async (req, res) => {
  try {
    const flow = text(req.body?.flow);
    const countryCode = text(req.body?.countryCode) || "+880";
    const phone = text(req.body?.phone);
    const otp = text(req.body?.otp);

    if (!flow || !phone || !otp) {
      return errorResponse(res, "Flow, phone and OTP are required", 400);
    }

    const result = verifyOtp({ flow, countryCode, phone, otp });

    if (!result.ok) return errorResponse(res, result.message, 400);

    return successResponse(res, result.message, { verified: true });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   রেজিস্টার
   ========================= */

router.post("/register", authLimiter, async (req, res) => {
  try {
    const userId = text(req.body?.userId);
    const password = text(req.body?.password);
    const countryCode = text(req.body?.countryCode) || "+880";
    const phone = text(req.body?.phone);
    const referralCode = text(req.body?.referralCode).toUpperCase();

    if (!userId || !password || !phone) {
      return errorResponse(res, "Username, password and phone are required", 400);
    }

    if (userId.length < 4 || userId.length > 15) {
      return errorResponse(res, "Username must be 4 to 15 characters", 400);
    }

    if (password.length < MIN_PASSWORD) {
      return errorResponse(
        res,
        `Password must be at least ${MIN_PASSWORD} characters`,
        400,
      );
    }

    if (await User.exists({ userId })) {
      return errorResponse(res, "This username is taken", 409);
    }

    if (await User.exists({ countryCode, phone })) {
      return errorResponse(res, "This number already has an account", 409);
    }

    // OTP চালু থাকলে আগে যাচাই হয়ে থাকতে হবে
    if (await isOtpRequired("client", "register")) {
      if (!isVerified({ flow: "register", countryCode, phone })) {
        return errorResponse(res, "Please verify the OTP first", 400);
      }
    }

    let referrer = null;

    if (referralCode) {
      referrer = await User.findOne({ referralCode });

      if (!referrer) {
        return errorResponse(res, "Referral code is not valid", 400);
      }
    }

    const user = await User.create({
      userId,
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      countryCode,
      phone,
      referralCode: await makeReferralCode(),
      userGamePlayName: await makeGamePlayName(),
      referredBy: referrer?._id || null,
      firstName: text(req.body?.firstName),
      lastName: text(req.body?.lastName),
      email: text(req.body?.email).toLowerCase(),
    });

    if (referrer) {
      referrer.referralCount = Number(referrer.referralCount || 0) + 1;
      await referrer.save();
    }

    // চালু ক্যাম্পেইন থাকলে বোনাস ও টার্নওভার বসে
    const bonus = await grantRegisterBonus(user);

    clearOtp({ flow: "register", countryCode, phone });

    user.lastLoginAt = new Date();
    await user.save();

    return successResponse(
      res,
      "Registration successful",
      { token: issueToken(user), user: user.toSafeJSON(), bonus },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "This account already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   লগইন
   ========================= */

router.post("/login", authLimiter, async (req, res) => {
  try {
    const userId = text(req.body?.userId);
    const password = text(req.body?.password);

    if (!userId || !password) {
      return errorResponse(res, "Username and password are required", 400);
    }

    const user = await User.findOne({ userId }).select(
      "+password +failedLoginAttempts +lockedUntil",
    );

    // অ্যাকাউন্ট নেই আর পাসওয়ার্ড ভুল — একই বার্তা, যাতে কোন ইউজারনেম
    // আছে সেটা বাইরে থেকে যাচাই করা না যায়
    if (!user) {
      return errorResponse(res, "Username or password is not correct", 401);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return errorResponse(
        res,
        `Account locked. Try again in ${minutes} minute(s).`,
        423,
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = Number(user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_FAILED) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        user.failedLoginAttempts = 0;
      }

      await user.save();

      return errorResponse(res, "Username or password is not correct", 401);
    }

    if (!user.isActive) {
      return errorResponse(res, "This account is disabled", 403);
    }

    // লগইনে OTP চালু থাকলে যাচাই হয়ে থাকতে হবে
    if (await isOtpRequired("client", "login")) {
      if (!isVerified({ flow: "login", countryCode: user.countryCode, phone: user.phone })) {
        return successResponse(res, "OTP verification needed", {
          otpRequired: true,
          countryCode: user.countryCode,
          phone: user.phone,
        });
      }

      clearOtp({ flow: "login", countryCode: user.countryCode, phone: user.phone });
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    return successResponse(res, "Login successful", {
      token: issueToken(user),
      user: user.toSafeJSON(),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   পাসওয়ার্ড ভুলে গেলে
   ========================= */

router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const countryCode = text(req.body?.countryCode) || "+880";
    const phone = text(req.body?.phone);
    const newPassword = text(req.body?.newPassword);

    if (!phone || !newPassword) {
      return errorResponse(res, "Phone and new password are required", 400);
    }

    if (newPassword.length < MIN_PASSWORD) {
      return errorResponse(
        res,
        `Password must be at least ${MIN_PASSWORD} characters`,
        400,
      );
    }

    const user = await User.findOne({ countryCode, phone });

    if (!user) {
      return errorResponse(res, "No account found with this number", 404);
    }

    if (await isOtpRequired("client", "forgotPassword")) {
      if (!isVerified({ flow: "forgotPassword", countryCode, phone })) {
        return errorResponse(res, "Please verify the OTP first", 400);
      }
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    clearOtp({ flow: "forgotPassword", countryCode, phone });

    return successResponse(res, "Password changed. Please log in.");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   নিজের তথ্য
   ========================= */

router.get("/me", protectUser, async (req, res) =>
  successResponse(res, "Profile loaded", { user: req.user.toSafeJSON() }),
);

export default router;
