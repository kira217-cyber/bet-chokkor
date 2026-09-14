import express from "express";
import axios from "axios";

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
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const deposits = await AutoDeposit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("-calc.affiliateDepositCommission")
      .lean();

    return successResponse(res, "Auto deposits loaded", { deposits });
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
        .populate("user", "userId phone balance")
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
      meta: { page, limit, total },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * গেটওয়ের নিশ্চিতকরণ।
 *
 * একই নিশ্চিতকরণ একাধিকবার আসতে পারে, তাই `balanceAdded: false` শর্তে
 * atomic দখল নিয়েই তবে টাকা যোগ হয় — দ্বিতীয়বার এলে কিছুই ঘটে না।
 */
router.post("/webhook", async (req, res) => {
  try {
    const setting = await AutoDepositToken.current();

    const token = text(req.headers["x-auth-token"] || req.body?.token);

    if (!setting.businessToken || token !== setting.businessToken) {
      return errorResponse(res, "Invalid token", 401);
    }

    const invoiceNumber = text(req.body?.invoiceNumber);
    const paid = text(req.body?.status).toUpperCase() === "PAID";

    if (!invoiceNumber) return errorResponse(res, "invoiceNumber is required", 400);

    if (!paid) {
      await AutoDeposit.updateOne(
        { invoiceNumber, status: "PENDING" },
        { $set: { status: "FAILED" } },
      );

      return successResponse(res, "Marked failed");
    }

    const deposit = await AutoDeposit.findOneAndUpdate(
      { invoiceNumber, balanceAdded: false },
      {
        $set: {
          status: "PAID",
          balanceAdded: true,
          paidAt: new Date(),
          transactionId: text(req.body?.transactionId),
          bank: text(req.body?.bank),
        },
      },
      { returnDocument: "after" },
    );

    // আগেই জমা হয়ে গেছে — দ্বিতীয় নিশ্চিতকরণে কিছু করার নেই
    if (!deposit) return successResponse(res, "Already handled");

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

    return successResponse(res, "Deposit credited");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
