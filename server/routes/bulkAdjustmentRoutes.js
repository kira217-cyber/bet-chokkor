import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildMatch = (q) => {
  const match = { role: "aff-user" };
  const keyword = text(q);

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");

    match.$or = [
      { userId: regex },
      { phone: regex },
      { email: regex },
      { firstName: regex },
      { lastName: regex },
    ];
  }

  return match;
};

/**
 * একজন অ্যাফিলিয়েটের হিসাব মিলিয়ে দেখা।
 *
 * রেফার, ডিপোজিট আর গেম-হারের কমিশন অ্যাফিলিয়েটের পাওনা; কিন্তু
 * রেফার করা প্লেয়াররা যা জিতেছে তার ভাগটা তাঁর দেনা। তাই
 * net = (refer + deposit + gameLoss) − gameWin। net ঋণাত্মক হতে পারে,
 * তখন ব্যালেন্স থেকেই কাটা যায়।
 */
const preview = (user) => {
  const refer = num(user?.referCommissionBalance);
  const deposit = num(user?.depositCommissionBalance);
  const gameLoss = num(user?.gameLossCommissionBalance);
  const gameWin = num(user?.gameWinCommissionBalance);

  const gross = refer + deposit + gameLoss;

  return {
    refer,
    deposit,
    gameLoss,
    gameWin,
    gross: money(gross),
    net: money(gross - gameWin),
  };
};

const clearFields = {
  referCommissionBalance: 0,
  depositCommissionBalance: 0,
  gameWinCommissionBalance: 0,
  gameLossCommissionBalance: 0,
};

/** যাদের হিসাব মেলানোর মতো কিছু আছে তাদের তালিকা */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const match = buildMatch(req.query.q);

    const [users, total] = await Promise.all([
      User.find(match)
        .select(
          "userId phone balance firstName lastName isActive referCommissionBalance depositCommissionBalance gameWinCommissionBalance gameLossCommissionBalance",
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(match),
    ]);

    const rows = users.map((user) => ({ ...user, preview: preview(user) }));

    // পুরো তালিকার যোগফল — শুধু এই পাতার নয়, তাই আলাদা করে গোনা
    const all = await User.find(match)
      .select(
        "referCommissionBalance depositCommissionBalance gameWinCommissionBalance gameLossCommissionBalance",
      )
      .lean();

    const totals = all.reduce(
      (sum, user) => {
        const row = preview(user);

        return {
          gross: sum.gross + row.gross,
          net: sum.net + row.net,
          pending: sum.pending + (row.gross !== 0 || row.gameWin !== 0 ? 1 : 0),
        };
      },
      { gross: 0, net: 0, pending: 0 },
    );

    return successResponse(res, "Affiliates loaded", {
      users: rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      totals: {
        gross: money(totals.gross),
        net: money(totals.net),
        pending: totals.pending,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** একজনের হিসাব মিলিয়ে ব্যালেন্সে বসানো */
router.post(
  "/adjust/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

      const user = await User.findOne({ _id: req.params.id, role: "aff-user" });

      if (!user) return errorResponse(res, "Affiliate not found", 404);

      const row = preview(user);

      if (row.gross === 0 && row.gameWin === 0) {
        return errorResponse(res, "Nothing to settle for this affiliate", 400);
      }

      user.balance = money(num(user.balance) + row.net);
      Object.assign(user, clearFields);
      await user.save();

      return successResponse(res, "Settled", {
        userId: user.userId,
        gross: row.gross,
        net: row.net,
        balance: user.balance,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/**
 * সবার হিসাব একসাথে মেলানো।
 *
 * একটা করে save না করে bulkWrite — শত শত অ্যাফিলিয়েট থাকলে একটার পর
 * একটা লেখা অনেক ধীর হত। যাদের কিছু জমেনি তারা বাদ পড়ে।
 */
router.post(
  "/adjust-all",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const users = await User.find(buildMatch(req.body?.q))
        .select(
          "userId referCommissionBalance depositCommissionBalance gameWinCommissionBalance gameLossCommissionBalance",
        )
        .lean();

      let settled = 0;
      let skipped = 0;
      let gross = 0;
      let net = 0;

      const ops = [];

      users.forEach((user) => {
        const row = preview(user);

        if (row.gross === 0 && row.gameWin === 0) {
          skipped += 1;
          return;
        }

        settled += 1;
        gross += row.gross;
        net += row.net;

        ops.push({
          updateOne: {
            filter: { _id: user._id, role: "aff-user" },
            update: { $inc: { balance: row.net }, $set: clearFields },
          },
        });
      });

      if (ops.length) await User.bulkWrite(ops, { ordered: false });

      return successResponse(res, "Settled", {
        settled,
        skipped,
        gross: money(gross),
        net: money(net),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
