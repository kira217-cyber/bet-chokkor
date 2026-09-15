import express from "express";

import User from "../models/User.js";
import DepositRequest from "../models/DepositRequest.js";
import GameHistory from "../models/GameHistory.js";

import { protectUser } from "../middleware/protectUser.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * অ্যাফিলিয়েটের নিজের পাতা।
 *
 * খেলোয়াড় আর অ্যাফিলিয়েট একই `User` কালেকশনে, শুধু `role` আলাদা — তাই
 * টোকেন যাচাই একই মিডলওয়্যারে হয়, শুধু ভূমিকাটা এখানে দেখা হয়। নইলে
 * খেলোয়াড়ের টোকেন দিয়ে অ্যাফিলিয়েটের হিসাব দেখা যেত।
 */
const onlyAffiliate = (req, res, next) => {
  if (req.user?.role !== "aff-user") {
    return errorResponse(res, "This area is for affiliates", 403, "notAffiliate");
  }

  return next();
};

/**
 * কমিশনের চার ভাগ ও শেষ হিসাব।
 *
 * রেফার, ডিপোজিট আর খেলোয়াড়ের হারের ভাগ অ্যাফিলিয়েটের পাওনা; খেলোয়াড়
 * জিতলে সেই ভাগটা তাঁর দেনা। তাই net = (refer + deposit + gameLoss) −
 * gameWin, আর সেটা ঋণাত্মকও হতে পারে। অ্যাডমিন Bulk Adjustment দিয়ে
 * এই net টাই ব্যালেন্সে মিলিয়ে দেন।
 */
const commissionOf = (user) => {
  const refer = num(user.referCommissionBalance);
  const deposit = num(user.depositCommissionBalance);
  const gameLoss = num(user.gameLossCommissionBalance);
  const gameWin = num(user.gameWinCommissionBalance);

  const gross = refer + deposit + gameLoss;

  return {
    balances: { refer, deposit, gameLoss, gameWin },
    rates: {
      refer: num(user.referCommission),
      deposit: num(user.depositCommission),
      gameLoss: num(user.gameLossCommission),
      gameWin: num(user.gameWinCommission),
    },
    gross: money(gross),
    net: money(gross - gameWin),
  };
};

/** এই মাসের শুরু — মাসের আয় দেখাতে */
const monthStart = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

/* =========================
   ড্যাশবোর্ড
   ========================= */

router.get("/me", protectUser, onlyAffiliate, async (req, res) => {
  try {
    const user = req.user;
    const since = monthStart();

    const [total, active, joinedThisMonth, deposits, rounds] = await Promise.all([
      User.countDocuments({ referredBy: user._id }),
      User.countDocuments({ referredBy: user._id, isActive: true }),
      User.countDocuments({ referredBy: user._id, createdAt: { $gte: since } }),

      // রেফার করা খেলোয়াড়দের অনুমোদিত জমার যোগফল
      DepositRequest.aggregate([
        { $match: { status: "approved" } },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "player",
          },
        },
        { $unwind: "$player" },
        { $match: { "player.referredBy": user._id } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),

      // তাঁদের খেলার হিসাব — এখান থেকেই গেম কমিশন আসে
      GameHistory.aggregate([
        { $match: { affiliateUser: user._id } },
        {
          $group: {
            _id: null,
            bet: { $sum: "$betAmount" },
            commission: { $sum: "$affiliateCommissionAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const monthCommission = await GameHistory.aggregate([
      { $match: { affiliateUser: user._id, createdAt: { $gte: since } } },
      { $group: { _id: null, commission: { $sum: "$affiliateCommissionAmount" } } },
    ]);

    return successResponse(res, "Affiliate loaded", {
      user: user.toSafeJSON(),
      referralCode: user.referralCode,
      commission: commissionOf(user),
      players: {
        total,
        active,
        joinedThisMonth,
        depositTotal: money(deposits[0]?.total || 0),
        depositCount: deposits[0]?.count || 0,
      },
      games: {
        rounds: rounds[0]?.count || 0,
        turnover: money(rounds[0]?.bet || 0),
        commission: money(rounds[0]?.commission || 0),
      },
      thisMonthCommission: money(monthCommission[0]?.commission || 0),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** কমিশনের হার ও জমা — আলাদা পাতা */
router.get("/commission-status", protectUser, onlyAffiliate, async (req, res) => {
  try {
    return successResponse(res, "Commission loaded", {
      currency: req.user.currency,
      balance: money(req.user.balance),
      commission: commissionOf(req.user),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * নিজের আনা খেলোয়াড়েরা।
 *
 * প্রত্যেকের কত জমা ও কত খেলা হয়েছে সেটাও আসে — কে সত্যিই সক্রিয় সেটা
 * নাম দেখে বোঝা যায় না।
 */
router.get("/my-users", protectUser, onlyAffiliate, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = { referredBy: req.user._id };
    const search = text(req.query.q);

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ userId: regex }, { phone: regex }];
    }

    const status = text(req.query.status);
    if (status === "active") filter.isActive = true;
    if (status === "inactive") filter.isActive = false;

    const [rows, total, sums] = await Promise.all([
      User.find(filter)
        .select(
          "userId phone isActive createdAt totalDeposit totalTurnover lastLoginAt",
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
      User.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            deposit: { $sum: "$totalDeposit" },
            turnover: { $sum: "$totalTurnover" },
          },
        },
      ]),
    ]);

    return successResponse(res, "Players loaded", {
      rows,
      summary: {
        count: total,
        deposit: money(sums[0]?.deposit || 0),
        turnover: money(sums[0]?.turnover || 0),
      },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * কোন খেলোয়াড়ের কোন খেলা থেকে কত কমিশন এসেছে।
 *
 * "এই টাকাটা কোথা থেকে এল" প্রশ্নের উত্তর এখানেই — নইলে শুধু একটা
 * যোগফল দেখে বিশ্বাস করতে হতো।
 */
router.get("/commission-history", protectUser, onlyAffiliate, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {
      affiliateUser: req.user._id,
      affiliateCommissionType: { $ne: "none" },
    };

    const type = text(req.query.type);

    if (["game-win", "game-loss"].includes(type)) {
      filter.affiliateCommissionType = type;
    }

    const [rows, total] = await Promise.all([
      GameHistory.find(filter)
        .select(
          "userId gameName gameUId providerCode betAmount winAmount netAmount resultType affiliateCommissionAmount affiliateCommissionType createdAt",
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(filter),
    ]);

    return successResponse(res, "Commission history loaded", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
