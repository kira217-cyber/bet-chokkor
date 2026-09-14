import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import DepositMethod from "../models/DepositMethod.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import DepositRequest from "../models/DepositRequest.js";
import TurnOver from "../models/TurnOver.js";

import { protectAdmin, requireWrite } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { buildDepositCalc, num, money } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

/** ব্যবহারকারী খোঁজা — আইডি বা ফোন দিয়ে */
router.get("/users", protectAdmin, async (req, res) => {
  try {
    const search = text(req.query.q);

    if (!search) return successResponse(res, "Type to search", { users: [] });

    const users = await User.find({
      role: "user",
      $or: [
        { userId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    })
      .select("_id userId phone balance currency isActive")
      .limit(20)
      .lean();

    return successResponse(res, "Users loaded", { users });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * কোন মেথডে কোন চ্যানেল ও প্রোমো আছে।
 *
 * অ্যাডমিন যেন ব্যবহারকারীর দেখা একই তালিকা থেকেই বেছে নিতে পারেন,
 * নইলে হাতে জমা করা টাকার বোনাস-হিসাব আলাদা হয়ে যেত।
 */
router.get("/options", protectAdmin, async (req, res) => {
  try {
    const methods = await DepositMethod.find({ isActive: true })
      .sort({ sort: 1, createdAt: 1 })
      .lean();

    const configs = await DepositBonusTurnover.find({
      depositMethod: { $in: methods.map((m) => m._id) },
    }).lean();

    const configMap = new Map(
      configs.map((item) => [String(item.depositMethod), item]),
    );

    const data = methods.map((method) => {
      const config = configMap.get(String(method._id)) || {};

      return {
        ...method,
        turnoverMultiplier: num(config.turnoverMultiplier ?? 1),
        channels: (config.channels || []).filter((c) => c.isActive !== false),
        promotions: (config.promotions || []).filter((p) => p.isActive !== false),
      };
    });

    return successResponse(res, "Options loaded", { methods: data });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * অ্যাডমিন সরাসরি টাকা জমা করে।
 *
 * একই DepositRequest ডকুমেন্টই তৈরি হয়, শুধু সাথে সাথেই approved —
 * তাই ব্যবহারকারীর ইতিহাসে দুই রকম রেকর্ড থাকে না।
 */
router.post("/credit", protectAdmin, requireWrite, async (req, res) => {
  let createdRequestId = null;
  let creditedUserId = null;
  let creditedAmount = 0;
  let affiliateId = null;
  let affiliateAmount = 0;

  try {
    const body = req.body || {};

    if (!isId(body.userId)) return errorResponse(res, "Choose a user", 400);

    const amount = money(num(body.amount));

    if (amount <= 0) return errorResponse(res, "Enter a valid amount", 400);

    const methodId = text(body.methodId).toLowerCase();
    const channelId = text(body.channelId);

    if (!methodId || !channelId) {
      return errorResponse(res, "Choose a method and a channel", 400);
    }

    const user = await User.findOne({ _id: body.userId, role: "user" });

    if (!user) return errorResponse(res, "User not found", 404);
    if (!user.isActive) return errorResponse(res, "This account is disabled", 403);

    const method = await DepositMethod.findOne({ methodId, isActive: true });

    if (!method) return errorResponse(res, "This method is not available", 404);

    const min = num(method.minDepositAmount);
    const max = num(method.maxDepositAmount);

    if (min > 0 && amount < min) {
      return errorResponse(res, `Minimum deposit amount is ${min}`, 400);
    }

    if (max > 0 && amount > max) {
      return errorResponse(res, `Maximum deposit amount is ${max}`, 400);
    }

    const built = await buildDepositCalc({
      user,
      method,
      channelId,
      promoId: text(body.promoId) || "none",
      amount,
    });

    if (built.error) return errorResponse(res, built.error, 400);

    const request = await DepositRequest.create({
      user: user._id,
      methodId: method.methodId,
      channelId,
      promoId: text(body.promoId) || "none",
      amount,
      fields: {
        source: "admin_manual_credit",
        adminId: String(req.admin._id),
        adminEmail: req.admin.email || "",
      },
      calc: built.calc,
      status: "approved",
      adminNote: text(body.adminNote),
      approvedBy: req.admin._id,
      approvedAt: new Date(),
      display: {
        ...built.display,
        userId: user.userId,
        source: "Admin Manual Deposit",
      },
    });

    createdRequestId = request._id;

    creditedAmount = money(built.calc.creditedAmount);

    user.balance = money(num(user.balance) + creditedAmount);
    await user.save();

    creditedUserId = user._id;

    const commission = built.calc.affiliateDepositCommission || {};
    const commissionAmount = money(commission.commissionAmount);

    if (commissionAmount > 0 && commission.affiliatorId) {
      const affiliator = await User.findById(commission.affiliatorId);

      if (affiliator) {
        affiliator.depositCommissionBalance = money(
          num(affiliator.depositCommissionBalance) + commissionAmount,
        );
        await affiliator.save();

        affiliateId = affiliator._id;
        affiliateAmount = commissionAmount;
      }
    }

    const targetTurnover = money(built.calc.targetTurnover);

    if (targetTurnover > 0) {
      await TurnOver.findOneAndUpdate(
        {
          user: user._id,
          sourceType: "admin-manual-deposit",
          sourceId: request._id,
        },
        {
          user: user._id,
          sourceType: "admin-manual-deposit",
          sourceId: request._id,
          title: `Admin deposit ${amount}`,
          required: targetTurnover,
          creditedAmount,
          status: "running",
          eligibleProviders: built.calc.eligibleProviders || [],
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );
    }

    return successResponse(
      res,
      "Balance added",
      { request, balance: user.balance },
      201,
    );
  } catch (error) {
    // মাঝপথে ভাঙলে যা যা হয়েছিল ফিরিয়ে দেওয়া হয়, নইলে টাকা গিয়ে
    // রেকর্ড থেকে যেত বা উল্টোটা
    if (affiliateId && affiliateAmount > 0) {
      await User.updateOne(
        { _id: affiliateId },
        { $inc: { depositCommissionBalance: -affiliateAmount } },
      ).catch(() => {});
    }

    if (creditedUserId && creditedAmount > 0) {
      await User.updateOne(
        { _id: creditedUserId },
        { $inc: { balance: -creditedAmount } },
      ).catch(() => {});
    }

    if (createdRequestId) {
      await Promise.all([
        DepositRequest.deleteOne({ _id: createdRequestId }),
        TurnOver.deleteOne({
          sourceType: "admin-manual-deposit",
          sourceId: createdRequestId,
        }),
      ]).catch(() => {});
    }

    return errorResponse(res, error.message || "Failed to add balance", 400);
  }
});

export default router;
