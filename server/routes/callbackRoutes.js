import express from "express";

import User from "../models/User.js";
import GameHistory from "../models/GameHistory.js";

import { applyTurnoverProgress } from "../utils/turnoverProgress.js";
import { peekProviderCode } from "../utils/gameProviderCatalog.js";

const router = express.Router();

const num = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const money = (value) => Math.trunc(num(value) * 100) / 100;
const text = (value) => String(value ?? "").trim();

/**
 * গেম প্ল্যাটফর্মের নামের লেজ ছেঁটে আমাদের নাম বের করা।
 *
 * মাস্টার প্রতিটা সাইটের খেলোয়াড়কে আলাদা করতে নামের শেষে সাইটের
 * পরিচয় জুড়ে দেয়, তাই সেটা বাদ দিতে হয়।
 */
const SUFFIXES = ["betchokkor", "orclegames", "oraclegames"];

const cleanMemberAccount = (value) => {
  let name = text(value).toLowerCase();

  for (const suffix of SUFFIXES) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length);
      break;
    }
  }

  return name;
};

/**
 * রেফারকারী অ্যাফিলিয়েটের গেম কমিশন।
 *
 * প্লেয়ার হারলে অ্যাফিলিয়েট হারের ভাগ পান (তাঁর পাওনা), আর জিতলে
 * জেতার ভাগটা তাঁর দেনা হিসেবে আলাদা বাকেটে জমে। দুটো মিলিয়ে শেষ
 * হিসাব হয় Bulk Adjustment এ।
 */
const applyAffiliateCommission = async ({ player, netAmount }) => {
  const none = { affiliateUser: null, amount: 0, type: "none" };

  if (!player?.referredBy) return none;

  const affiliate = await User.findOne({
    _id: player.referredBy,
    role: "aff-user",
    isActive: true,
  });

  if (!affiliate) return none;

  if (netAmount < 0) {
    const percent = num(affiliate.gameLossCommission);

    if (percent <= 0) return none;

    const amount = money((Math.abs(netAmount) * percent) / 100);

    affiliate.gameLossCommissionBalance = money(
      num(affiliate.gameLossCommissionBalance) + amount,
    );
    await affiliate.save();

    return { affiliateUser: affiliate._id, amount, type: "game-loss" };
  }

  if (netAmount > 0) {
    const percent = num(affiliate.gameWinCommission);

    if (percent <= 0) return none;

    const amount = money((netAmount * percent) / 100);

    affiliate.gameWinCommissionBalance = money(
      num(affiliate.gameWinCommissionBalance) + amount,
    );
    await affiliate.save();

    return { affiliateUser: affiliate._id, amount, type: "game-win" };
  }

  return none;
};

/**
 * মাস্টারের কলব্যাক — প্রতিটা বাজি ও ফলের খবর এখানে আসে।
 *
 * এখান থেকেই তিনটে কাজ হয়: ব্যালেন্স ঠিক করা, টার্নওভার এগোনো আর
 * অ্যাফিলিয়েটের কমিশন। টার্নওভার তাই সাইটের ভিতরে গোনা হয় না,
 * white-label থেকেই আসে।
 *
 * ভুল হলেও HTTP 200 ফেরত যায়, ভিতরে `success: false` — মাস্টার এভাবেই
 * পড়ে, আর 500 দিলে সে অনির্দিষ্টকাল রিট্রাই করতে থাকত।
 */
router.post("/", async (req, res) => {
  const reply = (body) => res.status(200).json(body);

  try {
    const {
      game_uid: gameUidRaw,
      game_round: gameRoundRaw,
      serial_number: serialRaw,
      bet_amount: betRaw,
      win_amount: winRaw,
      member_account: memberRaw,
      currency_code: currencyRaw,
      timestamp,
    } = req.body || {};

    if (
      !gameUidRaw ||
      !gameRoundRaw ||
      !serialRaw ||
      betRaw === undefined ||
      winRaw === undefined ||
      !memberRaw
    ) {
      return reply({ success: false, balance: 0, message: "Missing required fields" });
    }

    const gameUId = text(gameUidRaw);
    const gameRound = text(gameRoundRaw);
    const serialNumber = text(serialRaw);
    const memberAccount = text(memberRaw);
    const userGamePlayName = cleanMemberAccount(memberRaw);

    const betAmount = money(betRaw);
    const winAmount = money(winRaw);

    if (betAmount < 0 || winAmount < 0) {
      return reply({ success: false, balance: 0, message: "Invalid amount" });
    }

    // একই রাউন্ড আগে এসেছে কিনা — টাকা দুবার কাটা ঠেকাতে
    const duplicate = await GameHistory.findOne({ serialNumber }).lean();

    if (duplicate) {
      return reply({
        success: true,
        balance: duplicate.balanceAfter || 0,
        message: "DUPLICATE",
      });
    }

    const player = await User.findOne({ userGamePlayName, isActive: true });

    if (!player) {
      return reply({
        success: false,
        balance: 0,
        message: "USER_NOT_FOUND",
        data: { memberAccount, userGamePlayName },
      });
    }

    const balanceBefore = money(player.balance);

    if (balanceBefore < betAmount) {
      return reply({
        success: false,
        balance: balanceBefore,
        message: "INSUFFICIENT_BALANCE",
      });
    }

    const netAmount = money(winAmount - betAmount);
    const balanceAfter = money(balanceBefore - betAmount + winAmount);

    let resultType = "push";
    if (netAmount > 0) resultType = "win";
    if (netAmount < 0) resultType = "loss";

    const updated = await User.findByIdAndUpdate(
      player._id,
      { $set: { balance: balanceAfter } },
      { returnDocument: "after" },
    );

    const turnoverApplied =
      betAmount > 0
        ? await applyTurnoverProgress({
            userId: player._id,
            gameUId,
            wagerAmount: betAmount,
          })
        : false;

    const commission = await applyAffiliateCommission({ player, netAmount });

    await GameHistory.create({
      user: player._id,
      userId: player.userId,
      userGamePlayName,
      memberAccount,
      currency: text(currencyRaw) || player.currency || "BDT",

      gameUId,
      gameRound,
      serialNumber,
      // টার্নওভারের জন্য আগেই তোলা হয়ে থাকলে ক্যাশে পাওয়া যাবে
      providerCode: peekProviderCode(gameUId),

      betAmount,
      winAmount,
      netAmount,
      resultType,

      balanceBefore,
      balanceAfter: money(updated?.balance),

      turnoverApplied,
      affiliateUser: commission.affiliateUser,
      affiliateCommissionAmount: commission.amount,
      affiliateCommissionType: commission.type,

      masterTimestamp: text(timestamp),
    });

    return reply({
      success: true,
      balance: money(updated?.balance),
      message: "OK",
    });
  } catch (error) {
    // এখানেও 200 — নইলে মাস্টার একই রাউন্ড বারবার পাঠাতে থাকত
    return reply({ success: false, balance: 0, message: error.message });
  }
});

export default router;
