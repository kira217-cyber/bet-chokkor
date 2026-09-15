import ReferralSetting from "../models/ReferralSetting.js";
import ReferralReward from "../models/ReferralReward.js";
import User from "../models/User.js";

import { money, num } from "./depositCalc.js";

/**
 * রেফারেল প্রোগ্রামের হিসাব।
 *
 * দুটো আলাদা জিনিস, দুটোরই নিয়ম অ্যাডমিন ঠিক করেন:
 *
 * ১. **কমিশন** — বন্ধু একটা বাজি ধরলে উপরের দিকের রেফারকারীরা তার
 *    শতাংশ পান। কত শতাংশ, সেটা ঠিক হয় বন্ধুর **মোট টার্নওভার** কোন
 *    ধাপে পড়েছে আর সম্পর্কটা কত দূরের — এই দুটো মিলিয়ে।
 *
 * ২. **মাইলফলক** — এক সময়কালে (সাধারণত মাসে) কতজন সক্রিয় বন্ধু
 *    এনেছেন, তার উপর থোক বোনাস।
 */

/** সময়কালের চাবি — "2026-09" এর মতো, যাতে একই মাসে দুবার না বসে */
export const periodKeyOf = (period, date = new Date()) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");

  if (period === "daily") return `${y}-${m}-${d}`;

  if (period === "weekly") {
    // বছরের কত নম্বর সপ্তাহ — বৃহস্পতিবার ধরে ISO নিয়মে
    const tmp = new Date(Date.UTC(y, date.getUTCMonth(), date.getUTCDate()));
    const day = tmp.getUTCDay() || 7;

    tmp.setUTCDate(tmp.getUTCDate() + 4 - day);

    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);

    return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  }

  return `${y}-${m}`;
};

/** সময়কালটা কখন শুরু হয়েছিল */
export const periodStart = (period, date = new Date()) => {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();

  if (period === "daily") {
    return new Date(Date.UTC(y, m, date.getUTCDate()));
  }

  if (period === "weekly") {
    const day = date.getUTCDay() || 7;
    const start = new Date(Date.UTC(y, m, date.getUTCDate()));

    start.setUTCDate(start.getUTCDate() - (day - 1));
    return start;
  }

  return new Date(Date.UTC(y, m, 1));
};

/**
 * বন্ধুর অবস্থা দেখে কোন ধাপ প্রযোজ্য।
 *
 * শর্ত পূরণ করা ধাপগুলোর মধ্যে সবচেয়ে উপরেরটা — তাই বেশি খেললে বেশি
 * শতাংশ, কম খেললে কম।
 */
export const pickBand = (bands, stats) => {
  const ok = (Array.isArray(bands) ? bands : []).filter(
    (band) =>
      num(stats.turnover) >= num(band.requireTurnover) &&
      num(stats.deposit) >= num(band.requireDeposit) &&
      num(stats.winLoss) >= num(band.requireWinLoss),
  );

  if (!ok.length) return null;

  return ok.reduce((best, band) =>
    num(band.requireTurnover) >= num(best.requireTurnover) ? band : best,
  );
};

const percentFor = (band, tier) =>
  num(band?.tiers?.find((item) => num(item.tier) === tier)?.percent);

/**
 * একটা বাজির জন্য উপরের দিকের সবাইকে কমিশন দেওয়া।
 *
 * খেলোয়াড় থেকে শুরু করে `referredBy` ধরে উপরে ওঠা হয় — এক ধাপ উঠলে
 * tier ১, দুই ধাপে ২, এভাবে `maxTier` পর্যন্ত। প্রত্যেকের শতাংশ হিসাব
 * হয় **খেলোয়াড়ের** টার্নওভার অনুযায়ী, কারণ ধাপটা তারই কৃতিত্ব।
 *
 * কলব্যাক থেকে ডাকা হয় বলে এটা কখনো throw করে না — রেফারেলের হিসাব
 * আটকে গিয়ে যেন খেলার টাকার হিসাব ভেঙে না পড়ে।
 */
export const applyReferralCommission = async ({
  player,
  wager,
  gameHistoryId,
}) => {
  try {
    const amount = money(num(wager));

    if (amount <= 0 || !player?.referredBy) return [];

    const setting = await ReferralSetting.current();

    if (!setting.isActive || !setting.commissionBands.length) return [];

    // ধাপটা খেলোয়াড়ের নিজের অবস্থা দেখে
    const band = pickBand(setting.commissionBands, {
      turnover: player.totalTurnover,
      deposit: player.totalDeposit,
      winLoss: 0,
    });

    if (!band) return [];

    const made = [];
    let current = player;

    for (let tier = 1; tier <= num(setting.maxTier); tier += 1) {
      if (!current?.referredBy) break;

      const upline = await User.findById(current.referredBy).select(
        "userId isActive referredBy balance",
      );

      if (!upline) break;

      // বন্ধ অ্যাকাউন্ট কমিশন পাবে না, কিন্তু তার উপরের জন পাবেন —
      // মাঝখানে একজন বন্ধ থাকলে পুরো চেইন থেমে যাওয়া উচিত নয়
      if (upline.isActive) {
        const percent = percentFor(band, tier);

        if (percent > 0) {
          const reward = money((amount * percent) / 100);

          if (reward > 0) {
            try {
              await ReferralReward.create({
                user: upline._id,
                userIdText: upline.userId,
                type: "commission",
                amount: reward,
                status: setting.isAutoClaim ? "claimed" : "claimable",
                claimedAt: setting.isAutoClaim ? new Date() : null,
                fromUser: player._id,
                fromUserIdText: player.userId,
                tier,
                wager: amount,
                percent,
                gameHistory: gameHistoryId || null,
              });

              if (setting.isAutoClaim) {
                await User.updateOne(
                  { _id: upline._id },
                  { $inc: { balance: reward } },
                );
              }

              made.push({ user: upline.userId, tier, amount: reward });
            } catch (error) {
              // unique index — একই রাউন্ড আবার এলে চুপচাপ বাদ
              if (error?.code !== 11000) throw error;
            }
          }
        }
      }

      current = upline;
    }

    return made;
  } catch (error) {
    console.error("Referral commission failed:", error.message);
    return [];
  }
};

/**
 * এই সময়কালে কতজন সক্রিয় বন্ধু এনেছেন, আর কোন মাইলফলক পেরিয়েছেন।
 *
 * "সক্রিয়" মানে অ্যাডমিনের ঠিক করা ন্যূনতম ডিপোজিট ও টার্নওভার
 * পেরিয়েছেন — নইলে শুধু অ্যাকাউন্ট খুলিয়েই বোনাস নেওয়া যেত।
 */
export const evaluateAchievements = async (userId) => {
  const setting = await ReferralSetting.current();

  const empty = {
    period: setting.achievement.period,
    periodKey: "",
    activeCount: 0,
    milestones: [],
  };

  if (!setting.isActive || !setting.achievement.milestones.length) return empty;

  const period = setting.achievement.period;
  const key = periodKeyOf(period);
  const since = periodStart(period);

  const invited = await User.find({
    referredBy: userId,
    createdAt: { $gte: since },
  })
    .select("_id totalTurnover totalDeposit")
    .lean();

  const minDeposit = num(setting.activeDownline.depositRequirement);
  const minTurnover = num(setting.activeDownline.turnoverRequirement);

  const activeCount = invited.filter(
    (item) =>
      num(item.totalDeposit) >= minDeposit &&
      num(item.totalTurnover) >= minTurnover,
  ).length;

  // ইতিমধ্যে যেগুলো দেওয়া হয়ে গেছে
  const already = await ReferralReward.find({
    user: userId,
    type: "achievement",
    periodKey: key,
  })
    .select("milestoneCount")
    .lean();

  const paid = new Set(already.map((item) => num(item.milestoneCount)));

  const milestones = setting.achievement.milestones
    .slice()
    .sort((a, b) => num(a.count) - num(b.count))
    .map((item) => ({
      count: num(item.count),
      amount: num(item.amount),
      reached: activeCount >= num(item.count),
      given: paid.has(num(item.count)),
    }));

  return { period, periodKey: key, activeCount, milestones };
};

/**
 * পেরিয়ে যাওয়া মাইলফলকগুলোর টাকা বসানো।
 *
 * ব্যবহারকারী পাতাটা খুললে বা claim চাপলে ডাকা হয় — আলাদা cron লাগে
 * না, আর তাতে হিসাবটা সব সময় এখনকার নিয়ম মেনেই হয়।
 */
export const grantAchievements = async (user) => {
  const state = await evaluateAchievements(user._id);

  const due = state.milestones.filter((item) => item.reached && !item.given);

  if (!due.length) return state;

  const setting = await ReferralSetting.current();

  for (const item of due) {
    try {
      await ReferralReward.create({
        user: user._id,
        userIdText: user.userId,
        type: "achievement",
        amount: item.amount,
        status: setting.isAutoClaim ? "claimed" : "claimable",
        claimedAt: setting.isAutoClaim ? new Date() : null,
        periodKey: state.periodKey,
        milestoneCount: item.count,
      });

      if (setting.isAutoClaim) {
        await User.updateOne(
          { _id: user._id },
          { $inc: { balance: item.amount } },
        );
      }
    } catch (error) {
      // unique index — একই মাইলফলক দুবার নয়
      if (error?.code !== 11000) throw error;
    }
  }

  return evaluateAchievements(user._id);
};

/**
 * একজনের রেফারেলের পুরো ছবি — পাতাটা যা যা দেখায়।
 */
export const referralOverview = async (user) => {
  const setting = await ReferralSetting.current();

  const [downline, rewards] = await Promise.all([
    User.find({ referredBy: user._id })
      .select("userId createdAt totalTurnover totalDeposit isActive")
      .sort({ createdAt: -1 })
      .lean(),
    ReferralReward.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: { type: "$type", status: "$status" },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const minDeposit = num(setting.activeDownline.depositRequirement);
  const minTurnover = num(setting.activeDownline.turnoverRequirement);

  const active = downline.filter(
    (item) =>
      num(item.totalDeposit) >= minDeposit &&
      num(item.totalTurnover) >= minTurnover,
  );

  const sum = (type, status) =>
    money(
      rewards
        .filter(
          (item) =>
            (!type || item._id.type === type) &&
            (!status || item._id.status === status),
        )
        .reduce((total, item) => total + num(item.total), 0),
    );

  return {
    downlineCount: downline.length,
    activeDownlineCount: active.length,
    activeDownlineTurnover: money(
      active.reduce((total, item) => total + num(item.totalTurnover), 0),
    ),
    claimable: sum(null, "claimable"),
    claimed: sum(null, "claimed"),
    commissionTotal: sum("commission", null),
    achievementTotal: sum("achievement", null),
  };
};
