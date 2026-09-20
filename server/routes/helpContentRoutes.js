import fs from "node:fs";
import path from "node:path";
import express from "express";

import HelpContent from "../models/HelpContent.js";
import upload from "../config/multer.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (v) => String(v ?? "").trim();
const langText = (o) => ({ en: text(o?.en), bn: text(o?.bn) });
const parseMaybe = (v) => {
  if (typeof v !== "string") return v || {};
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
};
const fileUrl = (f) => (f ? `/uploads/${f.filename}` : "");
const removeImage = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  fs.promises.unlink(path.join("uploads", path.basename(url))).catch(() => {});
};

const UI_KEYS = [
  "brand", "heroTitle", "heroText", "helpLead", "helpWord", "helpTail",
  "searchPlaceholder", "quickLinks", "information", "footerAbout",
  "topicsHeading", "copyright",
];

const contentImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "footerBg", maxCount: 1 },
]);

const toJSON = (doc) => ({
  identity: doc.identity || {},
  ui: doc.ui || {},
  topics: doc.topics || [],
  footerQuick: doc.footerQuick || [],
  footerInfo: doc.footerInfo || [],
  legal: doc.legal || {},
});

/* প্যারার তালিকা পরিষ্কার — খালি লাইন বাদ */
const paraList = (arr) =>
  (Array.isArray(arr) ? arr : []).map((p) => text(p)).filter(Boolean);
const legalPage = (p = {}) => ({
  title: langText(p.title),
  body: { en: paraList(p.body?.en), bn: paraList(p.body?.bn) },
});

const buildContent = (b = {}, files = {}, prev = {}) => {
  const ui = {};
  UI_KEYS.forEach((k) => { ui[k] = langText(b.ui?.[k]); });

  return {
    identity: {
      logo: files.logo?.[0] ? fileUrl(files.logo[0]) : text(b.identity?.logo),
      footerBg: files.footerBg?.[0] ? fileUrl(files.footerBg[0]) : text(b.identity?.footerBg),
    },
    ui,
    topics: (b.topics || []).slice(0, 20).map((t) => ({
      key: text(t.key),
      icon: text(t.icon),
      name: langText(t.name),
      faqs: (t.faqs || []).slice(0, 30).map((f) => ({ q: langText(f.q), a: langText(f.a) })),
    })),
    footerQuick: (b.footerQuick || []).slice(0, 20).map((l) => ({ en: text(l.en), bn: text(l.bn), to: text(l.to) })),
    footerInfo: (b.footerInfo || []).slice(0, 20).map((l) => ({ en: text(l.en), bn: text(l.bn), to: text(l.to) })),
    legal: {
      terms: legalPage(b.legal?.terms),
      privacy: legalPage(b.legal?.privacy),
    },
  };
};

/* ── পাবলিক ── */
router.get("/public", async (req, res) => {
  try {
    const doc = await HelpContent.current();
    return successResponse(res, "Help content", toJSON(doc));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* ── অ্যাডমিন ── */
router.get("/admin", protectAdmin, requireMother, async (req, res) => {
  try {
    const doc = await HelpContent.current();
    return successResponse(res, "Help content", toJSON(doc));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin",
  protectAdmin,
  requireMother,
  requireWrite,
  contentImages,
  async (req, res) => {
    try {
      const doc = await HelpContent.current();
      const prevLogo = doc.identity?.logo || "";
      const prevBg = doc.identity?.footerBg || "";

      const next = buildContent(parseMaybe(req.body.content), req.files || {});
      Object.assign(doc, next);
      await doc.save();

      if (prevLogo && prevLogo.startsWith("/uploads/") && prevLogo !== doc.identity.logo) removeImage(prevLogo);
      if (prevBg && prevBg.startsWith("/uploads/") && prevBg !== doc.identity.footerBg) removeImage(prevBg);

      return successResponse(res, "Help content saved", toJSON(doc));
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
