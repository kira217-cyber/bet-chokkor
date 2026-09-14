import RegisterBonusCampaign from "../models/RegisterBonusCampaign.js";
import TurnOver from "../models/TurnOver.js";

/**
 * নতুন ইউজারকে রেজিস্টার বোনাস দেওয়া।
 *
 * টাকাটা সাথে সাথে ব্যালেন্সে যায় না — টার্নওভারের শর্ত পূরণ হলে
 * তবেই। তাই এখানে দুটো জিনিস হয়: ইউজারের `pendingRegisterBonus` এ
 * বসানো, আর একটা TurnOver হিসাব খোলা।
 *
 * চালু ক্যাম্পেইন না থাকলে চুপচাপ null — রেজিস্টার আটকায় না।
 */
export const grantRegisterBonus = async (user) => {
  try {
    const campaign = await RegisterBonusCampaign.activeOne();

    if (!campaign) return null;

    const amount = Number(campaign.bonusAmount) || 0;
    const multiplier = Number(campaign.turnoverMultiplier) || 0;

    if (amount <= 0) return null;

    user.pendingRegisterBonus = {
      bonusId: campaign._id,
      amount,
      turnoverMultiplier: multiplier,
      isApplied: false,
      appliedAt: null,
    };

    await user.save();

    const turnover = await TurnOver.create({
      user: user._id,
      sourceType: "register-bonus",
      sourceId: campaign._id,
      title: campaign.title?.en || "Register bonus",
      creditedAmount: amount,
      required: amount * multiplier,
      eligibleProviders: campaign.eligibleProviders || [],
      status: "running",
    });

    return {
      campaignId: String(campaign._id),
      title: campaign.title,
      amount,
      turnoverMultiplier: multiplier,
      turnoverRequired: turnover.required,
      turnoverId: String(turnover._id),
    };
  } catch {
    // বোনাস দিতে না পারলেও রেজিস্টার সফল থাকবে — পরে অ্যাডমিন
    // হাতে দিতে পারবেন, কিন্তু ব্যবহারকারী আটকে থাকবেন না
    return null;
  }
};

export default grantRegisterBonus;
