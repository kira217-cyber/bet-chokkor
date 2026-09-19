import User from "../models/User.js";
import VipLevel from "../models/VipLevel.js";
import VipSetting from "../models/VipSetting.js";
import VipTransaction from "../models/VipTransaction.js";
import { num, money } from "./depositCalc.js";

/**
 * বাজি থেকে VIP XP ও পয়েন্ট জমা এবং লেভেল-আপ।
 *
 * প্রতি বাজিতে ডাকা হয় (কলব্যাক উত্তর পাঠানোর পরে, ননব্লকিং)। প্রতিটা
 * earn আলাদা করে লগ করা হয় না (তাহলে GameHistory এর সমান লেখা হতো) —
 * শুধু অর্থবহ ঘটনা (লেভেল-আপ ও তার বোনাস) VipTransaction এ থাকে।
 * কনভার্ট/অ্যাডজাস্ট আলাদা রুট থেকে লগ হয়।
 */
export const applyVipEarning = async ({ player, wager }) => {
  const bet = money(wager);
  if (bet <= 0) return;

  const setting = await VipSetting.current();
  if (!setting.active) return;

  const xpGain = money(bet * num(setting.xpPerTurnover));
  const pointGain = money(bet * num(setting.pointPerTurnover));

  if (xpGain <= 0 && pointGain <= 0) return;

  // XP/পয়েন্ট atomic ভাবে জমা — পুরোনো লেভেলসহ ডকুমেন্ট ফেরত
  const updated = await User.findOneAndUpdate(
    { _id: player._id },
    { $inc: { vipXP: xpGain, vipPoints: pointGain } },
    { new: true },
  );

  if (!updated) return;

  // নতুন XP অনুযায়ী সর্বোচ্চ প্রাপ্য লেভেল
  const levels = await VipLevel.find({ isActive: true }).sort({ lv: 1 }).lean();
  if (!levels.length) return;

  let targetLv = 1;
  for (const level of levels) {
    if (num(updated.vipXP) >= num(level.xpRequired)) {
      targetLv = Math.max(targetLv, level.lv);
    }
  }

  const fromLv = num(updated.vipLevel) || 1;
  if (targetLv <= fromLv) return;

  // মাঝের সব লেভেলের আপগ্রেড বোনাস একসাথে
  const crossed = levels.filter((l) => l.lv > fromLv && l.lv <= targetLv);
  const bonus = money(
    crossed.reduce((sum, l) => sum + num(l.upgradeBonus), 0),
  );

  await User.updateOne(
    { _id: updated._id },
    {
      $set: { vipLevel: targetLv },
      ...(bonus > 0 ? { $inc: { balance: bonus } } : {}),
    },
  );

  await VipTransaction.create({
    user: updated._id,
    userIdText: updated.userId,
    type: "upgrade",
    levelFrom: fromLv,
    levelTo: targetLv,
    note: "Reached a new VIP level",
  });

  if (bonus > 0) {
    await VipTransaction.create({
      user: updated._id,
      userIdText: updated.userId,
      type: "bonus",
      amount: bonus,
      levelTo: targetLv,
      note: "Level-up bonus",
    });
  }
};

export default applyVipEarning;
