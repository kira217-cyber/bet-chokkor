import express from "express";

import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import DepositRequest from "../models/DepositRequest.js";
import WithdrawRequest from "../models/WithdrawRequest.js";
import AutoDeposit from "../models/AutoDeposit.js";
import AutoWithdraw from "../models/AutoWithdraw.js";

const router = express.Router();

const money = (v) => Math.round((Number(v) || 0) * 100) / 100;

/** একটা aggregate থেকে প্রথম sum, না থাকলে ০ */
const sumOf = async (Model, match, field = "amount") => {
  const rows = await Model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: `$${field}` } } },
  ]);
  return money(rows[0]?.total || 0);
};

/**
 * ড্যাশবোর্ডের সারসংক্ষেপ — সব আসল ডেটাবেস থেকে (Bajiman এর মতো)।
 *
 * ম্যানুয়াল + অটো — দুই ধরনের ডিপোজিট/উইথড্র মিলিয়ে হিসাব।
 */
router.get("/summary", protectAdmin, async (req, res) => {
  try {
    const [
      allUsers,
      activeUsers,
      allAffiliateUsers,
      pendingDepositRequest,
      pendingWithdrawRequest,
      pendingAutoWithdraw,
      adminCount,
      manualDeposit,
      autoDeposit,
      manualWithdraw,
      autoWithdraw,
      userBalance,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "user", isActive: true }),
      User.countDocuments({ role: "aff-user" }),
      DepositRequest.countDocuments({ status: "pending" }),
      WithdrawRequest.countDocuments({ status: "pending" }),
      AutoWithdraw.countDocuments({ status: { $in: ["PENDING", "PROCESSING"] } }),
      Admin.countDocuments(),
      sumOf(DepositRequest, { status: "approved" }, "amount"),
      sumOf(AutoDeposit, { status: "PAID" }, "amount"),
      sumOf(WithdrawRequest, { status: "approved" }, "amount"),
      sumOf(AutoWithdraw, { status: "COMPLETED" }, "amount"),
      sumOf(User, { role: "user" }, "balance"),
    ]);

    // শেষ ৭ দিনের ডিপোজিট/উইথড্র (ম্যানুয়াল+অটো একসাথে)
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      days.push({ start, end, label: start.toLocaleDateString("en-US", { weekday: "short" }) });
    }

    const chart = await Promise.all(
      days.map(async ({ start, end, label }) => {
        const range = { $gte: start, $lt: end };
        const [md, ad, mw, aw] = await Promise.all([
          sumOf(DepositRequest, { status: "approved", createdAt: range }, "amount"),
          sumOf(AutoDeposit, { status: "PAID", createdAt: range }, "amount"),
          sumOf(WithdrawRequest, { status: "approved", createdAt: range }, "amount"),
          sumOf(AutoWithdraw, { status: "COMPLETED", createdAt: range }, "amount"),
        ]);
        return { day: label, deposit: money(md + ad), withdraw: money(mw + aw) };
      }),
    );

    return successResponse(res, "Dashboard summary loaded", {
      cards: {
        allUsers,
        activeUsers,
        allAffiliateUsers,
        allDepositBalances: money(manualDeposit + autoDeposit),
        pendingDepositRequest,
        allWithdrawBalances: money(manualWithdraw + autoWithdraw),
        pendingWithdrawRequest: pendingWithdrawRequest + pendingAutoWithdraw,
        totalUserBalance: money(userBalance),
        totalAdmins: adminCount,
      },
      chart,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * নির্দিষ্ট দিনের সারসংক্ষেপ — তারিখ বেছে দিলে সেই দিনের হিসাব।
 */
router.get("/today", protectAdmin, async (req, res) => {
  try {
    const dateStr = String(req.query.date || "").trim();
    const base = dateStr ? new Date(dateStr) : new Date();

    if (Number.isNaN(base.getTime())) {
      return errorResponse(res, "Invalid date", 400);
    }

    const start = new Date(base);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const range = { $gte: start, $lt: end };

    const [
      newUsers,
      newAffiliates,
      manualDeposit,
      autoDeposit,
      manualWithdraw,
      autoWithdraw,
      depositCount,
      withdrawCount,
      pendingDeposit,
      pendingWithdraw,
    ] = await Promise.all([
      User.countDocuments({ role: "user", createdAt: range }),
      User.countDocuments({ role: "aff-user", createdAt: range }),
      sumOf(DepositRequest, { status: "approved", createdAt: range }, "amount"),
      sumOf(AutoDeposit, { status: "PAID", createdAt: range }, "amount"),
      sumOf(WithdrawRequest, { status: "approved", createdAt: range }, "amount"),
      sumOf(AutoWithdraw, { status: "COMPLETED", createdAt: range }, "amount"),
      DepositRequest.countDocuments({ status: "approved", createdAt: range }),
      WithdrawRequest.countDocuments({ status: "approved", createdAt: range }),
      DepositRequest.countDocuments({ status: "pending", createdAt: range }),
      WithdrawRequest.countDocuments({ status: "pending", createdAt: range }),
    ]);

    return successResponse(res, "Day summary loaded", {
      date: start.toISOString().slice(0, 10),
      cards: {
        newUsers,
        newAffiliates,
        deposit: money(manualDeposit + autoDeposit),
        withdraw: money(manualWithdraw + autoWithdraw),
        depositCount,
        withdrawCount,
        pendingDeposit,
        pendingWithdraw,
      },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
