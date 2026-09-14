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

/** ০১৭****৮৯০১ — ব্যবহারকারী নিজের নম্বর চিনবেন, অন্য কেউ পড়তে পারবে না */
const maskPhone = (phone = "") => {
  const value = String(phone);

  if (value.length < 6) return "****";

  return `${value.slice(0, 3)}${"*".repeat(value.length - 7)}${value.slice(-4)}`;
};

/**
 * ফোন নম্বর বের করা — সরাসরি দেওয়া নম্বর, নয়তো ইউজারনেম থেকে।
 *
 * পাসওয়ার্ড ভুলে গেলে মূল সাইট ইউজারনেম চায়, নম্বর নয়। তাই নম্বরটা
 * সার্ভারই খুঁজে নেয় — ক্লায়েন্টে কখনো পুরো নম্বর যায় না।
 */
const resolveTarget = async ({ userId, countryCode, phone }) => {
  if (userId) {
    const user = await User.findOne({ userId });

    if (!user) return null;

    return { user, countryCode: user.countryCode, phone: user.phone };
  }

  if (!phone) return null;

  const user = await User.findOne({ countryCode, phone });

  return { user, countryCode, phone };
};

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
    const userId = text(req.body?.userId);
    const inputCode = text(req.body?.countryCode) || "+880";
    const inputPhone = text(req.body?.phone);

    if (!flow || (!inputPhone && !userId)) {
      return errorResponse(res, "Flow and phone are required", 400, "missingFields");
    }

    const target = await resolveTarget({
      userId,
      countryCode: inputCode,
      phone: inputPhone,
    });

    // অ্যাকাউন্ট আছে কিনা সেটা OTP চালু-বন্ধের আগেই দেখা হয় — নইলে OTP
    // বন্ধ থাকলে ভুল ইউজারনেমও পরের ধাপে চলে যেত
    if (flow === "register") {
      if (target?.user) {
        return errorResponse(res, "This number already has an account", 409, "phoneTaken");
      }
    } else if (!target?.user) {
      return errorResponse(res, "No account found", 404, "noAccount");
    }

    const countryCode = target?.countryCode || inputCode;
    const phone = target?.phone || inputPhone;

    if (!(await isOtpRequired(site, flow))) {
      return successResponse(res, "OTP is not needed for this step", {
        required: false,
        maskedPhone: maskPhone(phone),
      });
    }

    const result = await sendOtp({ site, flow, countryCode, phone });

    if (!result.ok) {
      return errorResponse(res, result.message, 400, result.code);
    }

    return successResponse(res, result.message, {
      required: true,
      maskedPhone: maskPhone(phone),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post("/otp/verify", otpLimiter, async (req, res) => {
  try {
    const flow = text(req.body?.flow);
    const userId = text(req.body?.userId);
    const inputCode = text(req.body?.countryCode) || "+880";
    const inputPhone = text(req.body?.phone);
    const otp = text(req.body?.otp);

    if (!flow || (!inputPhone && !userId) || !otp) {
      return errorResponse(res, "Flow, phone and OTP are required", 400, "missingFields");
    }

    const target = await resolveTarget({
      userId,
      countryCode: inputCode,
      phone: inputPhone,
    });

    const countryCode = target?.countryCode || inputCode;
    const phone = target?.phone || inputPhone;

    const result = verifyOtp({ flow, countryCode, phone, otp });

    if (!result.ok) {
      return errorResponse(res, result.message, 400, result.code);
    }

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
    const userId = text(req.body?.userId).toLowerCase();
    const password = text(req.body?.password);
    const countryCode = text(req.body?.countryCode) || "+880";
    const phone = text(req.body?.phone);
    const referralCode = text(req.body?.referralCode).toUpperCase();

    if (!userId || !password || !phone) {
      return errorResponse(res, "Username, password and phone are required", 400, "missingFields");
    }

    if (userId.length < 4 || userId.length > 15) {
      return errorResponse(res, "Username must be 4 to 15 characters", 400, "usernameLength");
    }

    // অ্যাডমিনের এডিট পেজেও ঠিক এই নিয়ম — নইলে এখানে বানানো নাম
    // ওখানে বদলাতে গিয়ে আটকে যেত
    if (!/^[a-z0-9]+$/.test(userId)) {
      return errorResponse(
        res,
        "Username allows only letters and numbers",
        400,
        "usernameChars",
      );
    }

    if (password.length < MIN_PASSWORD) {
      return errorResponse(
        res,
        `Password must be at least ${MIN_PASSWORD} characters`,
        400,
        "passwordTooShort",
      );
    }

    if (await User.exists({ userId })) {
      return errorResponse(res, "This username is taken", 409, "usernameTaken");
    }

    if (await User.exists({ countryCode, phone })) {
      return errorResponse(res, "This number already has an account", 409, "phoneTaken");
    }

    // OTP চালু থাকলে আগে যাচাই হয়ে থাকতে হবে
    if (await isOtpRequired("client", "register")) {
      if (!isVerified({ flow: "register", countryCode, phone })) {
        return errorResponse(res, "Please verify the OTP first", 400, "otpNotVerified");
      }
    }

    let referrer = null;

    if (referralCode) {
      referrer = await User.findOne({ referralCode });

      if (!referrer) {
        return errorResponse(res, "Referral code is not valid", 400, "badReferral");
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
      return errorResponse(res, "This account already exists", 409, "accountExists");
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   লগইন
   ========================= */

router.post("/login", authLimiter, async (req, res) => {
  try {
    const userId = text(req.body?.userId).toLowerCase();
    const password = text(req.body?.password);

    if (!userId || !password) {
      return errorResponse(res, "Username and password are required", 400, "missingFields");
    }

    const user = await User.findOne({ userId }).select(
      "+password +failedLoginAttempts +lockedUntil",
    );

    // অ্যাকাউন্ট নেই আর পাসওয়ার্ড ভুল — একই বার্তা, যাতে কোন ইউজারনেম
    // আছে সেটা বাইরে থেকে যাচাই করা না যায়
    if (!user) {
      return errorResponse(res, "Username or password is not correct", 401, "badLogin");
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return errorResponse(
        res,
        `Account locked. Try again in ${minutes} minute(s).`,
        423,
        "accountLocked",
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

      return errorResponse(res, "Username or password is not correct", 401, "badLogin");
    }

    if (!user.isActive) {
      return errorResponse(res, "This account is disabled", 403, "accountDisabled");
    }

    // লগইনে OTP চালু থাকলে যাচাই হয়ে থাকতে হবে
    if (await isOtpRequired("client", "login")) {
      if (!isVerified({ flow: "login", countryCode: user.countryCode, phone: user.phone })) {
        // পুরো নম্বর ফেরত যায় না — কোড চাওয়ার সময় ক্লায়েন্ট শুধু
        // ইউজারনেম পাঠায়, নম্বরটা সার্ভারই খুঁজে নেয়
        return successResponse(res, "OTP verification needed", {
          otpRequired: true,
          maskedPhone: maskPhone(user.phone),
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
    const userId = text(req.body?.userId);
    const inputCode = text(req.body?.countryCode) || "+880";
    const inputPhone = text(req.body?.phone);
    const newPassword = text(req.body?.newPassword);

    if ((!inputPhone && !userId) || !newPassword) {
      return errorResponse(res, "Account and new password are required", 400, "missingFields");
    }

    if (newPassword.length < MIN_PASSWORD) {
      return errorResponse(
        res,
        `Password must be at least ${MIN_PASSWORD} characters`,
        400,
        "passwordTooShort",
      );
    }

    const target = await resolveTarget({
      userId,
      countryCode: inputCode,
      phone: inputPhone,
    });

    const user = target?.user;

    if (!user) return errorResponse(res, "No account found", 404, "noAccount");

    const countryCode = target.countryCode;
    const phone = target.phone;

    if (await isOtpRequired("client", "forgotPassword")) {
      if (!isVerified({ flow: "forgotPassword", countryCode, phone })) {
        return errorResponse(res, "Please verify the OTP first", 400, "otpNotVerified");
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
