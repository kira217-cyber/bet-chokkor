import express from "express";
import mongoose from "mongoose";

import WithdrawRequest from "../models/WithdrawRequest.js";
import WithdrawMethod from "../models/WithdrawMethod.js";
import EWallet from "../models/EWallet.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import { protectAdmin, requireWrite } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";
import { isOtpRequired, isVerified, clearOtp } from "../utils/otp.js";
import { verificationGate } from "./verificationRoutes.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

/**
 * এখন টাকা তোলা যাবে কিনা।
 *
 * দুটো কারণে আটকায় — আগের একটা আবেদন এখনো ঝুলে আছে, অথবা টার্নওভারের
 * শর্ত বাকি। দুটোই আলাদা করে বলা হয়, যাতে ব্যবহারকারী বুঝতে পারেন কী
 * করতে হবে।
 */
const checkEligibility = async (userId) => {
  // পরিচয় যাচাই সবার আগে — টার্নওভার বা ঝুলে থাকা আবেদনের কথা বলার
  // আগে এটাই বলা উচিত, কারণ এটা না হলে বাকিগুলো মিটিয়েও লাভ নেই
  const gate = await verificationGate(userId, "withdraw", "user");

  if (!gate.ok) {
    return {
      eligible: false,
      reason: "verification",
      verificationStatus: gate.status,
      remaining: 0,
    };
  }

  const pending = await WithdrawRequest.findOne({
    user: userId,
    status: "pending",
  }).sort({ createdAt: -1 });

  if (pending) {
    return {
      eligible: false,
      reason: "pendingWithdraw",
      pendingId: String(pending._id),
      pendingAmount: pending.amount,
      remaining: 0,
    };
  }

  const running = await TurnOver.find({ user: userId, status: "running" })
    .sort({ createdAt: 1 })
    .lean();

  if (!running.length) {
    return { eligible: true, reason: "", remaining: 0, turnovers: [] };
  }

  const remaining = running.reduce(
    (sum, item) => sum + Math.max(0, money(num(item.required) - num(item.progress))),
    0,
  );

  return {
    eligible: false,
    reason: "turnover",
    remaining: money(remaining),
    turnovers: running.map((item) => ({
      title: item.title || item.sourceType,
      required: item.required,
      progress: item.progress,
      remaining: Math.max(0, money(num(item.required) - num(item.progress))),
      percent: item.required
        ? Math.min(100, Math.round((num(item.progress) / num(item.required)) * 100))
        : 100,
    })),
  };
};

/* =========================
   ক্লায়েন্ট
   ========================= */

router.get("/eligibility", protectUser, async (req, res) => {
  try {
    return successResponse(res, "Eligibility checked", await checkEligibility(req.user._id));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * টাকা তোলার আবেদন।
 *
 * জমা দেওয়ার সাথে সাথেই ব্যালেন্স থেকে কেটে রাখা হয় — নইলে আবেদন ঝুলে
 * থাকা অবস্থায় সেই টাকা দিয়েই খেলে ফেলা যেত, আর অনুমোদনের সময় দেখা
 * যেত ব্যালেন্স নেই।
 */
router.post("/", protectUser, async (req, res) => {
  try {
    const methodId = text(req.body?.methodId).toUpperCase();
    const walletId = text(req.body?.walletId);
    const amount = money(num(req.body?.amount));

    if (!methodId) return errorResponse(res, "Choose a method", 400, "missingFields");
    if (!isId(walletId)) return errorResponse(res, "Choose a number", 400, "missingFields");
    if (amount <= 0) return errorResponse(res, "Enter a valid amount", 400, "missingFields");

    const eligibility = await checkEligibility(req.user._id);

    if (!eligibility.eligible) {
      const messages = {
        verification: "Please complete identity verification first",
        pendingWithdraw: "You already have a withdraw waiting for review",
      };

      const codes = {
        verification: "needVerification",
        pendingWithdraw: "pendingWithdraw",
      };

      return errorResponse(
        res,
        messages[eligibility.reason] ||
          `Turnover is not finished — ${eligibility.remaining} left`,
        400,
        codes[eligibility.reason] || "turnoverLeft",
      );
    }

    const method = await WithdrawMethod.findOne({ methodId, isActive: true });

    if (!method) return errorResponse(res, "This method is not available", 404);

    const min = num(method.minimumWithdrawAmount);
    const max = num(method.maximumWithdrawAmount);

    if (min > 0 && amount < min) {
      return errorResponse(res, `Minimum withdraw amount is ${min}`, 400);
    }

    if (max > 0 && amount > max) {
      return errorResponse(res, `Maximum withdraw amount is ${max}`, 400);
    }

    const wallet = await EWallet.findOne({
      _id: walletId,
      user: req.user._id,
      isActive: true,
    });

    if (!wallet) return errorResponse(res, "This number was not found", 404);

    // ব্যালেন্স আগে দেখা হয়, OTP এর পরে নয় — নইলে টাকা না থাকলেও
    // একটা OTP খরচ হয়ে যেত, আর তারপর "টাকা নেই" শুনতে হতো
    if (money(num(req.user.balance)) < amount) {
      return errorResponse(res, "Not enough balance", 400, "lowBalance");
    }

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

    // ব্যালেন্স atomic ভাবে কাটা — যথেষ্ট না থাকলে কিছুই ঘটে না, তাই
    // দুই ট্যাব থেকে একসাথে চেষ্টা করলেও একটার বেশি যাবে না
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { returnDocument: "after" },
    );

    if (!user) {
      return errorResponse(res, "Not enough balance", 400, "lowBalance");
    }

    const balanceBefore = money(num(user.balance) + amount);

    try {
      const request = await WithdrawRequest.create({
        user: user._id,
        userIdText: user.userId,
        methodId,
        wallet: wallet._id,
        walletSnapshot: {
          methodId,
          methodName: method.name,
          walletType: wallet.walletType,
          walletNumber: wallet.walletNumber,
          label: wallet.label,
        },
        amount,
        currency: user.currency || "BDT",
        balanceBefore,
        balanceAfter: money(user.balance),
        status: "pending",
      });

      return successResponse(
        res,
        "Withdraw request submitted",
        { request, balance: money(user.balance) },
        201,
      );
    } catch (error) {
      // রেকর্ড না বসলে কাটা টাকাটা ফিরিয়ে দেওয়া
      await User.updateOne({ _id: user._id }, { $inc: { balance: amount } });
      throw error;
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = { user: req.user._id };
    const status = text(req.query.status);

    if (["pending", "approved", "rejected"].includes(status)) filter.status = status;

    const [requests, total] = await Promise.all([
      WithdrawRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WithdrawRequest.countDocuments(filter),
    ]);

    return successResponse(res, "Withdraws loaded", {
      requests,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const status = text(req.query.status);

    if (["pending", "approved", "rejected"].includes(status)) filter.status = status;

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

    const [requests, total, counts] = await Promise.all([
      WithdrawRequest.find(filter)
        .populate("user", "userId phone balance isActive role")
        .populate("reviewedBy", "email role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      WithdrawRequest.countDocuments(filter),
      WithdrawRequest.aggregate([
        {
          $group: {
            _id: "$status",
            n: { $sum: 1 },
            amt: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // গণনা + টাকার অঙ্ক (Bajiman এর সারাংশ কার্ডের মতো)
    const summary = {
      pending: 0,
      approved: 0,
      rejected: 0,
      pendingAmount: 0,
      approvedAmount: 0,
      rejectedAmount: 0,
    };

    counts.forEach((row) => {
      const st = String(row._id || "").toLowerCase();
      summary[st] = row.n;

      if (st === "pending") summary.pendingAmount = row.amt || 0;
      else if (st === "approved") summary.approvedAmount = row.amt || 0;
      else if (st === "rejected") summary.rejectedAmount = row.amt || 0;
    });

    return successResponse(res, "Requests loaded", {
      requests,
      summary,
      meta: { page, limit, total },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * অনুমোদন।
 *
 * টাকা আগেই কেটে রাখা হয়েছিল, তাই এখানে ব্যালেন্সে কিছু করার নেই —
 * শুধু অবস্থাটা বদলায়। atomic দখল দিয়ে, যাতে দুবার চললেও একবারই হয়।
 */
router.patch("/admin/:id/approve", protectAdmin, requireWrite, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const request = await WithdrawRequest.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "approved",
          adminNote: text(req.body?.adminNote),
          reviewedBy: req.admin._id,
          approvedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    ).populate("user", "userId phone balance role");

    if (!request) {
      const exists = await WithdrawRequest.exists({ _id: req.params.id });

      return errorResponse(
        res,
        exists ? "Only a pending request can be approved" : "Request not found",
        exists ? 400 : 404,
      );
    }

    return successResponse(res, "Withdraw approved", { request });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * বাতিল — কেটে রাখা টাকাটা ব্যালেন্সে ফিরিয়ে দেওয়া হয়।
 */
router.patch("/admin/:id/reject", protectAdmin, requireWrite, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Invalid id", 400);

    const note = text(req.body?.adminNote);

    if (!note) {
      return errorResponse(res, "Write why it is rejected", 400);
    }

    const request = await WithdrawRequest.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: "rejected",
          adminNote: note,
          reviewedBy: req.admin._id,
          rejectedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!request) {
      const exists = await WithdrawRequest.exists({ _id: req.params.id });

      return errorResponse(
        res,
        exists ? "Only a pending request can be rejected" : "Request not found",
        exists ? 400 : 404,
      );
    }

    const user = await User.findOneAndUpdate(
      { _id: request.user },
      { $inc: { balance: request.amount } },
      { returnDocument: "after" },
    );

    return successResponse(res, "Withdraw rejected, money returned", {
      request,
      balance: money(user?.balance),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
