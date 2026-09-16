import express from "express";

import ContactSetting, { CHANNEL_KEYS } from "../models/ContactSetting.js";

import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

/**
 * লিংকটা কি আসলেই কোথাও নিয়ে যাবে।
 *
 * ইমেইলের জন্য `mailto:` নিজে থেকে বসে যায় — অ্যাডমিন শুধু ঠিকানাটা
 * লিখলেই চলে, প্রতিবার `mailto:` টাইপ করতে হয় না।
 */
const cleanUrl = (key, raw) => {
  const value = text(raw);

  if (!value) return "";

  if (key === "email") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }

  // অন্যগুলোয় স্কিম না থাকলে বসিয়ে দেওয়া, নইলে ব্রাউজার নিজের
  // ডোমেইনের ভিতরের পথ ধরে নিত
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

/* =========================
   সবাই দেখতে পায়
   ========================= */

router.get("/public", async (req, res) => {
  try {
    const setting = await ContactSetting.current();

    // চালু আর লিংক দেওয়া — দুটোই থাকলে তবেই বাইরে যায়
    const channels = setting.channels
      .filter((item) => item.isActive && item.url)
      .sort((a, b) => a.sort - b.sort)
      .map((item) => ({ key: item.key, url: item.url }));

    return successResponse(res, "Contacts loaded", { channels });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await ContactSetting.current();

    return successResponse(res, "Contacts loaded", {
      channels: setting.channels
        .slice()
        .sort((a, b) => a.sort - b.sort)
        .map((item) => ({
          key: item.key,
          url: item.url,
          isActive: item.isActive,
        })),
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
      const incoming = Array.isArray(req.body?.channels) ? req.body.channels : [];
      const setting = await ContactSetting.current();

      incoming.forEach((item) => {
        const key = text(item?.key);

        if (!CHANNEL_KEYS.includes(key)) return;

        const row = setting.channels.find((one) => one.key === key);

        if (!row) return;

        if (item.url !== undefined) row.url = cleanUrl(key, item.url);

        if (item.isActive !== undefined) {
          /*
           * লিংক ছাড়া চালু করা যায় না।
           *
           * চালু দেখিয়ে খালি লিংক রাখলে ব্যবহারকারী ক্লিক করে কোথাও
           * যেতেন না, আর অ্যাডমিন ভাবতেন কাজ হয়ে গেছে।
           */
          row.isActive = Boolean(item.isActive) && Boolean(row.url);
        }

        if (!row.url) row.isActive = false;
      });

      await setting.save();

      return successResponse(res, "Contacts saved", {
        channels: setting.channels
          .slice()
          .sort((a, b) => a.sort - b.sort)
          .map((item) => ({
            key: item.key,
            url: item.url,
            isActive: item.isActive,
          })),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
