import express from "express";

import upload from "../config/multer.js";
import User from "../models/User.js";
import VipLevel from "../models/VipLevel.js";
import VipSetting from "../models/VipSetting.js";
import VipTransaction from "../models/VipTransaction.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num, money } from "../utils/depositCalc.js";

const router = express.Router();

const text = (v) => String(v ?? "").trim();
const langText = (i = {}) => ({ bn: text(i?.bn), en: text(i?.en) });

/* ডিফল্ট ল্যাডার — মূল সাইটের ৭ টিয়ার (Normal বেস + ৭ ব্যাজ টিয়ার)।
   VE/রেট প্লেসহোল্ডার, অ্যাডমিন থেকে বদলানো যাবে। */
const DEFAULT_LEVELS = [
  { lv: 1, name: { bn: "নরমাল", en: "Normal" }, xpRequired: 0, color: "#9ca3af", convertRatio: 400, benefitCount: 0, order: 1 },
  { lv: 2, name: { bn: "এলিট I - III", en: "Elite I - III" }, xpRequired: 80000, color: "#cd7f32", convertRatio: 220, benefitCount: 1, badge: "/vip/tier1-elite.png", order: 2 },
  { lv: 3, name: { bn: "প্রো", en: "Pro" }, xpRequired: 800000, color: "#60a5fa", convertRatio: 200, benefitCount: 2, badge: "/vip/tier2-pro.png", order: 3 },
  { lv: 4, name: { bn: "এক্সপার্ট", en: "Expert" }, xpRequired: 2000000, color: "#34d399", convertRatio: 180, benefitCount: 4, badge: "/vip/tier3-expert.png", order: 4 },
  { lv: 5, name: { bn: "মাস্টার", en: "Master" }, xpRequired: 5000000, color: "#93c5fd", convertRatio: 150, benefitCount: 6, badge: "/vip/tier4-master.png", order: 5 },
  { lv: 6, name: { bn: "গ্র্যান্ডমাস্টার", en: "Grandmaster" }, xpRequired: 12000000, color: "#f87171", convertRatio: 120, inviteOnly: true, benefitCount: 8, badge: "/vip/tier5-grandmaster.png", order: 6 },
  { lv: 7, name: { bn: "লিজেন্ড", en: "Legend" }, xpRequired: 30000000, color: "#a78bfa", convertRatio: 100, benefitCount: 8, badge: "/vip/tier6-legend.png", order: 7 },
  { lv: 8, name: { bn: "মিথিক", en: "Mythic" }, xpRequired: 80000000, color: "#fbbf24", convertRatio: 80, benefitCount: 8, badge: "/vip/tier7-mythic.png", order: 8 },
];

const ensureSeed = async () => {
  const levels = await VipLevel.find().lean();
  if (levels.length === 0) {
    await VipLevel.insertMany(DEFAULT_LEVELS);
    return;
  }
  // পুরোনো সিড (ব্যাজবিহীন) থাকলে একবার নতুন ৭-টিয়ারে বদলে দেওয়া
  const hasBadge = levels.some((l) => l.badge);
  if (!hasBadge) {
    await VipLevel.deleteMany({});
    await VipLevel.insertMany(DEFAULT_LEVELS);
    return;
  }
  // benefitCount না থাকলে (পুরোনো ডক) lv অনুযায়ী ডিফল্ট বসানো
  const needsBenefit = levels.some((l) => l.benefitCount === undefined || l.benefitCount === null);
  if (needsBenefit) {
    for (const d of DEFAULT_LEVELS) {
      await VipLevel.updateOne(
        { lv: d.lv, $or: [{ benefitCount: { $exists: false } }, { benefitCount: null }] },
        { $set: { benefitCount: d.benefitCount } },
      );
    }
  }
};

/** একজনের বর্তমান VIP অবস্থা হিসাব করা */
const computeStatus = (user, levels) => {
  const sorted = [...levels].sort((a, b) => a.lv - b.lv);

  // XP অনুযায়ী প্রকৃত লেভেল (vipLevel এর সাথে না মিললে XP ই সত্য)
  let curr = sorted[0] || { lv: 1, xpRequired: 0, name: { bn: "", en: "" } };
  for (const l of sorted) {
    if (num(user.vipXP) >= num(l.xpRequired)) curr = l;
  }

  const next = sorted.find((l) => l.lv === curr.lv + 1) || null;

  let percent = 100;
  if (next) {
    const span = Math.max(1, num(next.xpRequired) - num(curr.xpRequired));
    percent = Math.min(
      100,
      Math.max(0, ((num(user.vipXP) - num(curr.xpRequired)) / span) * 100),
    );
  }

  return {
    level: curr.lv,
    levelName: curr.name,
    levelColor: curr.color,
    levelIcon: curr.icon,
    xp: num(user.vipXP),
    points: num(user.vipPoints),
    percent: Math.round(percent * 100) / 100,
    next: next
      ? { lv: next.lv, name: next.name, xpRequired: num(next.xpRequired) }
      : null,
  };
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/** নিজের VIP অবস্থা (নেভবার + মাই ভিআইপি পেজ) */
router.get("/me", protectUser, async (req, res) => {
  try {
    const setting = await VipSetting.current();
    if (!setting.active) {
      return successResponse(res, "VIP off", { active: false });
    }

    await ensureSeed();
    const levels = await VipLevel.find({ isActive: true }).lean();
    const user = await User.findById(req.user._id).lean();

    const status = computeStatus(user, levels);
    const currLevel = [...levels]
      .sort((a, b) => a.lv - b.lv)
      .filter((l) => num(user.vipXP) >= num(l.xpRequired))
      .pop();

    return successResponse(res, "VIP status", {
      active: true,
      ...status,
      convertRatio: Math.max(1, num(currLevel?.convertRatio) || num(setting.convertRatio)),
      minConvertPoints: setting.minConvertPoints,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** পুরো ল্যাডার + সেটিং (vip-detail / VIP ক্লাব পেজ) — পাবলিক */
router.get("/levels", async (req, res) => {
  try {
    const setting = await VipSetting.current();
    await ensureSeed();
    const levels = await VipLevel.find({ isActive: true })
      .sort({ lv: 1 })
      .lean();

    return successResponse(res, "VIP levels", {
      setting: setting.toClientJSON(),
      levels,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** পয়েন্ট → ক্যাশে রূপান্তর (VIP ইনস্ট্যান্ট রিবেট) */
router.post("/convert", protectUser, async (req, res) => {
  try {
    const setting = await VipSetting.current();
    if (!setting.active) return errorResponse(res, "VIP is off right now", 400);

    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, "User not found", 404);

    // ব্যবহারকারীর বর্তমান টিয়ারের রেট (না থাকলে সামগ্রিক)
    await ensureSeed();
    const levels = await VipLevel.find({ isActive: true }).lean();
    let curr = null;
    for (const l of [...levels].sort((a, b) => a.lv - b.lv)) {
      if (num(user.vipXP) >= num(l.xpRequired)) curr = l;
    }
    const ratio = Math.max(1, num(curr?.convertRatio) || num(setting.convertRatio));
    const minPoints = Math.max(0, num(setting.minConvertPoints));

    // চাওয়া পয়েন্ট (না দিলে যত আছে সব), ratio এর গুণিতকে নামানো হয়
    let points = Math.floor(num(req.body?.points) || num(user.vipPoints));
    points = Math.min(points, Math.floor(num(user.vipPoints)));
    points = Math.floor(points / ratio) * ratio;

    if (points < minPoints || points <= 0) {
      return errorResponse(
        res,
        `You need at least ${minPoints} points to convert`,
        400,
        "minPoints",
      );
    }

    const cash = money(points / ratio);

    // পয়েন্ট atomic ভাবে কাটা — যথেষ্ট না থাকলে কিছুই হয় না
    const updated = await User.findOneAndUpdate(
      { _id: user._id, vipPoints: { $gte: points } },
      { $inc: { vipPoints: -points, balance: cash } },
      { new: true },
    );

    if (!updated) return errorResponse(res, "Not enough points", 400, "minPoints");

    await VipTransaction.create({
      user: user._id,
      userIdText: user.userId,
      type: "convert",
      points: -points,
      amount: cash,
      note: `Converted ${points} points to ${cash}`,
    });

    return successResponse(res, "Points converted", {
      converted: points,
      cash,
      points: num(updated.vipPoints),
      balance: money(updated.balance),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** নিজের VIP ইতিহাস */
router.get("/history/my", protectUser, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 10));

    const filter = { user: req.user._id };
    const type = text(req.query.type);
    if (["earn", "convert", "upgrade", "bonus", "adjust"].includes(type)) {
      filter.type = type;
    }

    const [rows, total] = await Promise.all([
      VipTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VipTransaction.countDocuments(filter),
    ]);

    return successResponse(res, "VIP history", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
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
    const setting = await VipSetting.current();
    return successResponse(res, "VIP setting", { setting });
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
      const setting = await VipSetting.current();
      const b = req.body || {};

      if (typeof b.active === "boolean") setting.active = b.active;
      if (b.xpPerTurnover !== undefined)
        setting.xpPerTurnover = Math.max(0, num(b.xpPerTurnover));
      if (b.pointPerTurnover !== undefined)
        setting.pointPerTurnover = Math.max(0, num(b.pointPerTurnover));
      if (b.convertRatio !== undefined)
        setting.convertRatio = Math.max(1, num(b.convertRatio));
      if (b.minConvertPoints !== undefined)
        setting.minConvertPoints = Math.max(0, num(b.minConvertPoints));
      if (b.convertTurnoverMultiplier !== undefined)
        setting.convertTurnoverMultiplier = Math.max(
          0,
          num(b.convertTurnoverMultiplier),
        );
      if (b.title !== undefined) setting.title = langText(b.title);
      if (b.subtitle !== undefined) setting.subtitle = langText(b.subtitle);
      if (b.description !== undefined)
        setting.description = langText(b.description);
      if (b.bannerDesktop !== undefined)
        setting.bannerDesktop = text(b.bannerDesktop);
      if (b.bannerMobile !== undefined)
        setting.bannerMobile = text(b.bannerMobile);
      if (b.tips !== undefined) setting.tips = langText(b.tips);
      if (b.didYouKnow !== undefined) setting.didYouKnow = langText(b.didYouKnow);

      if (Array.isArray(b.benefits)) {
        setting.benefits = b.benefits.map((x) => ({
          icon: text(x?.icon),
          title: langText(x?.title),
          desc: langText(x?.desc),
        }));
      }
      if (Array.isArray(b.earnRates)) {
        setting.earnRates = b.earnRates.map((x) => ({
          icon: text(x?.icon),
          name: langText(x?.name),
          turnover: num(x?.turnover) || 1,
          vp: num(x?.vp),
        }));
      }

      await setting.save();
      return successResponse(res, "VIP setting saved", { setting });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.get("/admin/levels", protectAdmin, requireMother, async (req, res) => {
  try {
    await ensureSeed();
    const levels = await VipLevel.find().sort({ lv: 1 }).lean();
    return successResponse(res, "VIP levels", { levels });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const buildLevel = (b = {}) => ({
  lv: Math.max(1, num(b.lv) || 1),
  name: langText(b.name),
  xpRequired: Math.max(0, num(b.xpRequired)),
  icon: text(b.icon),
  badge: text(b.badge),
  color: text(b.color) || "#f9b901",
  convertRatio: Math.max(1, num(b.convertRatio) || 400),
  inviteOnly: Boolean(b.inviteOnly),
  benefitCount: Math.max(0, num(b.benefitCount)),
  upgradeBonus: Math.max(0, num(b.upgradeBonus)),
  monthlyBonus: Math.max(0, num(b.monthlyBonus)),
  rebatePercent: Math.max(0, num(b.rebatePercent)),
  perks: Array.isArray(b.perks) ? b.perks.map(langText).filter((p) => p.bn || p.en) : [],
  order: Math.max(0, num(b.order ?? b.lv)),
  isActive: b.isActive !== false,
});

router.post(
  "/admin/levels",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const data = buildLevel(req.body);
      const clash = await VipLevel.findOne({ lv: data.lv });
      if (clash) return errorResponse(res, `Level ${data.lv} already exists`, 400);

      const level = await VipLevel.create(data);
      return successResponse(res, "Level created", { level });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/levels/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const data = buildLevel(req.body);
      const clash = await VipLevel.findOne({
        lv: data.lv,
        _id: { $ne: req.params.id },
      });
      if (clash) return errorResponse(res, `Level ${data.lv} already exists`, 400);

      const level = await VipLevel.findByIdAndUpdate(req.params.id, data, {
        new: true,
      });
      if (!level) return errorResponse(res, "Level not found", 404);

      return successResponse(res, "Level saved", { level });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/levels/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      await VipLevel.findByIdAndDelete(req.params.id);
      return successResponse(res, "Level deleted", {});
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** VIP আইকন/ব্যানার আপলোড */
router.post(
  "/admin/upload",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("image"),
  (req, res) => {
    if (!req.file) return errorResponse(res, "Choose an image", 400);
    return successResponse(res, "Uploaded", {
      url: `/uploads/${req.file.filename}`,
    });
  },
);

/** সব ব্যবহারকারীর VIP ইতিহাস */
router.get("/admin/history", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, num(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, num(req.query.limit) || 20));

    const filter = {};
    const type = text(req.query.type);
    if (["earn", "convert", "upgrade", "bonus", "adjust"].includes(type)) {
      filter.type = type;
    }
    const search = text(req.query.q);
    if (search) filter.userIdText = { $regex: search, $options: "i" };

    const [rows, total, counts] = await Promise.all([
      VipTransaction.find(filter)
        .populate("user", "userId phone vipLevel")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      VipTransaction.countDocuments(filter),
      VipTransaction.aggregate([
        { $group: { _id: "$type", n: { $sum: 1 }, amt: { $sum: "$amount" } } },
      ]),
    ]);

    const summary = { upgrade: 0, convert: 0, bonus: 0, adjust: 0, convertAmount: 0, bonusAmount: 0 };
    counts.forEach((row) => {
      const t = String(row._id || "");
      summary[t] = row.n;
      if (t === "convert") summary.convertAmount = money(row.amt);
      if (t === "bonus") summary.bonusAmount = money(row.amt);
    });

    return successResponse(res, "VIP history", {
      rows,
      summary,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** অ্যাডমিন হাতে একজনের লেভেল/XP/পয়েন্ট বদলায় */
router.post(
  "/admin/user/:id/adjust",
  protectAdmin,
  requireWrite,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return errorResponse(res, "User not found", 404);

      const b = req.body || {};
      const before = { lv: user.vipLevel, xp: user.vipXP, points: user.vipPoints };

      if (b.vipLevel !== undefined) user.vipLevel = Math.max(1, num(b.vipLevel));
      if (b.vipXP !== undefined) user.vipXP = Math.max(0, num(b.vipXP));
      if (b.vipPoints !== undefined) user.vipPoints = Math.max(0, num(b.vipPoints));

      await user.save();

      await VipTransaction.create({
        user: user._id,
        userIdText: user.userId,
        type: "adjust",
        xp: num(user.vipXP) - num(before.xp),
        points: num(user.vipPoints) - num(before.points),
        levelFrom: before.lv,
        levelTo: user.vipLevel,
        note: text(b.note) || "Admin adjustment",
        reviewedBy: req.admin?._id || null,
      });

      return successResponse(res, "VIP updated", {
        vipLevel: user.vipLevel,
        vipXP: user.vipXP,
        vipPoints: user.vipPoints,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
