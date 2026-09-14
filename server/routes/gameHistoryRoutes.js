import express from "express";
import mongoose from "mongoose";

import GameHistory from "../models/GameHistory.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** নিজের খেলার ইতিহাস */
router.get("/my", protectUser, async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const rows = await GameHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-affiliateUser -affiliateCommissionAmount -affiliateCommissionType")
      .lean();

    return successResponse(res, "Game history loaded", { rows });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** সবার খেলার ইতিহাস — অ্যাডমিন পেজ */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const result = text(req.query.resultType);

    if (["win", "loss", "push"].includes(result)) filter.resultType = result;

    const provider = text(req.query.provider).toUpperCase();
    if (provider) filter.providerCode = provider;

    const search = text(req.query.q);

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");

      const users = await User.find({
        $or: [{ userId: regex }, { phone: regex }],
      }).select("_id");

      filter.$or = [
        { userId: regex },
        { gameUId: regex },
        { gameRound: regex },
        {
          user: {
            $in: users.length
              ? users.map((item) => item._id)
              : [new mongoose.Types.ObjectId()],
          },
        },
      ];
    }

    const [rows, total, totals] = await Promise.all([
      GameHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      GameHistory.countDocuments(filter),
      GameHistory.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            bet: { $sum: "$betAmount" },
            win: { $sum: "$winAmount" },
            net: { $sum: "$netAmount" },
          },
        },
      ]),
    ]);

    return successResponse(res, "Game history loaded", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      // net ধনাত্মক মানে খেলোয়াড়রা এগিয়ে, সাইট পিছিয়ে
      totals: {
        bet: money(totals[0]?.bet || 0),
        win: money(totals[0]?.win || 0),
        net: money(totals[0]?.net || 0),
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
