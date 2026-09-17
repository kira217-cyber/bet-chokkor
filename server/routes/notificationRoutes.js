import express from "express";
import fs from "node:fs";
import path from "node:path";

import upload from "../config/multer.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

const langText = (input = {}) => ({
  bn: text(input?.bn),
  en: text(input?.en),
});

/** পুরোনো ছবিটা ডিস্ক থেকে মুছে ফেলা — শুধু আমাদের আপলোড হলে */
const removeOldImage = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/uploads/")) return;

  const target = path.join("uploads", path.basename(imageUrl));
  fs.promises.unlink(target).catch(() => {});
};

/** না-পড়া গণনা — seenAt এর পরে তৈরি হওয়া সক্রিয় নোটিফিকেশন */
const countUnread = async (seenAt) => {
  const filter = { isActive: true };
  if (seenAt) filter.createdAt = { $gt: seenAt };

  return Notification.countDocuments(filter);
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/** সক্রিয় নোটিফিকেশনের তালিকা + না-পড়া গণনা */
router.get("/", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationsSeenAt");

    const [items, unread] = await Promise.all([
      Notification.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      countUnread(user?.notificationsSeenAt),
    ]);

    const seenAt = user?.notificationsSeenAt;

    return successResponse(res, "Notifications loaded", {
      notifications: items.map((item) => ({
        ...item,
        // seenAt এর পরে তৈরি হলে "নতুন"
        isNew: !seenAt || new Date(item.createdAt) > new Date(seenAt),
      })),
      unread,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** শুধু না-পড়া সংখ্যা — হেডারের ব্যাজের জন্য */
router.get("/unread-count", protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("notificationsSeenAt");
    const unread = await countUnread(user?.notificationsSeenAt);

    return successResponse(res, "Unread count", { unread });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** সব দেখা হয়ে গেছে — seenAt এখনকার সময়ে বসে, গণনা ০ */
router.post("/seen", protectUser, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { notificationsSeenAt: new Date() } },
    );

    return successResponse(res, "Marked seen", { unread: 0 });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Notifications loaded", { notifications });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/admin",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};

      // ছবির সাথে multipart এ এলে title/description JSON স্ট্রিং হয়ে আসে
      const title = langText(parseMaybe(body.title));
      const description = langText(parseMaybe(body.description));

      if (!title.bn && !title.en) {
        return errorResponse(res, "Title is required", 400);
      }

      const notification = await Notification.create({
        title,
        description,
        imageUrl: req.file ? `/uploads/${req.file.filename}` : text(body.imageUrl),
        isActive: body.isActive !== "false" && body.isActive !== false,
      });

      return successResponse(res, "Notification created", { notification }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("image"),
  async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id);

      if (!notification) return errorResponse(res, "Notification not found", 404);

      const body = req.body || {};

      if (body.title !== undefined) {
        notification.title = langText(parseMaybe(body.title));
      }
      if (body.description !== undefined) {
        notification.description = langText(parseMaybe(body.description));
      }
      if (body.isActive !== undefined) {
        notification.isActive = body.isActive !== "false" && body.isActive !== false;
      }

      if (req.file) {
        removeOldImage(notification.imageUrl);
        notification.imageUrl = `/uploads/${req.file.filename}`;
      } else if (body.imageUrl !== undefined) {
        const next = text(body.imageUrl);
        if (!next && notification.imageUrl) removeOldImage(notification.imageUrl);
        notification.imageUrl = next;
      }

      await notification.save();

      return successResponse(res, "Notification updated", { notification });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const notification = await Notification.findByIdAndDelete(req.params.id);

      if (!notification) return errorResponse(res, "Notification not found", 404);

      removeOldImage(notification.imageUrl);

      return successResponse(res, "Notification deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** multipart এ JSON স্ট্রিং হয়ে এলে অবজেক্টে ফেরানো */
function parseMaybe(value) {
  if (typeof value !== "string") return value || {};

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export default router;
