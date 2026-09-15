import express from "express";
import mongoose from "mongoose";

import ReferralSetting from "../models/ReferralSetting.js";
import ReferralReward from "../models/ReferralReward.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";
import {
  evaluateAchievements,
  grantAchievements,
  referralOverview,
} from "../utils/referral.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

/** ব্যবহারকারীকে দেখানোর মতো অংশটুকু — ভিতরের কলকব্জা নয় */
const publicSetting = (setting) => ({
  isActive: setting.isActive,
  isAutoClaim: setting.isAutoClaim,
  maxTier: setting.maxTier,
  activeDownline: setting.activeDownline,
  commissionBands: setting.commissionBands,
  achievement: setting.achievement,
  rules: setting.rules,
});

/* =========================
   ব্যবহারকারী
   ========================= */

/**
 * নিজের রেফারেলের পুরো ছবি।
 *
 * পাতাটা খোলার সময়েই পেরিয়ে যাওয়া মাইলফলকগুলো বসিয়ে দেওয়া হয় — আলাদা
 * cron লাগে না, আর হিসাবটা সব সময় এখনকার নিয়ম মেনেই হয়।
 */
router.get("/my", protectUser, async (req, res) => {
  try {
    const setting = await ReferralSetting.current();

    if (!setting.isActive) {
      return successResponse(res, "Referral is off", {
        setting: publicSetting(setting),
        overview: null,
        achievement: null,
      });
    }

    const achievement = await grantAchievements(req.user);
    const overview = await referralOverview(req.user);

    return successResponse(res, "Referral loaded", {
      setting: publicSetting(setting),
      overview,
      achievement,
      referralCode: req.user.referralCode,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নিজের পুরস্কারের তালিকা */
router.get("/my/rewards", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const type = text(req.query.type);
    const status = text(req.query.status);

    if (["commission", "achievement"].includes(type)) filter.type = type;
    if (["claimable", "claimed"].includes(status)) filter.status = status;

    const [rows, total] = await Promise.all([
      ReferralReward.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReferralReward.countDocuments(filter),
    ]);

    return successResponse(res, "Rewards loaded", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নিজের ডাউনলাইন — কে কবে এসেছে, কতটা খেলেছে */
router.get("/my/downline", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const [rows, total] = await Promise.all([
      User.find({ referredBy: req.user._id })
        .select("userId createdAt totalTurnover totalDeposit isActive")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments({ referredBy: req.user._id }),
    ]);

    return successResponse(res, "Downline loaded", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * জমে থাকা সব পুরস্কার ব্যালেন্সে নেওয়া।
 *
 * সারিগুলো আগে একবারে দাবি করা হয় (`claimable` থাকলে তবেই), তারপর যত
 * টাকা সত্যিই দাবি করা গেল ঠিক ততটাই ব্যালেন্সে যোগ হয় — দুটো ট্যাব
 * থেকে একসাথে চাপলেও তাই দুবার টাকা যায় না।
 */
router.post("/my/claim", protectUser, async (req, res) => {
  try {
    const setting = await ReferralSetting.current();

    if (!setting.isActive) {
      return errorResponse(res, "Referral is off right now", 400, "referralOff");
    }

    // দাবি করার আগে নতুন মাইলফলক থাকলে সেগুলোও বসিয়ে নেওয়া
    await grantAchievements(req.user);

    const pending = await ReferralReward.find({
      user: req.user._id,
      status: "claimable",
    })
      .select("_id amount")
      .lean();

    if (!pending.length) {
      return errorResponse(res, "Nothing to claim", 400, "nothingToClaim");
    }

    const now = new Date();
    let total = 0;

    for (const row of pending) {
      const claimed = await ReferralReward.updateOne(
        { _id: row._id, status: "claimable" },
        { $set: { status: "claimed", claimedAt: now } },
      );

      if (claimed.modifiedCount === 1) total = money(total + num(row.amount));
    }

    if (total <= 0) {
      return errorResponse(res, "Nothing to claim", 400, "nothingToClaim");
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: total } },
      { returnDocument: "after" },
    );

    return successResponse(res, "Claimed", {
      claimed: total,
      balance: money(user?.balance),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin/setting", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await ReferralSetting.current();
    return successResponse(res, "Setting loaded", { setting });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** শতাংশের যোগফল বা ধাপ যেন অর্থহীন না হয় */
const settingProblem = (body) => {
  const bands = Array.isArray(body?.commissionBands) ? body.commissionBands : [];

  for (const band of bands) {
    for (const tier of band.tiers || []) {
      if (num(tier.percent) < 0 || num(tier.percent) > 100) {
        return "Each percentage must be between 0 and 100";
      }
    }
  }

  const milestones = Array.isArray(body?.achievement?.milestones)
    ? body.achievement.milestones
    : [];

  for (const item of milestones) {
    if (num(item.count) < 1) return "Invite count must be at least 1";
    if (num(item.amount) < 0) return "Bonus amount cannot be negative";
  }

  return "";
};

router.put(
  "/admin/setting",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const problem = settingProblem(req.body);

      if (problem) return errorResponse(res, problem, 400);

      const setting = await ReferralSetting.current();
      const body = req.body || {};

      if (body.isActive !== undefined) setting.isActive = Boolean(body.isActive);
      if (body.isAutoClaim !== undefined) {
        setting.isAutoClaim = Boolean(body.isAutoClaim);
      }

      if (body.maxTier !== undefined) {
        setting.maxTier = Math.min(5, Math.max(1, num(body.maxTier)));
      }

      if (body.activeDownline) {
        setting.activeDownline = {
          depositRequirement: Math.max(
            0,
            num(body.activeDownline.depositRequirement),
          ),
          turnoverRequirement: Math.max(
            0,
            num(body.activeDownline.turnoverRequirement),
          ),
        };
      }

      if (Array.isArray(body.commissionBands)) {
        setting.commissionBands = body.commissionBands
          .map((band) => ({
            requireTurnover: Math.max(0, num(band.requireTurnover)),
            requireDeposit: Math.max(0, num(band.requireDeposit)),
            requireWinLoss: num(band.requireWinLoss),
            tiers: (Array.isArray(band.tiers) ? band.tiers : [])
              .map((tier) => ({
                tier: Math.min(5, Math.max(1, num(tier.tier))),
                percent: Math.min(100, Math.max(0, num(tier.percent))),
              }))
              .sort((a, b) => a.tier - b.tier),
          }))
          // ছোট থেকে বড় — হিসাবের সময় সবচেয়ে উপরের ধাপটা বাছা হয়
          .sort((a, b) => a.requireTurnover - b.requireTurnover);
      }

      if (body.achievement) {
        setting.achievement = {
          period: ["daily", "weekly", "monthly"].includes(
            body.achievement.period,
          )
            ? body.achievement.period
            : setting.achievement.period,
          milestones: (Array.isArray(body.achievement.milestones)
            ? body.achievement.milestones
            : []
          )
            .map((item) => ({
              count: Math.max(1, num(item.count)),
              amount: Math.max(0, num(item.amount)),
            }))
            .sort((a, b) => a.count - b.count),
        };
      }

      if (body.rules) {
        setting.rules = {
          bn: text(body.rules.bn),
          en: text(body.rules.en),
        };
      }

      await setting.save();

      return successResponse(res, "Setting saved", { setting });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** সবার পুরস্কারের তালিকা */
router.get("/admin/rewards", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const type = text(req.query.type);
    const status = text(req.query.status);

    if (["commission", "achievement"].includes(type)) filter.type = type;
    if (["claimable", "claimed"].includes(status)) filter.status = status;

    const search = text(req.query.q);

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ userIdText: regex }, { fromUserIdText: regex }];
    }

    const [rows, total, sums] = await Promise.all([
      ReferralReward.find(filter)
        .populate("user", "userId phone role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ReferralReward.countDocuments(filter),
      ReferralReward.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$status",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const summary = sums.reduce(
      (acc, item) => ({
        ...acc,
        [item._id]: { total: money(item.total), count: item.count },
      }),
      { claimable: { total: 0, count: 0 }, claimed: { total: 0, count: 0 } },
    );

    return successResponse(res, "Rewards loaded", {
      rows,
      summary,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** একজনের রেফারেলের অবস্থা — ব্যবহারকারীর বিস্তারিত পাতার জন্য */
router.get("/admin/user/:id", protectAdmin, async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Bad id", 400);

    const user = await User.findById(req.params.id).select(
      "userId referralCode totalTurnover totalDeposit",
    );

    if (!user) return errorResponse(res, "User not found", 404);

    const [overview, achievement] = await Promise.all([
      referralOverview(user),
      evaluateAchievements(user._id),
    ]);

    return successResponse(res, "Referral loaded", { overview, achievement });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
