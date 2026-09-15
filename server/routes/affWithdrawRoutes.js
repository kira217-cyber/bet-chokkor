import express from "express";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import AffWithdrawMethod from "../models/AffWithdrawMethod.js";
import AffWithdrawRequest from "../models/AffWithdrawRequest.js";
import AffWithdrawSetting from "../models/AffWithdrawSetting.js";
import User from "../models/User.js";

import upload from "../config/multer.js";
import { protectUser } from "../middleware/protectUser.js";
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

const parseMaybeJSON = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const removeLogo = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  fs.promises.unlink(path.join("uploads", path.basename(url))).catch(() => {});
};

const onlyAffiliate = (req, res, next) => {
  if (req.user?.role !== "aff-user") {
    return errorResponse(res, "This area is for affiliates", 403, "notAffiliate");
  }

  return next();
};

const langText = (input = {}) => ({
  bn: text(input?.bn),
  en: text(input?.en),
});

/** অ্যাডমিনের দেওয়া ঘরগুলো পরিষ্কার করা */
const cleanFields = (list) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => ({
      key: text(item?.key).replace(/[^a-zA-Z0-9_]/g, ""),
      label: langText(item?.label),
      placeholder: langText(item?.placeholder),
      type: ["text", "number", "tel", "email"].includes(item?.type)
        ? item.type
        : "text",
      required: item?.required !== false,
    }))
    .filter((item) => item.key && (item.label.bn || item.label.en));
};

/**
 * ব্যবহারকারীর ভরা ঘরগুলো যাচাই।
 *
 * অ্যাডমিন যে ঘরগুলো চেয়েছেন শুধু সেগুলোই রাখা হয় — ব্রাউজার থেকে
 * বাড়তি কিছু পাঠালে সেটা চুপচাপ বাদ যায়।
 */
const collectFields = (method, input = {}) => {
  const values = {};
  const problems = [];

  for (const field of method.fields || []) {
    const value = text(input?.[field.key]);

    if (!value) {
      if (field.required) {
        problems.push(field.label.en || field.label.bn || field.key);
      }

      continue;
    }

    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      problems.push(`${field.label.en || field.key} is not a valid email`);
      continue;
    }

    values[field.key] = value;
  }

  return { values, problems };
};

/* =========================
   উপায় — সবাই দেখতে পায়
   ========================= */

router.get("/methods/public", async (req, res) => {
  try {
    const [methods, setting] = await Promise.all([
      AffWithdrawMethod.find({ isActive: true })
        .sort({ sort: 1, createdAt: 1 })
        .lean(),
      AffWithdrawSetting.current(),
    ]);

    return successResponse(res, "Methods loaded", {
      methods,
      setting: {
        requiredActiveReferrals: setting.requiredActiveReferrals,
        requireSettledCommission: setting.requireSettledCommission,
        note: setting.note,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাফিলিয়েট
   ========================= */

/**
 * এখন তোলা যাবে কিনা, না গেলে কেন।
 *
 * শর্তগুলো ক্রম মেনে দেখা হয়, আর প্রথম যেটায় আটকায় সেটাই বলা হয় —
 * একসাথে সব সমস্যা দেখালে কোনটা আগে ঠিক করতে হবে বোঝা যেত না।
 */
const checkEligibility = async (user) => {
  const setting = await AffWithdrawSetting.current();

  const needed = num(setting.requiredActiveReferrals);

  const activeReferrals = await User.countDocuments({
    referredBy: user._id,
    role: "user",
    isActive: true,
  });

  const base = {
    requiredActiveReferrals: needed,
    activeReferrals,
    balance: money(user.balance),
  };

  if (activeReferrals < needed) {
    return {
      ...base,
      eligible: false,
      reason: "referrals",
      remainingReferrals: needed - activeReferrals,
    };
  }

  // জমে থাকা কমিশন থাকলে আগে অ্যাডমিনের মেলানো দরকার
  if (setting.requireSettledCommission) {
    const unsettled =
      num(user.referCommissionBalance) +
      num(user.depositCommissionBalance) +
      num(user.gameWinCommissionBalance) +
      num(user.gameLossCommissionBalance);

    if (unsettled > 0) {
      return { ...base, eligible: false, reason: "unsettled", unsettled: money(unsettled) };
    }
  }

  const pending = await AffWithdrawRequest.countDocuments({
    user: user._id,
    status: "pending",
  });

  if (pending > 0) {
    return { ...base, eligible: false, reason: "pending" };
  }

  if (money(user.balance) <= 0) {
    return { ...base, eligible: false, reason: "noBalance" };
  }

  return { ...base, eligible: true, reason: "" };
};

router.get("/eligibility", protectUser, onlyAffiliate, async (req, res) => {
  try {
    return successResponse(res, "Eligibility checked", await checkEligibility(req.user));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post("/", protectUser, onlyAffiliate, async (req, res) => {
  try {
    const methodId = text(req.body?.methodId).toUpperCase();
    const amount = money(num(req.body?.amount));

    if (!methodId) return errorResponse(res, "Choose a method", 400, "missingFields");
    if (amount <= 0) return errorResponse(res, "Enter a valid amount", 400, "missingFields");

    const eligibility = await checkEligibility(req.user);

    if (!eligibility.eligible) {
      const messages = {
        referrals: `You need ${eligibility.remainingReferrals} more active player(s)`,
        unsettled: "Your commission has to be settled by an admin first",
        pending: "You already have a withdraw waiting for review",
        noBalance: "Not enough balance",
      };

      return errorResponse(
        res,
        messages[eligibility.reason] || "You cannot withdraw right now",
        400,
        eligibility.reason === "pending" ? "pendingWithdraw" : "notEligible",
      );
    }

    const method = await AffWithdrawMethod.findOne({ methodId, isActive: true });

    if (!method) return errorResponse(res, "This method is not available", 404);

    const min = num(method.minimumWithdrawAmount);
    const max = num(method.maximumWithdrawAmount);

    if (min > 0 && amount < min) {
      return errorResponse(res, `Minimum withdraw amount is ${min}`, 400);
    }

    if (max > 0 && amount > max) {
      return errorResponse(res, `Maximum withdraw amount is ${max}`, 400);
    }

    const { values, problems } = collectFields(method, req.body?.fields);

    if (problems.length) {
      return errorResponse(res, `Please fill in: ${problems.join(", ")}`, 400, "missingFields");
    }

    const balanceBefore = money(req.user.balance);

    if (balanceBefore < amount) {
      return errorResponse(res, "Not enough balance", 400, "lowBalance");
    }

    /*
     * টাকাটা এখনই কেটে রাখা — শর্ত সহ, যাতে দুটো অনুরোধ একসাথে এলেও
     * ব্যালেন্সের বেশি বেরিয়ে না যায়।
     */
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { returnDocument: "after" },
    );

    if (!user) return errorResponse(res, "Not enough balance", 400, "lowBalance");

    try {
      const request = await AffWithdrawRequest.create({
        user: user._id,
        userIdText: user.userId,
        methodId,
        methodSnapshot: { name: method.name, fields: method.fields },
        fields: values,
        amount,
        balanceBefore,
        balanceAfter: money(user.balance),
      });

      return successResponse(res, "Withdraw submitted", { request }, 201);
    } catch (error) {
      // সারিটা বসাতে না পারলে কেটে রাখা টাকা ফেরত — নইলে টাকাটা
      // কোথাও না গিয়েই উধাও হয়ে যেত
      await User.updateOne({ _id: user._id }, { $inc: { balance: amount } });
      throw error;
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.get("/my", protectUser, onlyAffiliate, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const status = text(req.query.status);

    if (["pending", "approved", "rejected"].includes(status)) filter.status = status;

    const [requests, total] = await Promise.all([
      AffWithdrawRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AffWithdrawRequest.countDocuments(filter),
    ]);

    return successResponse(res, "Withdraws loaded", {
      requests,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন — উপায়
   ========================= */

router.get("/admin/methods", protectAdmin, async (req, res) => {
  try {
    const methods = await AffWithdrawMethod.find()
      .sort({ sort: 1, createdAt: 1 })
      .lean();

    return successResponse(res, "Methods loaded", { methods });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const saveMethod = async (req, res, existing) => {
  const body = req.body || {};

  const methodId = text(body.methodId).toUpperCase();
  const name = langText(parseMaybeJSON(body.name, {}));

  if (!existing && !methodId) {
    return errorResponse(res, "Method id is required", 400);
  }

  if (!name.bn && !name.en) {
    return errorResponse(res, "Name is required", 400);
  }

  const method = existing || new AffWithdrawMethod({ methodId });

  if (methodId) method.methodId = methodId;

  method.name = name;
  method.minimumWithdrawAmount = Math.max(0, num(body.minimumWithdrawAmount));
  method.maximumWithdrawAmount = Math.max(0, num(body.maximumWithdrawAmount));
  method.sort = num(body.sort);

  if (body.isActive !== undefined) {
    method.isActive = body.isActive === true || body.isActive === "true";
  }

  const fields = cleanFields(parseMaybeJSON(body.fields, []));

  if (!fields.length) {
    return errorResponse(res, "Add at least one field to fill in", 400);
  }

  method.fields = fields;

  if (req.file) {
    removeLogo(method.logoUrl);
    method.logoUrl = `/uploads/${req.file.filename}`;
  }

  await method.save();

  return successResponse(res, existing ? "Method updated" : "Method added", {
    method,
  });
};

router.post(
  "/admin/methods",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("logo"),
  async (req, res) => {
    try {
      const methodId = text(req.body?.methodId).toUpperCase();

      if (methodId && (await AffWithdrawMethod.exists({ methodId }))) {
        return errorResponse(res, "This method id already exists", 409);
      }

      return await saveMethod(req, res, null);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/methods/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("logo"),
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Bad id", 400);

      const method = await AffWithdrawMethod.findById(req.params.id);

      if (!method) return errorResponse(res, "Method not found", 404);

      return await saveMethod(req, res, method);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/methods/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      if (!isId(req.params.id)) return errorResponse(res, "Bad id", 400);

      const method = await AffWithdrawMethod.findByIdAndDelete(req.params.id);

      if (!method) return errorResponse(res, "Method not found", 404);

      removeLogo(method.logoUrl);

      return successResponse(res, "Method removed", {});
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — সেটিং
   ========================= */

router.get("/admin/setting", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await AffWithdrawSetting.current();
    return successResponse(res, "Setting loaded", { setting });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin/setting",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const setting = await AffWithdrawSetting.current();

      if (req.body?.requiredActiveReferrals !== undefined) {
        setting.requiredActiveReferrals = Math.max(
          0,
          num(req.body.requiredActiveReferrals),
        );
      }

      if (req.body?.requireSettledCommission !== undefined) {
        setting.requireSettledCommission = Boolean(
          req.body.requireSettledCommission,
        );
      }

      if (req.body?.note) setting.note = langText(req.body.note);

      await setting.save();

      return successResponse(res, "Setting saved", { setting });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — আবেদন
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
      filter.userIdText = {
        $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        $options: "i",
      };
    }

    const [requests, total, counts, sums] = await Promise.all([
      AffWithdrawRequest.find(filter)
        .populate("user", "userId phone balance role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AffWithdrawRequest.countDocuments(filter),
      AffWithdrawRequest.aggregate([
        { $group: { _id: "$status", n: { $sum: 1 } } },
      ]),
      AffWithdrawRequest.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    return successResponse(res, "Withdraws loaded", {
      requests,
      summary: {
        amount: money(sums[0]?.total || 0),
        ...counts.reduce((acc, item) => ({ ...acc, [item._id]: item.n }), {
          pending: 0,
          approved: 0,
          rejected: 0,
        }),
      },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * অনুমোদন বা বাতিল।
 *
 * ঝুলে থাকা আবেদনটাই একবারে দাবি করা হয়, তাই দুজন অ্যাডমিন একসাথে
 * চাপলেও দ্বিতীয়জন খালি হাতে ফেরেন — টাকা দুবার ফেরত যায় না।
 */
const review = (nextStatus) => async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Bad id", 400);

    const note = text(req.body?.note);

    if (nextStatus === "rejected" && !note) {
      return errorResponse(res, "Please say why it was rejected", 400);
    }

    const claimed = await AffWithdrawRequest.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: nextStatus,
          adminNote: note,
          reviewedBy: req.admin._id,
          ...(nextStatus === "approved"
            ? { approvedAt: new Date() }
            : { rejectedAt: new Date() }),
        },
      },
      { returnDocument: "after" },
    );

    if (!claimed) {
      return errorResponse(res, "Already reviewed or not found", 409);
    }

    // বাতিল হলে কেটে রাখা টাকা ফেরত
    if (nextStatus === "rejected") {
      await User.updateOne(
        { _id: claimed.user },
        { $inc: { balance: claimed.amount } },
      );
    }

    return successResponse(res, `Withdraw ${nextStatus}`, { request: claimed });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

router.patch("/admin/:id/approve", protectAdmin, requireWrite, review("approved"));
router.patch("/admin/:id/reject", protectAdmin, requireWrite, review("rejected"));

export default router;
