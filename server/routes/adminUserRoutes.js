import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import DepositRequest from "../models/DepositRequest.js";
import TurnOver from "../models/TurnOver.js";

import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";
import { normalizePhone } from "../utils/phone.js";

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

/** খোঁজার শব্দটা regex এ বসানোর আগে নিরাপদ করা */
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * তালিকার ফিল্টার।
 *
 * সাধারণ প্লেয়ার আর অ্যাফিলিয়েট একই কালেকশনে, শুধু `role` আলাদা —
 * তাই দুটো পেজেই এই একই ফাংশন কাজে লাগে।
 */
const buildFilter = ({ role, q, status }) => {
  const filter = { role };

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  const keyword = text(q);

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");

    filter.$or = [
      { userId: regex },
      { phone: regex },
      { email: regex },
      { referralCode: regex },
      { firstName: regex },
      { lastName: regex },
    ];
  }

  return filter;
};

const listUsers = async (req, res, role) => {
  const page = Math.max(1, num(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

  const filter = buildFilter({
    role,
    q: req.query.q,
    status: text(req.query.status),
  });

  const [users, total, active, inactive] = await Promise.all([
    User.find(filter)
      .populate("referredBy", "userId phone referralCode")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
    User.countDocuments({ role, isActive: true }),
    User.countDocuments({ role, isActive: false }),
  ]);

  return successResponse(res, "Users loaded", {
    users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    stats: { total: active + inactive, active, inactive },
  });
};

/**
 * একজনের বিস্তারিত — সাথে টাকার ইতিহাসের সারসংক্ষেপ।
 *
 * অ্যাডমিন কাউকে খুলে দেখলে সাধারণত জানতে চান কত জমা দিয়েছেন আর কোন
 * শর্ত এখনো চলছে, তাই সেটুকু একসাথেই আসে।
 */
const oneUser = async (req, res, role) => {
  if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

  const user = await User.findOne({ _id: req.params.id, role })
    .populate("referredBy", "userId phone referralCode")
    .lean();

  if (!user) return errorResponse(res, "User not found", 404);

  const [deposits, turnovers, totals] = await Promise.all([
    DepositRequest.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    TurnOver.find({ user: user._id }).sort({ createdAt: -1 }).limit(10).lean(),
    DepositRequest.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(user._id), status: "approved" } },
      { $group: { _id: null, n: { $sum: 1 }, sum: { $sum: "$calc.creditedAmount" } } },
    ]),
  ]);

  return successResponse(res, "User loaded", {
    user,
    deposits,
    turnovers,
    summary: {
      depositCount: totals[0]?.n || 0,
      depositTotal: money(totals[0]?.sum || 0),
    },
  });
};

/* =========================
   সাধারণ প্লেয়ার
   ========================= */

router.get("/users", protectAdmin, async (req, res) => {
  try {
    return await listUsers(req, res, "user");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/users/:id", protectAdmin, async (req, res) => {
  try {
    return await oneUser(req, res, "user");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাফিলিয়েট
   ========================= */

router.get("/affiliates", protectAdmin, async (req, res) => {
  try {
    return await listUsers(req, res, "aff-user");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/affiliates/:id", protectAdmin, async (req, res) => {
  try {
    return await oneUser(req, res, "aff-user");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** একজন অ্যাফিলিয়েটের নিচে যারা আছে */
router.get("/affiliates/:id/referrals", protectAdmin, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const referrals = await User.find({ referredBy: req.params.id })
      .select("userId phone balance isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return successResponse(res, "Referrals loaded", { referrals });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   বদলানো — দুই ধরনের জন্যই একই রুট
   ========================= */

/** চালু / বন্ধ */
router.patch(
  "/:id/status",
  protectAdmin,
  requireWrite,
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

      if (typeof req.body?.isActive !== "boolean") {
        return errorResponse(res, "isActive must be true or false", 400);
      }

      const user = await User.findById(req.params.id);

      if (!user) return errorResponse(res, "User not found", 404);

      user.isActive = req.body.isActive;
      await user.save();

      return successResponse(
        res,
        user.isActive ? "Account activated" : "Account disabled",
        { user: user.toSafeJSON() },
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/**
 * তথ্য বদলানো।
 *
 * ব্যালেন্স এখান থেকে সরাসরি বদলানো যায় না — টাকার নড়াচড়া Manual
 * Deposit দিয়ে হয়, তাতে রেকর্ড থাকে। এখানে শুধু পরিচয়, পাসওয়ার্ড আর
 * অ্যাফিলিয়েটের কমিশনের হার।
 */
router.patch(
  "/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

      const user = await User.findById(req.params.id);

      if (!user) return errorResponse(res, "User not found", 404);

      const body = req.body || {};

      const userId = text(body.userId).toLowerCase();

      if (userId && userId !== user.userId) {
        if (userId.length < 4 || userId.length > 15) {
          return errorResponse(res, "Username must be 4 to 15 characters", 400);
        }

        if (!/^[a-z0-9]+$/.test(userId)) {
          return errorResponse(res, "Username allows only letters and numbers", 400);
        }

        if (await User.exists({ _id: { $ne: user._id }, userId })) {
          return errorResponse(res, "This username is taken", 409);
        }

        user.userId = userId;
      }

      const phone = normalizePhone(body.phone, user.countryCode);

      if (phone && phone !== user.phone) {
        const taken = await User.exists({
          _id: { $ne: user._id },
          countryCode: user.countryCode,
          phone,
        });

        if (taken) {
          return errorResponse(res, "This number already has an account", 409);
        }

        user.phone = phone;
      }

      if (body.email !== undefined) user.email = text(body.email).toLowerCase();
      if (body.firstName !== undefined) user.firstName = text(body.firstName);
      if (body.lastName !== undefined) user.lastName = text(body.lastName);

      // খালি পাঠালে পাসওয়ার্ড আগেরটাই থাকে
      const password = text(body.password);

      if (password) {
        if (password.length < 6) {
          return errorResponse(res, "Password must be at least 6 characters", 400);
        }

        user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
        user.failedLoginAttempts = 0;
        user.lockedUntil = null;
      }

      // কমিশনের হার শুধু অ্যাফিলিয়েটের জন্যই অর্থবহ
      if (user.role === "aff-user") {
        [
          "referCommission",
          "depositCommission",
          "gameWinCommission",
          "gameLossCommission",
        ].forEach((key) => {
          if (body[key] !== undefined) {
            user[key] = Math.min(100, Math.max(0, num(body[key])));
          }
        });
      }

      await user.save();

      return successResponse(res, "Saved", { user: user.toSafeJSON() });
    } catch (error) {
      if (error?.code === 11000) {
        return errorResponse(res, "This account already exists", 409);
      }

      return errorResponse(res, error.message, 500);
    }
  },
);

/**
 * প্লেয়ার ↔ অ্যাফিলিয়েট বদল।
 *
 * অ্যাফিলিয়েট থেকে সাধারণে নামানোর সময় জমে থাকা কমিশন থাকলে আটকানো
 * হয় — নইলে টাকাটা কোথাও না গিয়েই হারিয়ে যেত।
 */
router.patch(
  "/:id/role",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

      const role = req.body?.role === "aff-user" ? "aff-user" : "user";

      const user = await User.findById(req.params.id);

      if (!user) return errorResponse(res, "User not found", 404);

      if (user.role === role) {
        return errorResponse(res, `Already ${role}`, 400);
      }

      if (role === "user" && user.totalCommissionBalance() > 0) {
        return errorResponse(
          res,
          "Settle the commission balance first (Bulk Adjustment)",
          400,
        );
      }

      user.role = role;
      await user.save();

      return successResponse(res, "Role changed", { user: user.toSafeJSON() });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
