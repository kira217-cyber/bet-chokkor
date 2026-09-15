import express from "express";
import mongoose from "mongoose";

import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

// lean() ডকুমেন্টে virtual আসে না, তাই শতাংশটা এখানেই বসিয়ে দেওয়া হয়
const withPercent = (row) => ({
  ...row,
  percent: row.required
    ? Math.min(100, Math.round((num(row.progress) / num(row.required)) * 100))
    : 100,
});

/** নিজের চলতি ও শেষ হওয়া টার্নওভার */
router.get("/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const status = text(req.query.status);

    if (["running", "completed"].includes(status)) filter.status = status;

    const [turnovers, total] = await Promise.all([
      TurnOver.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
    ]);

    return successResponse(res, "Turnovers loaded", {
      turnovers: turnovers.map(withPercent),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** সব টার্নওভার — অ্যাডমিনের ইতিহাস পেজ */
router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const status = text(req.query.status);

    if (["running", "completed"].includes(status)) filter.status = status;

    const sourceType = text(req.query.sourceType);
    if (sourceType) filter.sourceType = sourceType;

    const search = text(req.query.q);

    if (search) {
      const users = await User.find({
        $or: [
          { userId: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      filter.user = {
        $in: users.length ? users.map((u) => u._id) : [new mongoose.Types.ObjectId()],
      };
    }

    const [turnovers, total, counts] = await Promise.all([
      TurnOver.find(filter)
        .populate("user", "userId phone balance role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TurnOver.countDocuments(filter),
      TurnOver.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);

    const summary = { running: 0, completed: 0 };
    counts.forEach((row) => {
      summary[row._id] = row.n;
    });

    return successResponse(res, "Turnovers loaded", {
      turnovers: turnovers.map(withPercent),
      summary,
      meta: { page, limit, total },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** একজন ব্যবহারকারীর সব টার্নওভার */
router.get("/admin/user/:userId", protectAdmin, async (req, res) => {
  try {
    if (!isId(req.params.userId)) return errorResponse(res, "Invalid id", 400);

    const turnovers = await TurnOver.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Turnovers loaded", {
      turnovers: turnovers.map(withPercent),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
