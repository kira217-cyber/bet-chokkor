import express from "express";
import axios from "axios";

import upload from "../config/multer.js";
import AutoDepositToken from "../models/AutoDepositToken.js";
import AutoDeposit from "../models/AutoDeposit.js";
import TurnOver from "../models/TurnOver.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { verificationGate } from "./verificationRoutes.js";
import {
  num,
  money,
  sumPercent,
  getAffiliateDepositCommission,
} from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

const langText = (input = {}) => ({
  bn: text(input?.bn),
  en: text(input?.en),
});

const cleanProviders = (list) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => ({
      providerCode: text(item?.providerCode).toUpperCase(),
      percent: Math.min(100, Math.max(0, num(item?.percent ?? 100))),
    }))
    .filter((item) => item.providerCode);
};

/** অ্যাডমিন থেকে পাঠানো পেমেন্ট মাধ্যমের তালিকা পরিষ্কার করা */
const cleanMethods = (list) => {
  if (!Array.isArray(list)) return null;

  return list
    .map((item, index) => ({
      ...(item?._id ? { _id: item._id } : {}),
      code: text(item?.code).toLowerCase(),
      name: langText(item?.name),
      logoUrl: text(item?.logoUrl),
      active: item?.active !== false,
      manual: Boolean(item?.manual),
      order: Math.max(0, num(item?.order ?? index)),
      minAmount: Math.max(0, num(item?.minAmount)),
      maxAmount: Math.max(0, num(item?.maxAmount)),
    }))
    .filter((item) => item.code);
};

/** বেছে নেওয়া বোনাস থেকে টাকার হিসাব */
const computeBonus = ({ amount, bonus }) => {
  if (!bonus) {
    return {
      selectedBonus: {},
      calc: {
        depositAmount: amount,
        bonusAmount: 0,
        creditedAmount: amount,
        turnoverMultiplier: 0,
        targetTurnover: 0,
      },
    };
  }

  const bonusAmount =
    bonus.bonusType === "percent"
      ? money((amount * num(bonus.bonusValue)) / 100)
      : money(bonus.bonusValue);

  const creditedAmount = money(amount + bonusAmount);
  const multiplier = num(bonus.turnoverMultiplier ?? 1);

  return {
    selectedBonus: {
      bonusId: String(bonus._id),
      title: bonus.title,
      bonusType: bonus.bonusType,
      bonusScope: bonus.bonusScope,
      bonusValue: bonus.bonusValue,
      bonusAmount,
      turnoverMultiplier: multiplier,
      eligibleProviders: bonus.eligibleProviders || [],
    },
    calc: {
      depositAmount: amount,
      bonusAmount,
      creditedAmount,
      turnoverMultiplier: multiplier,
      targetTurnover: money(creditedAmount * multiplier),
    },
  };
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/** অটো ডিপোজিট চালু আছে কিনা আর কী কী বোনাস বাছা যায় */
router.get("/status", async (req, res) => {
  try {
    const setting = await AutoDepositToken.current();

    const ready = setting.active && Boolean(setting.businessToken);

    return successResponse(res, "Auto deposit status", {
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
              manual: method.manual,
              minAmount: method.minAmount,
              maxAmount: method.maxAmount,
            }))
        : [],
      bonuses: ready
        ? (setting.bonuses || [])
            .filter((bonus) => bonus.isActive !== false)
            .sort((a, b) => num(a.order) - num(b.order))
        : [],
    });
  } catch {
    // জানা না গেলে অটো বন্ধ ধরে নেওয়া হয় — ম্যানুয়াল দিয়ে কাজ চলে
    return successResponse(res, "Auto deposit unavailable", {
      active: false,
      bonuses: [],
    });
  }
});

/** পেমেন্ট শুরু — লেনদেনটা PENDING হয়ে বসে থাকে */
router.post("/create", protectUser, async (req, res) => {
  try {
    const setting = await AutoDepositToken.current();

    if (!setting.active || !setting.businessToken) {
      return errorResponse(res, "Auto deposit is off right now", 400);
    }

    const amount = money(num(req.body?.amount));

    if (amount < num(setting.minAmount)) {
      return errorResponse(res, `Minimum is ${setting.minAmount}`, 400);
    }

    if (setting.maxAmount > 0 && amount > num(setting.maxAmount)) {
      return errorResponse(res, `Maximum is ${setting.maxAmount}`, 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) return errorResponse(res, "User not found", 404);
    if (!user.isActive) return errorResponse(res, "This account is disabled", 403);

    const gate = await verificationGate(user._id, "deposit");

    if (!gate.ok) {
      return errorResponse(res, gate.message, 400, "needVerification");
    }

    let bonus = null;
    const bonusId = text(req.body?.bonusId);

    if (bonusId) {
      bonus = setting.bonuses.id(bonusId);

      if (!bonus || bonus.isActive === false) {
        return errorResponse(res, "This bonus is not available", 400);
      }

      if (bonus.bonusScope === "first-deposit") {
        const paid = await AutoDeposit.countDocuments({
          user: user._id,
          status: "PAID",
          balanceAdded: true,
        });

        if (paid > 0) {
          return errorResponse(
            res,
            "This bonus is only for the first auto deposit",
            400,
          );
        }
      }
    }

    const { selectedBonus, calc } = computeBonus({ amount, bonus });

    const commission = await getAffiliateDepositCommission({ user, amount });

    const invoiceNumber = `BC${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await AutoDeposit.create({
      user: user._id,
      userIdText: user.userId,
      amount,
      invoiceNumber,
      status: "PENDING",
      selectedBonus,
      calc: { ...calc, affiliateDepositCommission: commission },
    });

    // গেটওয়ে থেকে পেমেন্ট পাতার ঠিকানা নেওয়া
    const server = (process.env.PUBLIC_SERVER_URL || "").replace(/\/+$/, "");
    const client = (process.env.PUBLIC_CLIENT_URL || "").replace(/\/+$/, "");

    try {
      const { data } = await axios.post(
        process.env.OPAY_URL,
        {
          payment_amount: amount,
          user_identity_address: String(user._id),
          callback_url: `${server}/api/auto-deposit/webhook`,
          success_redirect_url: `${client}/member/profile`,
          invoice_number: invoiceNumber,
          checkout_items: {
            userId: user.userId,
            selectedBonusId: selectedBonus.bonusId || "",
            selectedBonusTitleBn: selectedBonus.title?.bn || "",
            selectedBonusTitleEn: selectedBonus.title?.en || "",
          },
        },
        {
          timeout: 20000,
          headers: {
            "X-Opay-Business-Token": String(setting.businessToken || "").trim(),
            "Content-Type": "application/json",
          },
        },
      );

      if (!data?.success || !data?.payment_page_url) {
        // গেটওয়ে পাতা দিতে না পারলে লেনদেনটা ঝুলিয়ে রাখার মানে নেই
        await AutoDeposit.updateOne(
          { invoiceNumber },
          { $set: { status: "FAILED" } },
        );

        setting.lastError = data?.message || "Gateway did not return a page";
        await setting.save();

        return errorResponse(res, "Could not start the payment", 400);
      }

      if (setting.lastError) {
        setting.lastError = "";
        await setting.save();
      }

      return successResponse(res, "Auto deposit started", {
        invoiceNumber,
        amount,
        paymentUrl: data.payment_page_url,
      });
    } catch (gatewayError) {
      await AutoDeposit.updateOne(
        { invoiceNumber },
        { $set: { status: "FAILED" } },
      );

      setting.lastError =
        gatewayError?.response?.data?.message || gatewayError.message;
      await setting.save();

      return errorResponse(res, "Could not reach the payment gateway", 502);
    }
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নিজের অটো ডিপোজিটের ইতিহাস */
router.get("/history/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const status = String(req.query.status || "").trim().toUpperCase();

    if (["PENDING", "PAID", "FAILED"].includes(status)) filter.status = status;

    const [deposits, total] = await Promise.all([
      AutoDeposit.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-calc.affiliateDepositCommission")
        .lean(),
      AutoDeposit.countDocuments(filter),
    ]);

    return successResponse(res, "Auto deposits loaded", {
      deposits,
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
    const setting = await AutoDepositToken.current();

    return successResponse(res, "Auto deposit setting loaded", {
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
      const setting = await AutoDepositToken.current();
      const body = req.body || {};

      // খালি পাঠালে আগের টোকেনটাই থাকে — নইলে ভুল করে মুছে যেত
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

      const methods = cleanMethods(body.methods);
      if (methods) setting.methods = methods;

      if (Array.isArray(body.bonuses)) {
        const bonuses = body.bonuses.map((item, index) => ({
          ...(item?._id ? { _id: item._id } : {}),
          title: langText(item?.title),
          bonusType: item?.bonusType === "percent" ? "percent" : "fixed",
          bonusValue: Math.max(0, num(item?.bonusValue)),
          turnoverMultiplier: Math.max(0, num(item?.turnoverMultiplier ?? 1)),
          bonusScope:
            item?.bonusScope === "first-deposit" ? "first-deposit" : "all-time",
          isActive: item?.isActive !== false,
          order: Math.max(0, num(item?.order ?? index)),
          eligibleProviders: cleanProviders(item?.eligibleProviders),
        }));

        for (const bonus of bonuses) {
          if (sumPercent(bonus.eligibleProviders) > 100) {
            return errorResponse(
              res,
              `Bonus "${bonus.title.en || bonus.title.bn}" eligible providers add up to more than 100%`,
              400,
            );
          }
        }

        setting.bonuses = bonuses;
      }

      await setting.save();

      return successResponse(res, "Auto deposit setting saved", {
        setting: setting.toSafeJSON(),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/**
 * মাধ্যমের লোগো আপলোড।
 *
 * মাধ্যমগুলো একটা সেটিং ডকুমেন্টের ভিতরে অ্যারে হিসেবে থাকে, তাই ছবিটা
 * আলাদা করে আপলোড করে ফেরত আসা `/uploads/...` পথটা মাধ্যমের logoUrl এ
 * বসিয়ে পুরো সেটিং সেভ করা হয় — ম্যানুয়াল ডিপোজিট মেথডের মতোই।
 */
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

router.get("/deposits/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const status = text(req.query.status).toUpperCase();

    if (["PENDING", "PAID", "FAILED"].includes(status)) filter.status = status;

    const search = text(req.query.q);
    if (search) filter.userIdText = { $regex: search, $options: "i" };

    const [deposits, total, counts] = await Promise.all([
      AutoDeposit.find(filter)
        .populate("user", "userId phone balance role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AutoDeposit.countDocuments(filter),
      AutoDeposit.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);

    const summary = { PENDING: 0, PAID: 0, FAILED: 0 };
    counts.forEach((row) => {
      summary[row._id] = row.n;
    });

    return successResponse(res, "Auto deposits loaded", {
      deposits,
      summary,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * একটা PAID ডিপোজিট থেকে টাকা যোগ, অ্যাফিলিয়েট কমিশন ও টার্নওভার বসানো।
 *
 * `balanceAdded: false` শর্তে atomic দখল নিয়েই টাকা যোগ হয়, তাই একই
 * ডিপোজিট দুবার confirm হলেও (webhook + ম্যানুয়াল, বা webhook দুবার)
 * টাকা একবারই ঢোকে। webhook আর অ্যাডমিন ম্যানুয়াল confirm — দুই জায়গা
 * থেকেই এটা ব্যবহার হয়।
 */
const creditDeposit = async (invoiceNumber, patch = {}) => {
  const deposit = await AutoDeposit.findOneAndUpdate(
    { invoiceNumber, balanceAdded: false },
    {
      $set: {
        status: "PAID",
        balanceAdded: true,
        paidAt: new Date(),
        ...patch,
      },
    },
    { returnDocument: "after" },
  );

  // আগেই জমা হয়ে গেছে — কিছু করার নেই
  if (!deposit) return null;

  const user = await User.findById(deposit.user);

  if (user) {
    user.balance = money(num(user.balance) + num(deposit.calc?.creditedAmount));
    await user.save();
  }

  const commission = deposit.calc?.affiliateDepositCommission || {};
  const commissionAmount = money(commission.commissionAmount);

  if (commissionAmount > 0 && commission.affiliatorId) {
    await User.updateOne(
      { _id: commission.affiliatorId },
      { $inc: { depositCommissionBalance: commissionAmount } },
    ).catch(() => {});
  }

  const targetTurnover = money(deposit.calc?.targetTurnover);

  if (targetTurnover > 0) {
    await TurnOver.findOneAndUpdate(
      {
        user: deposit.user,
        sourceType: "auto-deposit",
        sourceId: deposit._id,
      },
      {
        user: deposit.user,
        sourceType: "auto-deposit",
        sourceId: deposit._id,
        title: `Auto deposit ${deposit.amount}`,
        required: targetTurnover,
        creditedAmount: money(deposit.calc?.creditedAmount),
        status: "running",
        eligibleProviders: deposit.selectedBonus?.eligibleProviders || [],
      },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );
  }

  return deposit;
};

/**
 * গেটওয়ের নিশ্চিতকরণ (OraclePay webhook)।
 *
 * ডকুমেন্টেশন অনুযায়ী payload snake_case: `status` (COMPLETED / PENDING /
 * REJECTED), `invoice_number`, `transaction_id`, `session_code`, `bank`,
 * `footprint`। webhook এ কোনো টোকেন/সিগনেচার আসে না, তাই নিরাপত্তা হয়:
 * invoice_number টা আমাদের তৈরি একটা ডিপোজিটের সাথে মেলে কিনা + অঙ্ক
 * মেলে কিনা দেখে। অজানা invoice বা অঙ্ক না মিললে বাতিল।
 *
 * COMPLETED → টাকা ঢোকে। PENDING (Bank/Crypto) → রেকর্ড হয়ে ঝুলে থাকে,
 * অ্যাডমিন যাচাই করে confirm করে। REJECTED → FAILED।
 */
router.post("/webhook", async (req, res) => {
  try {
    const invoiceNumber = text(req.body?.invoice_number);
    const status = text(req.body?.status).toUpperCase();

    if (!invoiceNumber) {
      return errorResponse(res, "invoice_number is required", 400);
    }

    const existing = await AutoDeposit.findOne({ invoiceNumber });

    // অজানা ইনভয়েস — আমাদের তৈরি নয়, ফেলে দেওয়া হয়
    if (!existing) return errorResponse(res, "Unknown invoice", 404);

    // অঙ্ক মেলানো — জালিয়াতি ঠেকাতে
    const webhookAmount = money(num(req.body?.amount));
    if (webhookAmount > 0 && webhookAmount !== money(existing.amount)) {
      return errorResponse(res, "Amount mismatch", 400);
    }

    const info = {
      transactionId: text(req.body?.transaction_id),
      bank: text(req.body?.bank),
      sessionCode: text(req.body?.session_code),
      footprint: text(req.body?.footprint),
    };

    if (status === "REJECTED") {
      await AutoDeposit.updateOne(
        { invoiceNumber, status: "PENDING" },
        { $set: { status: "FAILED", ...info } },
      );

      return successResponse(res, "Marked failed");
    }

    if (status === "PENDING") {
      // Bank/Crypto — টাকা এখনো ঢুকবে না, শুধু তথ্য বসিয়ে রাখা হয়
      await AutoDeposit.updateOne(
        { invoiceNumber, status: "PENDING" },
        { $set: info },
      );

      return successResponse(res, "Pending recorded");
    }

    if (status !== "COMPLETED") {
      return errorResponse(res, "Unknown status", 400);
    }

    const deposit = await creditDeposit(invoiceNumber, info);

    if (!deposit) return successResponse(res, "Already handled");

    return successResponse(res, "Deposit credited");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * Bank/Crypto ম্যানুয়াল ডিপোজিট — অ্যাডমিন যাচাই করে নিশ্চিত বা বাতিল করে।
 *
 * এই মাধ্যমগুলো webhook এ PENDING হয়ে আসে; টাকা সত্যিই এসেছে কিনা
 * অ্যাডমিন প্রমাণ (footprint) দেখে confirm করলে তবেই ব্যালেন্সে যোগ হয়।
 */
router.post(
  "/deposits/:id/confirm",
  protectAdmin,
  requireWrite,
  async (req, res) => {
    try {
      const deposit = await AutoDeposit.findById(req.params.id);

      if (!deposit) return errorResponse(res, "Deposit not found", 404);

      if (deposit.status !== "PENDING") {
        return errorResponse(res, "Only a pending deposit can be confirmed", 400);
      }

      const credited = await creditDeposit(deposit.invoiceNumber, {
        reviewedBy: req.admin?._id || null,
        reviewNote: text(req.body?.note),
      });

      if (!credited) return errorResponse(res, "Already handled", 400);

      return successResponse(res, "Deposit confirmed and credited");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.post(
  "/deposits/:id/reject",
  protectAdmin,
  requireWrite,
  async (req, res) => {
    try {
      const deposit = await AutoDeposit.findOneAndUpdate(
        { _id: req.params.id, status: "PENDING" },
        {
          $set: {
            status: "FAILED",
            reviewedBy: req.admin?._id || null,
            reviewNote: text(req.body?.note),
          },
        },
        { returnDocument: "after" },
      );

      if (!deposit) {
        return errorResponse(res, "Only a pending deposit can be rejected", 400);
      }

      return successResponse(res, "Deposit rejected");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
