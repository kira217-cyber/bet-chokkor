import express from "express";
import axios from "axios";

import upload from "../config/multer.js";
import AutoWithdrawSetting from "../models/AutoWithdrawSetting.js";
import AutoWithdraw from "../models/AutoWithdraw.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";
import { isOtpRequired, isVerified, clearOtp } from "../utils/otp.js";
import { verificationGate } from "./verificationRoutes.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

const langText = (input = {}) => ({
  bn: text(input?.bn),
  en: text(input?.en),
});

const ALLOWED = ["bkash", "nagad", "rocket", "upay"];

const GATEWAY_URL =
  process.env.OPAY_WITHDRAW_URL ||
  "https://api.oraclepay.org/api/opay-business/auto-withdraw";

/** অ্যাডমিন থেকে পাঠানো মাধ্যমের তালিকা পরিষ্কার করা */
const cleanMethods = (list) => {
  if (!Array.isArray(list)) return null;

  return list
    .map((item, index) => ({
      ...(item?._id ? { _id: item._id } : {}),
      code: text(item?.code).toLowerCase(),
      name: langText(item?.name),
      logoUrl: text(item?.logoUrl),
      active: item?.active !== false,
      order: Math.max(0, num(item?.order ?? index)),
      minAmount: Math.max(0, num(item?.minAmount)),
      maxAmount: Math.max(0, num(item?.maxAmount)),
    }))
    .filter((item) => ALLOWED.includes(item.code));
};

/**
 * এখন অটো উইথড্র করা যাবে কিনা।
 *
 * পরিচয় যাচাই → ঝুলে থাকা আবেদন → টার্নওভার — এই ক্রমে দেখা হয়, যাতে
 * ব্যবহারকারী বোঝেন আগে কোনটা মেটাতে হবে।
 */
const checkEligibility = async (userId) => {
  const gate = await verificationGate(userId, "withdraw", "user");

  if (!gate.ok) {
    return { eligible: false, reason: "verification", remaining: 0 };
  }

  const pending = await AutoWithdraw.findOne({
    user: userId,
    status: { $in: ["PENDING", "PROCESSING"] },
  }).sort({ createdAt: -1 });

  if (pending) {
    return {
      eligible: false,
      reason: "pendingWithdraw",
      pendingId: String(pending._id),
      remaining: 0,
    };
  }

  const running = await TurnOver.find({ user: userId, status: "running" })
    .sort({ createdAt: 1 })
    .lean();

  if (!running.length) return { eligible: true, reason: "", remaining: 0 };

  const remaining = running.reduce(
    (sum, item) =>
      sum + Math.max(0, money(num(item.required) - num(item.progress))),
    0,
  );

  return { eligible: false, reason: "turnover", remaining: money(remaining) };
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/** অটো উইথড্র চালু আছে কিনা আর কোন মাধ্যমগুলো */
router.get("/status", async (req, res) => {
  try {
    const setting = await AutoWithdrawSetting.current();
    const ready = setting.active && Boolean(setting.businessToken);

    return successResponse(res, "Auto withdraw status", {
      active: ready,
      minAmount: setting.minAmount,
      maxAmount: setting.maxAmount,
      methods: ready
        ? (setting.methods || [])
            .filter((method) => method.active !== false)
            .sort((a, b) => num(a.order) - num(b.order))
            .map((method) => ({
              code: method.code,
              name: method.name,
              logoUrl: method.logoUrl,
              minAmount: method.minAmount,
              maxAmount: method.maxAmount,
            }))
        : [],
    });
  } catch {
    return successResponse(res, "Auto withdraw unavailable", {
      active: false,
      methods: [],
    });
  }
});

router.get("/eligibility", protectUser, async (req, res) => {
  try {
    return successResponse(
      res,
      "Eligibility checked",
      await checkEligibility(req.user._id),
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * অটো উইথড্রয়ের আবেদন।
 *
 * ম্যানুয়ালের মতোই — জমা দেওয়ার সাথে সাথেই ব্যালেন্স কেটে রাখা হয়,
 * তারপর গেটওয়েতে পাঠানো হয়। গেটওয়ে পাঠাতে না পারলে টাকা ফেরত।
 */
router.post("/create", protectUser, async (req, res) => {
  try {
    const setting = await AutoWithdrawSetting.current();

    if (!setting.active || !setting.businessToken) {
      return errorResponse(res, "Auto withdraw is off right now", 400);
    }

    const methodCode = text(req.body?.paymentMethod).toLowerCase();
    const walletNumber = text(req.body?.accountNumber);
    const amount = money(num(req.body?.amount));

    if (!ALLOWED.includes(methodCode)) {
      return errorResponse(res, "Choose a valid method", 400, "missingFields");
    }
    if (!walletNumber) {
      return errorResponse(res, "Enter the wallet number", 400, "missingFields");
    }
    if (amount <= 0) {
      return errorResponse(res, "Enter a valid amount", 400, "missingFields");
    }

    const method = (setting.methods || []).find(
      (item) => item.code === methodCode && item.active !== false,
    );

    if (!method) return errorResponse(res, "This method is not available", 404);

    // মাধ্যম-নির্দিষ্ট সীমা না থাকলে সামগ্রিক সীমা খাটে
    const min = num(method.minAmount) || num(setting.minAmount);
    const max = num(method.maxAmount) || num(setting.maxAmount);

    if (min > 0 && amount < min) {
      return errorResponse(res, `Minimum is ${min}`, 400);
    }
    if (max > 0 && amount > max) {
      return errorResponse(res, `Maximum is ${max}`, 400);
    }

    const eligibility = await checkEligibility(req.user._id);

    if (!eligibility.eligible) {
      const messages = {
        verification: "Please complete identity verification first",
        pendingWithdraw: "You already have a withdraw waiting",
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

    // ব্যালেন্স atomic ভাবে কাটা — যথেষ্ট না থাকলে কিছুই ঘটে না
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { returnDocument: "after" },
    );

    if (!user) return errorResponse(res, "Not enough balance", 400, "lowBalance");

    const balanceBefore = money(num(user.balance) + amount);

    let record;
    try {
      record = await AutoWithdraw.create({
        user: user._id,
        userIdText: user.userId,
        amount,
        currency: user.currency || "BDT",
        paymentMethod: methodCode,
        userIdentityAddress: walletNumber,
        accountNumber: walletNumber,
        status: "PENDING",
        balanceBefore,
        balanceAfter: money(user.balance),
      });
    } catch (error) {
      // রেকর্ড না বসলে কাটা টাকা ফেরত
      await User.updateOne({ _id: user._id }, { $inc: { balance: amount } });
      throw error;
    }

    // গেটওয়েতে পাঠানো
    const server = (process.env.PUBLIC_SERVER_URL || "").replace(/\/+$/, "");

    try {
      const { data } = await axios.post(
        GATEWAY_URL,
        {
          amount,
          payment_method: methodCode,
          user_identity_address: walletNumber,
          account_number: walletNumber,
          callback_url: `${server}/api/auto-withdraw/webhook`,
          checkout_items: [
            { userId: user.userId },
            { withdrawal_type: "user" },
          ],
        },
        {
          timeout: 20000,
          headers: {
            "X-Opay-Business-Token": String(setting.businessToken || "").trim(),
            "Content-Type": "application/json",
          },
        },
      );

      if (!data?.success || !data?.data?.withdrawal_id) {
        throw new Error(data?.message || "Gateway did not accept the request");
      }

      const info = data.data;

      record.withdrawalId = text(info.withdrawal_id);
      record.feePercentage = num(info.fee_percentage);
      record.feeAmount = money(info.fee_amount);
      record.deductedAmount = money(info.deducted_amount);
      record.status = "PENDING";
      await record.save();

      if (setting.lastError) {
        setting.lastError = "";
        await setting.save();
      }

      return successResponse(res, "Auto withdraw submitted", {
        withdrawalId: record.withdrawalId,
        amount,
        balance: money(user.balance),
        status: record.status,
      });
    } catch (gatewayError) {
      // গেটওয়ে না নিলে টাকা ফেরত ও রেকর্ড বাতিল
      await User.updateOne({ _id: user._id }, { $inc: { balance: amount } });

      record.status = "REJECTED";
      record.refunded = true;
      record.reason =
        gatewayError?.response?.data?.message || gatewayError.message;
      record.balanceAfter = money(num(user.balance) + amount);
      await record.save();

      setting.lastError =
        gatewayError?.response?.data?.message || gatewayError.message;
      await setting.save();

      return errorResponse(res, "Could not reach the payment gateway", 502);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নিজের অটো উইথড্রয়ের ইতিহাস */
router.get("/history/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const status = text(req.query.status).toUpperCase();

    if (["PENDING", "PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
      filter.status = status;
    }

    const [withdrawals, total] = await Promise.all([
      AutoWithdraw.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AutoWithdraw.countDocuments(filter),
    ]);

    return successResponse(res, "Auto withdrawals loaded", {
      withdrawals,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await AutoWithdrawSetting.current();

    return successResponse(res, "Auto withdraw setting loaded", {
      setting: setting.toSafeJSON(),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const setting = await AutoWithdrawSetting.current();
      const body = req.body || {};

      // খালি পাঠালে আগের টোকেনটাই থাকে
      if (text(body.businessToken)) {
        setting.businessToken = text(body.businessToken);
      }

      if (typeof body.active === "boolean") setting.active = body.active;

      if (body.minAmount !== undefined) {
        setting.minAmount = Math.max(1, num(body.minAmount));
      }
      if (body.maxAmount !== undefined) {
        setting.maxAmount = Math.max(0, num(body.maxAmount));
      }
      if (body.feePercent !== undefined) {
        setting.feePercent = Math.max(0, num(body.feePercent));
      }

      const methods = cleanMethods(body.methods);
      if (methods) setting.methods = methods;

      await setting.save();

      return successResponse(res, "Auto withdraw setting saved", {
        setting: setting.toSafeJSON(),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** মাধ্যমের লোগো আপলোড — অটো ডিপোজিটের মতোই */
router.post(
  "/upload-logo",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("logo"),
  (req, res) => {
    if (!req.file) return errorResponse(res, "Choose an image", 400);

    return successResponse(res, "Logo uploaded", {
      logoUrl: `/uploads/${req.file.filename}`,
    });
  },
);

router.get("/withdrawals/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const status = text(req.query.status).toUpperCase();

    if (["PENDING", "PROCESSING", "COMPLETED", "REJECTED"].includes(status)) {
      filter.status = status;
    }

    const search = text(req.query.q);
    if (search) filter.userIdText = { $regex: search, $options: "i" };

    const [withdrawals, total, counts] = await Promise.all([
      AutoWithdraw.find(filter)
        .populate("user", "userId phone balance role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AutoWithdraw.countDocuments(filter),
      AutoWithdraw.aggregate([
        {
          $group: {
            _id: "$status",
            n: { $sum: 1 },
            amt: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // গণনা + টাকার অঙ্ক — Bajiman এর সারাংশ কার্ডের মতো
    const summary = {
      PENDING: 0,
      PROCESSING: 0,
      COMPLETED: 0,
      REJECTED: 0,
      pendingAmount: 0,
      processingAmount: 0,
      completedAmount: 0,
      rejectedAmount: 0,
    };

    const amountKey = {
      PENDING: "pendingAmount",
      PROCESSING: "processingAmount",
      COMPLETED: "completedAmount",
      REJECTED: "rejectedAmount",
    };

    counts.forEach((row) => {
      const st = String(row._id || "").toUpperCase();
      summary[st] = row.n;
      if (amountKey[st]) summary[amountKey[st]] = money(row.amt);
    });

    return successResponse(res, "Auto withdrawals loaded", {
      withdrawals,
      summary,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * একটা REJECTED অটো উইথড্র থেকে টাকা ফেরত।
 *
 * `refunded: false` শর্তে atomic দখল নিয়েই ফেরত হয়, তাই একই REJECTED
 * webhook দুবার এলেও (বা webhook + ম্যানুয়াল) টাকা একবারই ফেরে।
 */
const refundWithdraw = async (withdrawalId, patch = {}) => {
  const record = await AutoWithdraw.findOneAndUpdate(
    { withdrawalId, refunded: false },
    { $set: { status: "REJECTED", refunded: true, ...patch } },
    { returnDocument: "after" },
  );

  if (!record) return null;

  const user = await User.findById(record.user);

  if (user) {
    user.balance = money(num(user.balance) + num(record.amount));
    await user.save();
  }

  return record;
};

/**
 * গেটওয়ের webhook (OraclePay Auto Withdrawal)।
 *
 * তিন ইভেন্ট: PROCESSING → COMPLETED (proof_images সহ) → REJECTED (তখন
 * টাকা ফেরত)। webhook এ টোকেন আসে না, তাই withdrawal_id আমাদের রেকর্ডের
 * সাথে মেলে কিনা দেখে নিরাপত্তা রাখা হয়।
 */
router.post("/webhook", async (req, res) => {
  try {
    const withdrawalId = text(req.body?.withdrawal_id);
    const status = text(req.body?.status).toUpperCase();

    if (!withdrawalId) {
      return errorResponse(res, "withdrawal_id is required", 400);
    }

    const existing = await AutoWithdraw.findOne({ withdrawalId });

    if (!existing) return errorResponse(res, "Unknown withdrawal", 404);

    if (status === "PROCESSING") {
      await AutoWithdraw.updateOne(
        { withdrawalId, status: { $in: ["PENDING"] } },
        { $set: { status: "PROCESSING" } },
      );

      return successResponse(res, "Processing recorded");
    }

    if (status === "COMPLETED") {
      const proofImages = Array.isArray(req.body?.proof_images)
        ? req.body.proof_images.map((url) => text(url)).filter(Boolean)
        : [];

      await AutoWithdraw.updateOne(
        { withdrawalId, status: { $in: ["PENDING", "PROCESSING"] } },
        {
          $set: {
            status: "COMPLETED",
            proofImages,
            completedAt: new Date(),
          },
        },
      );

      return successResponse(res, "Completed recorded");
    }

    if (status === "REJECTED") {
      await refundWithdraw(withdrawalId, {
        reason: text(req.body?.reason) || "Rejected by gateway",
      });

      return successResponse(res, "Rejected and refunded");
    }

    return errorResponse(res, "Unknown status", 400);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * অ্যাডমিন ম্যানুয়ালি একটা ঝুলে থাকা উইথড্র বাতিল করে টাকা ফেরত দেয়।
 *
 * গেটওয়ে থেকে কোনো কারণে চূড়ান্ত খবর না এলে অ্যাডমিন হাতে বাতিল করতে
 * পারে — টাকা খেলোয়াড়ের কাছে ফিরে যায়।
 */
router.post(
  "/withdrawals/:id/reject",
  protectAdmin,
  requireWrite,
  async (req, res) => {
    try {
      const record = await AutoWithdraw.findById(req.params.id);

      if (!record) return errorResponse(res, "Withdrawal not found", 404);

      if (!["PENDING", "PROCESSING"].includes(record.status)) {
        return errorResponse(res, "Only a waiting withdrawal can be rejected", 400);
      }

      const refunded = await refundWithdraw(record.withdrawalId || "", {
        reason: text(req.body?.note) || "Rejected by administrator",
        reviewedBy: req.admin?._id || null,
        reviewNote: text(req.body?.note),
      });

      // withdrawalId খালি থাকলে (গেটওয়ে অ্যাকসেপ্টই করেনি) সরাসরি রেকর্ডে
      if (!refunded) {
        if (record.refunded) {
          return errorResponse(res, "Already refunded", 400);
        }

        record.status = "REJECTED";
        record.refunded = true;
        record.reason = text(req.body?.note) || "Rejected by administrator";
        record.reviewedBy = req.admin?._id || null;
        await record.save();

        await User.updateOne(
          { _id: record.user },
          { $inc: { balance: money(record.amount) } },
        );
      }

      return successResponse(res, "Withdrawal rejected and refunded");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
