import express from "express";

import RegisterBonusCampaign from "../models/RegisterBonusCampaign.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const num = (value, fallback = 0) =>
  Number.isFinite(Number(value)) ? Number(value) : fallback;

const langText = (input = {}, current = {}) => ({
  bn: text(input.bn) || current.bn || "",
  en: text(input.en) || current.en || "",
});

/** প্রোভাইডার তালিকা পরিষ্কার করে নেওয়া */
const cleanProviders = (list) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => ({
      providerCode: text(item?.providerCode).toUpperCase(),
      percent: Math.min(100, Math.max(0, num(item?.percent, 100))),
    }))
    .filter((item) => item.providerCode);
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/** এখন চালু ক্যাম্পেইন — রেজিস্টার পেজে দেখানোর জন্য */
router.get("/active", async (req, res) => {
  try {
    const campaign = await RegisterBonusCampaign.activeOne();

    if (!campaign) return successResponse(res, "No active bonus", { campaign: null });

    return successResponse(res, "Active bonus loaded", {
      campaign: {
        id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        bonusAmount: campaign.bonusAmount,
        turnoverMultiplier: campaign.turnoverMultiplier,
        turnoverRequired: campaign.bonusAmount * campaign.turnoverMultiplier,
      },
    });
  } catch {
    // জানা না গেলে বোনাস ছাড়াই রেজিস্টার চলুক
    return successResponse(res, "Bonus unavailable", { campaign: null });
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/", protectAdmin, requireMother, async (req, res) => {
  try {
    const campaigns = await RegisterBonusCampaign.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return successResponse(res, "Campaigns loaded", { campaigns });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const body = req.body || {};

      const title = langText(body.title);

      if (!title.bn && !title.en) {
        return errorResponse(res, "Title is required", 400);
      }

      const bonusAmount = num(body.bonusAmount);

      if (bonusAmount <= 0) {
        return errorResponse(res, "Bonus amount must be more than 0", 400);
      }

      const campaign = await RegisterBonusCampaign.create({
        title,
        description: langText(body.description),
        bonusAmount,
        turnoverMultiplier: Math.max(0, num(body.turnoverMultiplier, 1)),
        eligibleProviders: cleanProviders(body.eligibleProviders),
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        order: Math.max(0, num(body.order)),
        status: body.status === "inactive" ? "inactive" : "active",
      });

      return successResponse(res, "Campaign created", { campaign }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const campaign = await RegisterBonusCampaign.findById(req.params.id);

      if (!campaign) return errorResponse(res, "Campaign not found", 404);

      const body = req.body || {};

      if (body.title) campaign.title = langText(body.title, campaign.title);
      if (body.description) {
        campaign.description = langText(body.description, campaign.description);
      }

      if (body.bonusAmount !== undefined) {
        const amount = num(body.bonusAmount);

        if (amount <= 0) {
          return errorResponse(res, "Bonus amount must be more than 0", 400);
        }

        campaign.bonusAmount = amount;
      }

      if (body.turnoverMultiplier !== undefined) {
        campaign.turnoverMultiplier = Math.max(0, num(body.turnoverMultiplier));
      }

      if (body.eligibleProviders !== undefined) {
        campaign.eligibleProviders = cleanProviders(body.eligibleProviders);
      }

      if (body.startDate !== undefined) {
        campaign.startDate = body.startDate ? new Date(body.startDate) : new Date();
      }

      if (body.endDate !== undefined) {
        campaign.endDate = body.endDate ? new Date(body.endDate) : null;
      }

      if (body.order !== undefined) campaign.order = Math.max(0, num(body.order));

      if (body.status) {
        campaign.status = body.status === "inactive" ? "inactive" : "active";
      }

      await campaign.save();

      return successResponse(res, "Campaign updated", { campaign });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const campaign = await RegisterBonusCampaign.findById(req.params.id);

      if (!campaign) return errorResponse(res, "Campaign not found", 404);

      // পুরোনো ক্যাম্পেইনের TurnOver গুলো থেকে যায় — ব্যবহারকারীর
      // চলতি শর্ত মুছে ফেলা যাবে না
      await RegisterBonusCampaign.deleteOne({ _id: campaign._id });

      return successResponse(res, "Campaign deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
