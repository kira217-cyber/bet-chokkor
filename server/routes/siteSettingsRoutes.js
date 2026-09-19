import express from "express";

import upload from "../config/multer.js";
import SiteIdentify from "../models/SiteIdentify.js";
import AffSiteIdentify from "../models/AffSiteIdentify.js";
import ClientFooterSetting from "../models/ClientFooterSetting.js";
import AffFooterSetting from "../models/AffFooterSetting.js";

import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (v) => String(v ?? "").trim();
const lang = (i = {}) => ({ bn: text(i?.bn), en: text(i?.en) });

/* =========================
   পাবলিক
   ========================= */

/** ক্লায়েন্ট সাইটের পরিচয় + ফুটার */
router.get("/client/public", async (req, res) => {
  try {
    const [identify, footer] = await Promise.all([
      SiteIdentify.current(),
      ClientFooterSetting.current(),
    ]);
    return successResponse(res, "Client settings", { identify, footer });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** অ্যাফিলিয়েট সাইটের পরিচয় + ফুটার */
router.get("/affiliate/public", async (req, res) => {
  try {
    const [identify, footer] = await Promise.all([
      AffSiteIdentify.current(),
      AffFooterSetting.current(),
    ]);
    return successResponse(res, "Affiliate settings", { identify, footer });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

/** লোগো / favicon আপলোড */
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

/** GET/PUT হেল্পার — সিঙ্গেলটন মডেলের জন্য */
const makeCrud = (Model, apply) => {
  router.get(
    `/admin/${apply.key}`,
    protectAdmin,
    requireMother,
    async (req, res) => {
      try {
        const doc = await Model.current();
        return successResponse(res, "Loaded", { data: doc });
      } catch (error) {
        return errorResponse(res, error.message, 500);
      }
    },
  );

  router.put(
    `/admin/${apply.key}`,
    protectAdmin,
    requireMother,
    requireWrite,
    async (req, res) => {
      try {
        const doc = await Model.current();
        apply.set(doc, req.body || {});
        await doc.save();
        return successResponse(res, "Saved", { data: doc });
      } catch (error) {
        return errorResponse(res, error.message, 500);
      }
    },
  );
};

makeCrud(SiteIdentify, {
  key: "client-identify",
  set: (doc, b) => {
    if (b.siteName !== undefined) doc.siteName = text(b.siteName);
    if (b.logo !== undefined) doc.logo = text(b.logo);
    if (b.brandLogo !== undefined) doc.brandLogo = text(b.brandLogo);
    if (b.favicon !== undefined) doc.favicon = text(b.favicon);
  },
});

makeCrud(ClientFooterSetting, {
  key: "client-footer",
  set: (doc, b) => {
    if (b.brandLogo !== undefined) doc.brandLogo = text(b.brandLogo);
    if (b.subtitle !== undefined) doc.subtitle = lang(b.subtitle);
    if (b.copyright !== undefined) doc.copyright = lang(b.copyright);
    if (b.license !== undefined) doc.license = lang(b.license);
  },
});

makeCrud(AffSiteIdentify, {
  key: "aff-identify",
  set: (doc, b) => {
    if (b.siteName !== undefined) doc.siteName = text(b.siteName);
    if (b.logo !== undefined) doc.logo = text(b.logo);
    if (b.brandLogo !== undefined) doc.brandLogo = text(b.brandLogo);
    if (b.favicon !== undefined) doc.favicon = text(b.favicon);
  },
});

makeCrud(AffFooterSetting, {
  key: "aff-footer",
  set: (doc, b) => {
    if (b.logo !== undefined) doc.logo = text(b.logo);
    if (b.description !== undefined) doc.description = lang(b.description);
    if (b.copyright !== undefined) doc.copyright = lang(b.copyright);
    if (b.ageNotice !== undefined) doc.ageNotice = lang(b.ageNotice);
  },
});

export default router;
