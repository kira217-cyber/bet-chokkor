import fs from "node:fs";
import path from "node:path";
import express from "express";

import AppDownload from "../models/AppDownload.js";

import apkUpload from "../config/apkUpload.js";
import upload from "../config/multer.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

/* ── কনটেন্ট হেল্পার ── */
const langText = (obj) => ({ bn: text(obj?.bn), en: text(obj?.en) });

const parseMaybe = (value) => {
  if (typeof value !== "string") return value || {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const fileUrl = (file) => (file ? `/uploads/${file.filename}` : "");

/** আমাদের আপলোড হলে ডিস্ক থেকে ছবি মুছে ফেলা (apk এর বাইরে uploads/) */
const removeContentImage = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  fs.promises.unlink(path.join("uploads", path.basename(url))).catch(() => {});
};

/* কনটেন্টের সব ছবির নামের ফিল্ড — নতুন আপলোড হলে ঐ স্লট বদলায় */
const contentImageFields = [
  { name: "heroLogo", maxCount: 1 },
  { name: "heroBg", maxCount: 1 },
  { name: "heroMain", maxCount: 1 },
  { name: "featImage", maxCount: 1 },
  ...Array.from({ length: 6 }, (_, i) => ({ name: `card_${i}`, maxCount: 1 })),
];
const contentUpload = upload.fields(contentImageFields);

/** পুরোনো কনটেন্টের সব /uploads/ ছবি — orphan পরিষ্কারে কাজে লাগে */
const gatherImages = (content = {}) => {
  const urls = [];
  const h = content.hero || {};
  urls.push(h.logo, h.bgImage, h.mainImage);
  (content.experience?.cards || []).forEach((c) => urls.push(c.image));
  urls.push(content.features?.image);
  return urls.filter((u) => u && u.startsWith("/uploads/"));
};

/** body(JSON) + আপলোড ফাইল থেকে পরিচ্ছন্ন content বানানো */
const buildContent = (incoming = {}, files = {}) => {
  const slot = (name) => (files[name]?.[0] ? fileUrl(files[name][0]) : null);

  const hero = incoming.hero || {};
  const exp = incoming.experience || {};
  const feat = incoming.features || {};

  return {
    hero: {
      title: langText(hero.title),
      lead: langText(hero.lead),
      text: langText(hero.text),
      helpNote: langText(hero.helpNote),
      logo: slot("heroLogo") || text(hero.logo),
      bgImage: slot("heroBg") || text(hero.bgImage),
      mainImage: slot("heroMain") || text(hero.mainImage),
    },
    experience: {
      eyebrow: langText(exp.eyebrow),
      title: langText(exp.title),
      sub: langText(exp.sub),
      cards: (exp.cards || []).slice(0, 6).map((c, i) => ({
        title: langText(c.title),
        text: langText(c.text),
        image: slot(`card_${i}`) || text(c.image),
      })),
    },
    features: {
      eyebrow: langText(feat.eyebrow),
      title: langText(feat.title),
      sub: langText(feat.sub),
      image: slot("featImage") || text(feat.image),
      items: (feat.items || []).slice(0, 12).map((it) => ({
        label: langText(it.label),
        icon: text(it.icon),
      })),
    },
  };
};

const APK_DIR = "uploads/apk";

/** ফাইল আছে কিনা, না থাকলে ডকুমেন্ট থাকলেও "নেই" ধরা */
const hasApk = (row) =>
  Boolean(row?.fileName) && fs.existsSync(path.join(APK_DIR, row.fileName));

const removeApk = (fileName) => {
  if (!fileName) return;
  fs.promises.unlink(path.join(APK_DIR, fileName)).catch(() => {});
};

/**
 * ডাউনলোডের নামটা নিরাপদ করা।
 *
 * ব্যবহারকারী যে নামে আপলোড করেছেন সেই নামেই নামবে, কিন্তু ফোল্ডার
 * ভাঙার অক্ষর (/ \\ ..) বাদ দিয়ে — নইলে Content-Disposition দিয়ে
 * উল্টাপাল্টা নাম চাপানো যেত।
 */
const safeName = (name) => {
  const base = path.basename(String(name || "")).replace(/[\r\n"\\]/g, "");
  const clean = base.trim() || "app.apk";
  return clean.toLowerCase().endsWith(".apk") ? clean : `${clean}.apk`;
};

/* =========================
   সবাই দেখতে পায়
   ========================= */

router.get("/public", async (req, res) => {
  try {
    const row = await AppDownload.current();
    const ready = hasApk(row);

    return successResponse(res, "App info loaded", {
      available: ready,
      // থাকলে ডাউনলোডের ঠিকানা, নইলে দেখানোর মতো বার্তা
      downloadUrl: ready ? "/api/app-download/file" : "",
      fileName: ready ? row.originalName : "",
      size: ready ? row.size : 0,
      version: ready ? row.version : "",
      note: row.note,
      content: row.content || {},
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * আসল ফাইল — আপলোডের নামেই নামে।
 *
 * static দিয়ে সার্ভ করলে ডিস্কের এলোমেলো নামটাই নামত; তাই আলাদা
 * রুট, যেখানে Content-Disposition এ আসল নাম বসিয়ে দেওয়া হয়।
 */
router.get("/file", async (req, res) => {
  try {
    const row = await AppDownload.current();

    if (!hasApk(row)) return errorResponse(res, "No app uploaded yet", 404);

    return res.download(
      path.resolve(APK_DIR, row.fileName),
      safeName(row.originalName),
    );
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const row = await AppDownload.current();

    return successResponse(res, "App info loaded", {
      available: hasApk(row),
      fileName: row.originalName,
      size: row.size,
      version: row.version,
      note: row.note,
      updatedAt: row.updatedAt,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/admin/upload",
  protectAdmin,
  requireMother,
  requireWrite,
  apkUpload.single("apk"),
  async (req, res) => {
    try {
      if (!req.file) return errorResponse(res, "Choose an .apk file", 400);

      const row = await AppDownload.current();

      // আগেরটা মুছে নতুনটা বসানো — না মুছলে পুরোনো APK ডিস্কে জমত
      removeApk(row.fileName);

      row.fileName = req.file.filename;
      row.originalName = safeName(req.file.originalname);
      row.size = req.file.size;

      if (req.body?.version !== undefined) row.version = text(req.body.version);

      await row.save();

      return successResponse(res, "App uploaded", {
        available: true,
        fileName: row.originalName,
        size: row.size,
        version: row.version,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** শুধু বার্তা বা ভার্সন বদলানো — ফাইল না ছুঁয়ে */
router.put("/admin", protectAdmin, requireMother, requireWrite, async (req, res) => {
  try {
    const row = await AppDownload.current();

    if (req.body?.note && typeof req.body.note === "object") {
      row.note = {
        bn: text(req.body.note.bn),
        en: text(req.body.note.en),
      };
    }

    if (req.body?.version !== undefined) row.version = text(req.body.version);

    await row.save();

    return successResponse(res, "Saved", {
      note: row.note,
      version: row.version,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন — পেজ কনটেন্ট (টেক্সট + ছবি)
   ========================= */

router.get(
  "/admin/content",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const row = await AppDownload.current();
      return successResponse(res, "App content loaded", {
        content: row.content || {},
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/content",
  protectAdmin,
  requireMother,
  requireWrite,
  contentUpload,
  async (req, res) => {
    try {
      const row = await AppDownload.current();

      const prevImages = gatherImages(
        row.content?.toObject ? row.content.toObject() : row.content || {},
      );

      const next = buildContent(parseMaybe(req.body.content), req.files || {});
      row.content = next;
      await row.save();

      // যে পুরোনো ছবি আর ব্যবহার হচ্ছে না সেগুলো ডিস্ক থেকে মুছে ফেলা
      const nextImages = new Set(gatherImages(next));
      prevImages.forEach((url) => {
        if (!nextImages.has(url)) removeContentImage(url);
      });

      return successResponse(res, "App content saved", { content: row.content });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const row = await AppDownload.current();

      removeApk(row.fileName);

      row.fileName = "";
      row.originalName = "";
      row.size = 0;
      row.version = "";

      await row.save();

      return successResponse(res, "App removed", { available: false });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
