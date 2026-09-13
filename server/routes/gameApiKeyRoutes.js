import express from "express";
import axios from "axios";

import GameApiKeySetting from "../models/GameApiKeySetting.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { adaptGameData, adaptGameList } from "../utils/gameAdapter.js";
import { getCached, setCached, clearCache } from "../utils/gameCache.js";

const router = express.Router();

const MASTER_TIMEOUT_MS = 30000;

const text = (value) => String(value ?? "").trim();

const masterBaseUrl = () =>
  text(process.env.MASTER_API_URL).replace(/\/+$/, "");

/**
 * কী সহ সেটিংটা আনে। কী স্কিমায় `select: false`, তাই আলাদা করে চাইতে হয় —
 * এতে অন্য কোনো কোয়েরিতে ভুল করে কী বেরিয়ে যাওয়ার পথ থাকে না।
 */
const loadUsableKey = async () => {
  const setting = await GameApiKeySetting.findOne()
    .sort({ createdAt: -1 })
    .select("+apiKey");

  if (!setting) return { reason: "not-configured" };
  if (!setting.apiKey) return { reason: "not-configured" };
  if (!setting.isActive) return { reason: "inactive" };
  if (!setting.isVerified) return { reason: "not-verified" };

  return { setting, apiKey: setting.apiKey };
};

/** master এ GET — কী হেডারে বসিয়ে */
const masterGet = async (path, apiKey, params = {}) => {
  const base = masterBaseUrl();

  if (!base) throw new Error("MASTER_API_URL is missing in .env");

  const response = await axios.get(`${base}${path}`, {
    params,
    timeout: MASTER_TIMEOUT_MS,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

/**
 * ক্লায়েন্টের রুটগুলোর সাধারণ উত্তর।
 *
 * কী বসানো না থাকলে এরর নয় — `configured: false` সহ খালি ডেটা যায়,
 * আর ক্লায়েন্ট তখন নিজের স্ট্যাটিক ডেটাই দেখাতে থাকে। এতে কী বসার
 * আগে-পরে সাইট একইভাবে চলে, কোথাও ভাঙে না।
 */
const notConfigured = (res, reason) =>
  successResponse(res, "Game API key is not ready", {
    configured: false,
    reason,
    data: null,
  });

/* =========================
   অ্যাডমিন — কী ব্যবস্থাপনা
   ========================= */

/** master এ কী যাচাই */
const verifyWithMaster = async (apiKey) => {
  const base = masterBaseUrl();

  if (!base) throw new Error("MASTER_API_URL is missing in .env");
  if (!text(apiKey)) throw new Error("API key is missing");

  const res = await axios.post(
    `${base}/api/master/cx-global/client/verify-token`,
    { token: text(apiKey) },
    {
      timeout: 15000,
      headers: { "Content-Type": "application/json" },
    },
  );

  const body = res.data || {};
  const payload = body?.data || body;

  return {
    valid: Boolean(
      payload?.valid === true || body?.valid === true || body?.success === true,
    ),
    site: payload?.site || body?.site || null,
  };
};

router.get("/", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await GameApiKeySetting.findOne()
      .sort({ createdAt: -1 })
      .select("+apiKey");

    if (!setting) {
      return successResponse(res, "No API key saved yet", { setting: null });
    }

    return successResponse(res, "API key setting loaded", {
      setting: setting.toSafeJSON(setting.apiKey),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** কী বসানো বা বদলানো — সাথে সাথেই master এ যাচাই হয় */
router.post(
  "/",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const apiKey = text(req.body?.apiKey);

      if (!apiKey) {
        return errorResponse(res, "API key is required", 400);
      }

      let verification = { valid: false, site: null };
      let verifyError = "";

      try {
        verification = await verifyWithMaster(apiKey);
      } catch (error) {
        verifyError =
          error?.response?.data?.message || error.message || "Verify failed";
      }

      // একটাই সেটিং রাখি — পুরোনোটা মুছে নতুনটা
      await GameApiKeySetting.deleteMany({});

      const setting = await GameApiKeySetting.create({
        apiKey,
        isActive: true,
        isVerified: verification.valid,
        lastVerifiedAt: verification.valid ? new Date() : null,
        lastVerifyError: verification.valid ? "" : verifyError,
        siteInfo: verification.site,
      });

      // কী বদলেছে মানে অন্য সাইটের ডেটা আসতে পারে — পুরোনো ক্যাশ বাতিল
      clearCache("game:");

      return successResponse(
        res,
        verification.valid
          ? "API key saved and verified"
          : "API key saved, but verification failed",
        { setting: setting.toSafeJSON(apiKey) },
        201,
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** আবার যাচাই */
router.post(
  "/verify",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const setting = await GameApiKeySetting.findOne()
        .sort({ createdAt: -1 })
        .select("+apiKey");

      if (!setting?.apiKey) {
        return errorResponse(res, "No API key saved yet", 404);
      }

      try {
        const verification = await verifyWithMaster(setting.apiKey);

        setting.isVerified = verification.valid;
        setting.lastVerifiedAt = verification.valid ? new Date() : null;
        setting.lastVerifyError = verification.valid ? "" : "Invalid API key";
        setting.siteInfo = verification.site;
      } catch (error) {
        setting.isVerified = false;
        setting.lastVerifyError =
          error?.response?.data?.message || error.message || "Verify failed";
      }

      await setting.save();
      clearCache("game:");

      return successResponse(
        res,
        setting.isVerified ? "API key is valid" : "API key is not valid",
        { setting: setting.toSafeJSON(setting.apiKey) },
      );
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** চালু / বন্ধ */
router.patch(
  "/status",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const setting = await GameApiKeySetting.findOne()
        .sort({ createdAt: -1 })
        .select("+apiKey");

      if (!setting) {
        return errorResponse(res, "No API key saved yet", 404);
      }

      setting.isActive = Boolean(req.body?.isActive);
      await setting.save();
      clearCache("game:");

      return successResponse(res, "Status updated", {
        setting: setting.toSafeJSON(setting.apiKey),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      await GameApiKeySetting.deleteMany({});
      clearCache("game:");

      return successResponse(res, "API key removed");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   ক্লায়েন্ট প্রক্সি
   ========================= */

/** হোম পেজের সব — ক্যাটাগরি, ভেন্ডর, হোম প্রোভাইডার, ফিচার্ড গেম */
router.get("/client/game-data", async (req, res) => {
  try {
    const { apiKey, reason } = await loadUsableKey();

    if (!apiKey) return notConfigured(res, reason);

    const cacheKey = "game:data";
    const cached = getCached(cacheKey);

    if (cached) {
      return successResponse(res, "Game data loaded (cached)", {
        configured: true,
        cached: true,
        data: cached,
      });
    }

    const raw = await masterGet(
      "/api/master/cx-global/client/game-data",
      apiKey,
    );

    const adapted = adaptGameData(raw);
    setCached(cacheKey, adapted);

    return successResponse(res, "Game data loaded", {
      configured: true,
      cached: false,
      data: adapted,
    });
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message || error.message || "Master request failed",
      error?.response?.status || 502,
    );
  }
});

/** এক ক্যাটাগরি/ভেন্ডরের গেম, পেজ করে */
router.get("/client/game-list", async (req, res) => {
  try {
    const { apiKey, reason } = await loadUsableKey();

    if (!apiKey) return notConfigured(res, reason);

    const params = {
      categoryId: text(req.query.categoryId) || undefined,
      providerDbId: text(req.query.providerDbId) || undefined,
      page: Number(req.query.page) || 1,
      limit: Math.min(Number(req.query.limit) || 40, 100),
    };

    const cacheKey = `game:list:${params.categoryId || "-"}:${
      params.providerDbId || "-"
    }:${params.page}:${params.limit}`;

    const cached = getCached(cacheKey);

    if (cached) {
      return successResponse(res, "Game list loaded (cached)", {
        configured: true,
        cached: true,
        data: cached,
      });
    }

    const raw = await masterGet(
      "/api/master/cx-global/client/game-list",
      apiKey,
      params,
    );

    const adapted = adaptGameList(raw);
    setCached(cacheKey, adapted);

    return successResponse(res, "Game list loaded", {
      configured: true,
      cached: false,
      data: adapted,
    });
  } catch (error) {
    return errorResponse(
      res,
      error?.response?.data?.message || error.message || "Master request failed",
      error?.response?.status || 502,
    );
  }
});

export default router;
