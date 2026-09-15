import express from "express";
import axios from "axios";
import crypto from "crypto";

import GameLaunchSetting from "../models/GameLaunchSetting.js";
import User from "../models/User.js";

import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";

const router = express.Router();

const LAUNCH_TIMEOUT_MS = 30000;
const DEFAULT_LAUNCH_URL = "https://oraclegames.net/api/getgameurl";

const text = (value) => String(value ?? "").trim();

/**
 * কী সহ সেটিংটা আনে।
 *
 * কী স্কিমায় `select: false`, তাই আলাদা করে চাইতে হয় — এতে অন্য কোনো
 * কোয়েরিতে ভুল করে কী বেরিয়ে যাওয়ার পথ থাকে না।
 */
const loadLaunchSetting = async () => {
  const setting = await GameLaunchSetting.findOne()
    .sort({ createdAt: -1 })
    .select("+launchKey");

  if (!setting || !setting.launchKey) return { reason: "not-configured" };
  if (!setting.isActive) return { reason: "inactive" };

  return {
    setting,
    launchKey: setting.launchKey,
    launchUrl: text(setting.launchUrl) || DEFAULT_LAUNCH_URL,
  };
};

/* =========================
   খেলার নাম
   ========================= */

const makeGamePlayName = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const bytes = crypto.randomBytes(10);

  let name = "";
  for (let i = 0; i < 10; i += 1) name += letters[bytes[i] % letters.length];

  return name;
};

const isValidGamePlayName = (value = "") => /^[a-z]{10}$/.test(text(value));

/**
 * গেম প্ল্যাটফর্মে ব্যবহারকারী যে নামে চেনা যান।
 *
 * কলব্যাক এই নাম ধরেই টাকা কাটে-জমা দেয়, তাই নামটা স্থায়ী ও অনন্য
 * হতে হয়। রেজিস্ট্রেশনেই বসে যায়; পুরোনো কোনো অ্যাকাউন্টে না থাকলে
 * (বা নষ্ট থাকলে) এখানে বানিয়ে নেওয়া হয়।
 */
const getOrCreateGamePlayName = async (user) => {
  if (isValidGamePlayName(user.userGamePlayName)) {
    return text(user.userGamePlayName);
  }

  for (let i = 0; i < 50; i += 1) {
    const name = makeGamePlayName();

    if (!(await User.exists({ userGamePlayName: name }))) {
      user.userGamePlayName = name;
      await user.save();
      return name;
    }
  }

  throw new Error("Failed to generate a unique game play name");
};

/** সার্ভিস একেক নামে লিংকটা ফেরত দেয়, তাই সবগুলোই দেখা হয় */
const extractLaunchUrl = (body) =>
  body?.launch_url ||
  body?.launchUrl ||
  body?.gameUrl ||
  body?.url ||
  body?.data?.launch_url ||
  body?.data?.launchUrl ||
  body?.data?.gameUrl ||
  body?.data?.url ||
  "";

/** গেমের লিংক চাওয়া */
const requestLaunchUrl = async ({ launchUrl, launchKey, payload }) => {
  const response = await axios.post(launchUrl, payload, {
    timeout: LAUNCH_TIMEOUT_MS,
    headers: {
      "x-oracle-key": launchKey,
      "Content-Type": "application/json",
    },
  });

  return { url: extractLaunchUrl(response.data), raw: response.data };
};

/* =========================
   খেলোয়াড় — গেম চালু
   ========================= */

/**
 * গেমের লিংক বানিয়ে দেয়।
 *
 * কী ব্রাউজারে কখনো যায় না — ক্লায়েন্ট শুধু gameUId পাঠায়, সার্ভার
 * হেডারে কী বসিয়ে লিংকটা এনে দেয়।
 *
 * পাঠানো `amount` শুধু গেমের পর্দায় দেখানোর জন্য; আসল টাকা কাটা-জমা
 * সবই কলব্যাকে হয় (routes/callbackRoutes.js), তাই এখানে ব্যালেন্সে
 * হাত দেওয়া হয় না।
 */
router.post("/playgame", protectUser, async (req, res) => {
  try {
    const { game_uid: gameUidRaw, gameID, gameId } = req.body || {};
    const gameUId = text(gameUidRaw || gameID || gameId);

    if (!gameUId) {
      return errorResponse(res, "game_uid is required", 400, "missingFields");
    }

    const { launchKey, launchUrl, reason } = await loadLaunchSetting();

    if (!launchKey) {
      return errorResponse(
        res,
        `Game launch key is not ready (${reason})`,
        400,
        "gameNotReady",
      );
    }

    const user = await User.findById(req.user._id);

    if (!user) return errorResponse(res, "User not found", 404, "noAccount");

    const userGamePlayName = await getOrCreateGamePlayName(user);

    const balance = Number(user.balance);
    const amount = Number.isFinite(balance) && balance > 0 ? balance : 0;

    const { url, raw } = await requestLaunchUrl({
      launchUrl,
      launchKey,
      payload: {
        amount: String(Math.floor(amount)),
        username: userGamePlayName,
        game_uid: gameUId,
      },
    });

    if (!url) {
      // আসল কারণটা লগে থাকুক, খেলোয়াড়ের পর্দায় নয় — "Unauthorized
      // request" এর মতো লেখা তাঁর কোনো কাজে আসে না, বরং ভয় ধরায়
      console.error("Game launch failed:", raw);

      return errorResponse(res, "Could not start the game", 502, "gameLaunchFailed");
    }

    return successResponse(res, "Game ready", {
      launchUrl: url,
      gameUId,
      username: userGamePlayName,
    });
  } catch (error) {
    console.error(
      "Game launch error:",
      error?.response?.data || error.message,
    );

    return errorResponse(res, "Could not start the game", 502, "gameLaunchFailed");
  }
});

/* =========================
   অ্যাডমিন — কী ব্যবস্থাপনা
   ========================= */

/** এখনকার অবস্থা — কী নিজে কখনো ফেরত যায় না */
router.get("/admin/setting", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await GameLaunchSetting.findOne()
      .sort({ createdAt: -1 })
      .select("+launchKey");

    if (!setting) {
      return successResponse(res, "Not configured", { setting: null });
    }

    return successResponse(res, "Loaded", {
      setting: setting.toSafeJSON(setting.launchKey),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * কী বসানো বা বদলানো।
 *
 * কী না পাঠিয়ে শুধু ঠিকানা বা চালু/বন্ধ বদলানো যায় — তখন আগের কী-ই
 * থাকে, নইলে ছোট একটা বদল করতে গিয়ে প্রতিবার পুরো কী টাইপ করতে হতো।
 */
router.put(
  "/admin/setting",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const launchKey = text(req.body?.launchKey);
      const launchUrl = text(req.body?.launchUrl);

      let setting = await GameLaunchSetting.findOne()
        .sort({ createdAt: -1 })
        .select("+launchKey");

      if (!setting) {
        if (!launchKey) {
          return errorResponse(res, "Launch key is required", 400, "missingFields");
        }

        setting = new GameLaunchSetting({ launchKey });
      } else if (launchKey) {
        setting.launchKey = launchKey;

        // কী বদলে গেলে আগের যাচাই আর প্রযোজ্য নয়
        setting.isVerified = false;
        setting.lastVerifiedAt = null;
        setting.lastVerifyError = "";
      }

      if (launchUrl) setting.launchUrl = launchUrl;

      if (req.body?.isActive !== undefined) {
        setting.isActive = Boolean(req.body.isActive);
      }

      await setting.save();

      return successResponse(res, "Saved", {
        setting: setting.toSafeJSON(setting.launchKey),
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/**
 * সত্যিকারের একটা গেম চালু করে কী যাচাই।
 *
 * শুধু কী দেখে বোঝার উপায় নেই ওটা কাজ করবে কিনা, তাই একটা gameUId
 * দিয়ে সত্যিই লিংক চাওয়া হয়। লিংকটা খোলা হয় না — এলো কিনা সেটুকুই
 * দেখা হয়, তাই কারো ব্যালেন্সে কিছু ঘটে না।
 */
router.post(
  "/admin/test",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const gameUId = text(req.body?.gameUId);

      if (!gameUId) {
        return errorResponse(res, "gameUId is required", 400, "missingFields");
      }

      const setting = await GameLaunchSetting.findOne()
        .sort({ createdAt: -1 })
        .select("+launchKey");

      if (!setting?.launchKey) {
        return errorResponse(res, "Launch key is not set", 400, "gameNotReady");
      }

      try {
        const { url, raw } = await requestLaunchUrl({
          launchUrl: text(setting.launchUrl) || DEFAULT_LAUNCH_URL,
          launchKey: setting.launchKey,
          // যাচাইয়ের নামটা কোনো আসল খেলোয়াড়ের নয়
          payload: { amount: "0", username: "bctestuser", game_uid: gameUId },
        });

        if (!url) throw new Error(raw?.message || "No launch url received");

        setting.isVerified = true;
        setting.lastVerifiedAt = new Date();
        setting.lastVerifyError = "";
        await setting.save();

        return successResponse(res, "Launch key works", {
          setting: setting.toSafeJSON(setting.launchKey),
        });
      } catch (error) {
        const message =
          error?.response?.data?.message || error.message || "Test failed";

        setting.isVerified = false;
        setting.lastVerifyError = message;
        await setting.save();

        return errorResponse(res, message, 400, "gameLaunchFailed");
      }
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
