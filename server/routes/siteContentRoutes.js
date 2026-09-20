import express from "express";
import fs from "node:fs";
import path from "node:path";

import upload from "../config/multer.js";
import Slider from "../models/Slider.js";
import SiteNotice from "../models/SiteNotice.js";
import HomeEvent from "../models/HomeEvent.js";
import Promotion from "../models/Promotion.js";
import PromoPage from "../models/PromoPage.js";

import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const num = (value) => Number(value) || 0;
const bool = (value) => value !== "false" && value !== false && value !== undefined;

const langText = (input) => {
  const obj = typeof input === "string" ? parseMaybe(input) : input || {};
  return { bn: text(obj?.bn), en: text(obj?.en) };
};

function parseMaybe(value) {
  if (typeof value !== "string") return value || {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

/** আমাদের আপলোড হলে ডিস্ক থেকে ছবি মুছে ফেলা */
const removeImage = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  fs.promises.unlink(path.join("uploads", path.basename(url))).catch(() => {});
};

const fileUrl = (file) => (file ? `/uploads/${file.filename}` : "");

/* =========================
   ক্লায়েন্ট (পাবলিক)
   ========================= */

router.get("/public", async (req, res) => {
  try {
    const [sliders, notice, events, promotions, promoPage] = await Promise.all([
      Slider.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      SiteNotice.current(),
      HomeEvent.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      Promotion.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean(),
      PromoPage.current(),
    ]);

    return successResponse(res, "Site content loaded", {
      sliders,
      notice: notice?.isActive ? notice.text : null,
      events,
      promotions,
      promoPage: { heading: promoPage.heading, subheading: promoPage.subheading },
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন — স্লাইডার
   ========================= */

router.get("/admin/sliders", protectAdmin, requireMother, async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1, createdAt: 1 }).lean();
    return successResponse(res, "Sliders loaded", { sliders });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const sliderUpload = upload.fields([
  { name: "imageDesktop", maxCount: 1 },
  { name: "imageMobile", maxCount: 1 },
]);

router.post(
  "/admin/sliders",
  protectAdmin,
  requireMother,
  requireWrite,
  sliderUpload,
  async (req, res) => {
    try {
      const body = req.body || {};
      const desktop = fileUrl(req.files?.imageDesktop?.[0]);
      const mobile = fileUrl(req.files?.imageMobile?.[0]);

      if (!desktop && !mobile) {
        return errorResponse(res, "At least one image is required", 400);
      }

      const slider = await Slider.create({
        imageDesktop: desktop,
        imageMobile: mobile || desktop,
        link: text(body.link),
        isActive: bool(body.isActive),
        order: num(body.order),
      });

      return successResponse(res, "Slider created", { slider }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/sliders/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  sliderUpload,
  async (req, res) => {
    try {
      const slider = await Slider.findById(req.params.id);
      if (!slider) return errorResponse(res, "Slider not found", 404);

      const body = req.body || {};
      const desktop = fileUrl(req.files?.imageDesktop?.[0]);
      const mobile = fileUrl(req.files?.imageMobile?.[0]);

      if (desktop) {
        removeImage(slider.imageDesktop);
        slider.imageDesktop = desktop;
      }
      if (mobile) {
        removeImage(slider.imageMobile);
        slider.imageMobile = mobile;
      }
      if (body.link !== undefined) slider.link = text(body.link);
      if (body.isActive !== undefined) slider.isActive = bool(body.isActive);
      if (body.order !== undefined) slider.order = num(body.order);

      await slider.save();
      return successResponse(res, "Slider updated", { slider });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/sliders/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const slider = await Slider.findByIdAndDelete(req.params.id);
      if (!slider) return errorResponse(res, "Slider not found", 404);

      removeImage(slider.imageDesktop);
      removeImage(slider.imageMobile);
      return successResponse(res, "Slider deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — নোটিশ
   ========================= */

router.get("/admin/notice", protectAdmin, requireMother, async (req, res) => {
  try {
    const notice = await SiteNotice.current();
    return successResponse(res, "Notice loaded", { notice });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin/notice",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const notice = await SiteNotice.current();
      const body = req.body || {};

      if (body.text !== undefined) notice.text = langText(body.text);
      if (body.isActive !== undefined) notice.isActive = bool(body.isActive);

      await notice.save();
      return successResponse(res, "Notice updated", { notice });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — ইভেন্ট
   ========================= */

router.get("/admin/events", protectAdmin, requireMother, async (req, res) => {
  try {
    const events = await HomeEvent.find().sort({ order: 1, createdAt: 1 }).lean();
    return successResponse(res, "Events loaded", { events });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

const eventUpload = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "modalImage", maxCount: 1 },
]);

const buildEvent = (body, files, event = {}) => {
  const image = fileUrl(files?.image?.[0]);
  const modalImage = fileUrl(files?.modalImage?.[0]);

  const actionType = ["none", "link", "modal"].includes(body.actionType)
    ? body.actionType
    : event.actionType || "none";

  return {
    image: image || event.image || "",
    actionType,
    linkUrl: body.linkUrl !== undefined ? text(body.linkUrl) : event.linkUrl || "",
    modal: {
      title: body.modalTitle !== undefined ? langText(body.modalTitle) : event.modal?.title || {},
      description:
        body.modalDescription !== undefined
          ? langText(body.modalDescription)
          : event.modal?.description || {},
      image: modalImage || event.modal?.image || "",
    },
    isActive: body.isActive !== undefined ? bool(body.isActive) : event.isActive !== false,
    order: body.order !== undefined ? num(body.order) : event.order || 0,
  };
};

router.post(
  "/admin/events",
  protectAdmin,
  requireMother,
  requireWrite,
  eventUpload,
  async (req, res) => {
    try {
      const data = buildEvent(req.body || {}, req.files);
      if (!data.image) return errorResponse(res, "Event image is required", 400);

      const event = await HomeEvent.create(data);
      return successResponse(res, "Event created", { event }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/events/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  eventUpload,
  async (req, res) => {
    try {
      const event = await HomeEvent.findById(req.params.id);
      if (!event) return errorResponse(res, "Event not found", 404);

      const newImage = fileUrl(req.files?.image?.[0]);
      const newModalImage = fileUrl(req.files?.modalImage?.[0]);
      if (newImage) removeImage(event.image);
      if (newModalImage) removeImage(event.modal?.image);

      const data = buildEvent(req.body || {}, req.files, event.toObject());
      Object.assign(event, data);
      await event.save();

      return successResponse(res, "Event updated", { event });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/events/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const event = await HomeEvent.findByIdAndDelete(req.params.id);
      if (!event) return errorResponse(res, "Event not found", 404);

      removeImage(event.image);
      removeImage(event.modal?.image);
      return successResponse(res, "Event deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — প্রমোশন
   ========================= */

router.get("/admin/promotions", protectAdmin, requireMother, async (req, res) => {
  try {
    const promotions = await Promotion.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();
    return successResponse(res, "Promotions loaded", { promotions });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/admin/promotions",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("image"),
  async (req, res) => {
    try {
      const body = req.body || {};
      const image = fileUrl(req.file);
      if (!image) return errorResponse(res, "Promotion image is required", 400);

      const promotion = await Promotion.create({
        image,
        title: langText(body.title),
        description: langText(body.description),
        tag: text(body.tag),
        category: text(body.category).toLowerCase() || "welcome-offer",
        startAt: body.startAt ? new Date(body.startAt) : null,
        endAt: body.endAt ? new Date(body.endAt) : null,
        isActive: bool(body.isActive),
        order: num(body.order),
      });

      return successResponse(res, "Promotion created", { promotion }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/promotions/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  upload.single("image"),
  async (req, res) => {
    try {
      const promotion = await Promotion.findById(req.params.id);
      if (!promotion) return errorResponse(res, "Promotion not found", 404);

      const body = req.body || {};
      const image = fileUrl(req.file);
      if (image) {
        removeImage(promotion.image);
        promotion.image = image;
      }
      if (body.title !== undefined) promotion.title = langText(body.title);
      if (body.description !== undefined) {
        promotion.description = langText(body.description);
      }
      if (body.tag !== undefined) promotion.tag = text(body.tag);
      if (body.category !== undefined) {
        promotion.category = text(body.category).toLowerCase() || "welcome-offer";
      }
      if (body.startAt !== undefined) {
        promotion.startAt = body.startAt ? new Date(body.startAt) : null;
      }
      if (body.endAt !== undefined) {
        promotion.endAt = body.endAt ? new Date(body.endAt) : null;
      }
      if (body.isActive !== undefined) promotion.isActive = bool(body.isActive);
      if (body.order !== undefined) promotion.order = num(body.order);

      await promotion.save();
      return successResponse(res, "Promotion updated", { promotion });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admin/promotions/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const promotion = await Promotion.findByIdAndDelete(req.params.id);
      if (!promotion) return errorResponse(res, "Promotion not found", 404);

      removeImage(promotion.image);
      return successResponse(res, "Promotion deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন — প্রমোশন পেজের হেডিং
   ========================= */

router.get(
  "/admin/promo-page",
  protectAdmin,
  requireMother,
  async (req, res) => {
    try {
      const page = await PromoPage.current();
      return successResponse(res, "Promo page loaded", {
        heading: page.heading,
        subheading: page.subheading,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admin/promo-page",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const page = await PromoPage.current();
      const body = req.body || {};
      if (body.heading !== undefined) page.heading = langText(body.heading);
      if (body.subheading !== undefined) {
        page.subheading = langText(body.subheading);
      }
      await page.save();
      return successResponse(res, "Promo page saved", {
        heading: page.heading,
        subheading: page.subheading,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
