import express from "express";

import ClientTheme from "../models/ClientTheme.js";
import SectionTheme from "../models/SectionTheme.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

/* যেসব টোকেন অ্যাডমিন বদলাতে পারে (CSS ভ্যারিয়েবল নাম, "--" ছাড়া) */
const ALLOWED = new Set([
  "neutral100", "neutral200", "neutral300", "neutral400", "neutral500",
  "neutral600", "neutral700", "neutral800", "neutral900", "neutral1000",
  "primary300", "primary400", "primary500", "primary600",
  "secondary500", "secondary600",
  "status-danger", "status-info", "status-pending", "status-success", "status-warning",
]);

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** শুধু বৈধ টোকেন + বৈধ হেক্স রাখা */
const clean = (input = {}) => {
  const out = {};
  Object.entries(input || {}).forEach(([k, v]) => {
    const val = String(v ?? "").trim();
    if (ALLOWED.has(k) && HEX.test(val)) out[k] = val;
  });
  return out;
};

const toJSON = (doc) => ({
  active: doc.active,
  colors: doc.colors ? Object.fromEntries(doc.colors) : {},
});

/* ── সেকশন-ভিত্তিক টোকেন (scope → allowed key set) ── */
const SECTION_TOKENS = {
  "client:navbar": [
    "nav-header-bg",
    "nav-login-bg", "nav-login-text",
    "nav-signup-bg", "nav-signup-text",
    "nav-deposit-bg", "nav-deposit-text",
    "nav-withdraw-bg", "nav-withdraw-text",
    "nav-card-bg", "nav-card-text",
    "nav-circle-bg", "nav-icon",
  ],
  "client:sidebar": [
    "side-bg", "side-row-bg", "side-row-hover",
    "side-text", "side-icon-bg", "side-divider",
  ],
  "client:bottom-nav": ["bnav-bg", "bnav-active", "bnav-inactive"],
  "client:home": [
    "home-title", "home-title-bar",
    "home-card-bg", "home-card-hover", "home-card-text",
    "home-cat-active-bg", "home-cat-active-text",
  ],
  "client:match-odds": [
    "mo-bg", "mo-rail-bg", "mo-card-bg", "mo-card-header",
    "mo-live", "mo-odds-bg", "mo-status",
  ],
  "client:modal": [
    "modal-bg", "modal-border", "modal-title", "modal-text",
    "modal-btn-bg", "modal-btn-hover", "modal-primary-bg", "modal-primary-text",
  ],
  "client:auth": [
    "auth-page-bg", "auth-header-bg", "auth-hero-beam", "auth-hero-overlay",
    "auth-tab-active", "auth-tab-inactive", "auth-tab-underline",
    "auth-input-bg", "auth-link", "auth-btn-bg", "auth-btn-text",
  ],
  "client:member": [
    "member-card-bg", "member-surface-bg", "member-surface-hover",
    "member-accent", "member-title", "member-text",
  ],
  "client:footer": [
    "footer-bg", "footer-heading", "footer-accent",
    "footer-link", "footer-text", "footer-divider",
  ],
  "client:app-download": [
    "appdl-section-bg", "appdl-band-top", "appdl-band-bottom",
    "appdl-card-bg", "appdl-accent",
  ],
  "client:promotion": [
    "promo-title", "promo-tab-active-bg", "promo-tab-active-text",
    "promo-tab-bg", "promo-tab-text", "promo-card-bg", "promo-accent",
  ],
  /* অ্যাফিলিয়েট হোম — বেস প্যালেট টোকেন সরাসরি override (পুরো
     অ্যাফিলিয়েট সাইট একই প্যালেট ব্যবহার করে) */
  "affiliate:home": [
    "primary500", "primary400", "primary600",
    "neutral1000", "neutral900", "neutral800", "neutral700",
    "neutral100", "text-secondary", "text-muted",
  ],
  /* Login/Register আলাদা করে রঙ — AuthCard শেয়ার্ড, তাই scoped
     ক্লাসে আলাদা টোকেন (affl-* login, affr-* register) */
  "affiliate:auth-login": [
    "affl-card-bg", "affl-title", "affl-subtitle",
    "affl-input-bg", "affl-btn-bg", "affl-btn-text", "affl-link",
  ],
  "affiliate:auth-register": [
    "affr-card-bg", "affr-title", "affr-subtitle",
    "affr-input-bg", "affr-btn-bg", "affr-btn-text", "affr-link",
  ],
  "affiliate:auth-forgot": [
    "afff-card-bg", "afff-title", "afff-subtitle",
    "afff-input-bg", "afff-btn-bg", "afff-btn-text", "afff-link",
  ],
  /* হেল্প সাইট — বেস প্যালেট টোকেন সরাসরি override */
  "help:site": [
    "bg", "bg-soft", "panel", "gold", "gold-bright",
    "gold-grad-top", "gold-grad-bottom",
    "text", "text-soft", "text-mute", "line",
  ],
};

const cleanScoped = (scope, input = {}) => {
  const allowed = new Set(SECTION_TOKENS[scope] || []);
  const out = {};
  Object.entries(input || {}).forEach(([k, v]) => {
    const val = String(v ?? "").trim();
    if (allowed.has(k) && HEX.test(val)) out[k] = val;
  });
  return out;
};

/* ── পাবলিক ── */
router.get("/client/public", async (req, res) => {
  try {
    const theme = await ClientTheme.current();
    return successResponse(res, "Client theme", toJSON(theme));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* ── অ্যাডমিন ── */
router.get("/admin/client", protectAdmin, requireMother, async (req, res) => {
  try {
    const theme = await ClientTheme.current();
    return successResponse(res, "Client theme", toJSON(theme));
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin/client",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const theme = await ClientTheme.current();
      if (typeof req.body?.active === "boolean") theme.active = req.body.active;
      if (req.body?.colors !== undefined) {
        theme.colors = clean(req.body.colors);
      }
      await theme.save();
      return successResponse(res, "Client theme saved", toJSON(theme));
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.patch(
  "/admin/client/reset",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const theme = await ClientTheme.current();
      theme.colors = {};
      await theme.save();
      return successResponse(res, "Client theme reset", toJSON(theme));
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   সেকশন-ভিত্তিক থিম (generic)
   ========================= */

/** এক সাইটের সব সেকশনের কালার একসাথে (ThemeApplier এর জন্য) */
router.get("/:site/sections/public", async (req, res) => {
  try {
    const prefix = `${req.params.site}:`;
    const docs = await SectionTheme.find({
      scope: { $regex: `^${prefix}` },
    }).lean();

    const colors = {};
    docs.forEach((d) => {
      Object.entries(d.colors || {}).forEach(([k, v]) => {
        colors[k] = v;
      });
    });

    return successResponse(res, "Section themes", { colors });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const scopeOf = (req) => `${req.params.site}:${req.params.section}`;

router.get(
  "/admin/section/:site/:section",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const doc = await SectionTheme.forScope(scopeOf(req));
      return successResponse(res, "Section theme", {
        scope: doc.scope,
        colors: doc.colors ? Object.fromEntries(doc.colors) : {},
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/section/:site/:section",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const scope = scopeOf(req);
      const doc = await SectionTheme.forScope(scope);
      doc.colors = cleanScoped(scope, req.body?.colors);
      await doc.save();
      return successResponse(res, "Section theme saved", {
        scope,
        colors: Object.fromEntries(doc.colors),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.patch(
  "/admin/section/:site/:section/reset",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const doc = await SectionTheme.forScope(scopeOf(req));
      doc.colors = {};
      await doc.save();
      return successResponse(res, "Section theme reset", { colors: {} });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
