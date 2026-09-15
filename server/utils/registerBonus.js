import RegisterBonusCampaign from "../models/RegisterBonusCampaign.js";
import TurnOver from "../models/TurnOver.js";
import { money, num } from "./depositCalc.js";

/**
 * নতুন ইউজারকে রেজিস্টার বোনাস দেওয়া।
 *
 * টাকাটা সাথে সাথেই ব্যালেন্সে যায় — নইলে বোনাস দিয়ে খেলাই যেত না, আর
 * না খেললে টার্নওভারও কখনো পূরণ হতো না। টার্নওভার টাকা আটকায় না,
 * **তোলা** আটকায়: চলতি টার্নওভার থাকলে উইথড্র করা যায় না।
 *
 * চালু ক্যাম্পেইন না থাকলে চুপচাপ null — রেজিস্টার আটকায় না।
 */
export const grantRegisterBonus = async (user) => {
  try {
    const campaign = await RegisterBonusCampaign.activeOne();

    if (!campaign) return null;

    const amount = money(num(campaign.bonusAmount));
    const multiplier = num(campaign.turnoverMultiplier);

    if (amount <= 0) return null;

    user.balance = money(num(user.balance) + amount);

    user.pendingRegisterBonus = {
      bonusId: campaign._id,
      amount,
      turnoverMultiplier: multiplier,
      isApplied: true,
      appliedAt: new Date(),
    };

    await user.save();

    const required = money(amount * multiplier);

    // গুণক ০ হলে শর্তই নেই — সাথে সাথে তোলা যায়
    const turnover =
      required > 0
        ? await TurnOver.create({
            user: user._id,
            sourceType: "register-bonus",
            sourceId: campaign._id,
            title: campaign.title?.en || "Register bonus",
            creditedAmount: amount,
            required,
            eligibleProviders: campaign.eligibleProviders || [],
            status: "running",
          })
        : null;

    return {
      campaignId: String(campaign._id),
      title: campaign.title,
      amount,
      balance: user.balance,
      turnoverMultiplier: multiplier,
      turnoverRequired: required,
      turnoverId: turnover ? String(turnover._id) : null,
    };
  } catch {
    // বোনাস দিতে না পারলেও রেজিস্টার সফল থাকবে — পরে অ্যাডমিন
    // হাতে দিতে পারবেন, কিন্তু ব্যবহারকারী আটকে থাকবেন না
    return null;
  }
};

export default grantRegisterBonus;
