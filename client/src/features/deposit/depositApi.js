import { api } from "../../api/axios";

/**
 * ডিপোজিট পেজের সব তথ্য একসাথে।
 *
 * মেথড, ফর্মের ঘর আর বোনাসের নিয়ম সার্ভারে আলাদা থাকলেও একবারেই আসে,
 * তাই পেজ খুলতে তিনটে রিকোয়েস্ট লাগে না।
 */
export const fetchDepositMethods = async () => {
  const { data } = await api.get("/api/deposit-methods/public");
  return data?.data?.methods || [];
};

export const submitDeposit = async (payload) => {
  const { data } = await api.post("/api/deposit-requests", payload);
  return data?.data?.request || null;
};

export const fetchMyDeposits = async (limit = 20) => {
  const { data } = await api.get(`/api/deposit-requests/my?limit=${limit}`);
  return data?.data?.requests || [];
};

/** অটো ডিপোজিট চালু কিনা আর কী কী বোনাস বাছা যায় */
export const fetchAutoStatus = async () => {
  try {
    const { data } = await api.get("/api/auto-deposit/status");
    return data?.data || { active: false, bonuses: [] };
  } catch {
    // জানা না গেলে অটো বন্ধ ধরে নেওয়া — ম্যানুয়াল দিয়ে কাজ চলে
    return { active: false, bonuses: [] };
  }
};

/** গেটওয়ের পেমেন্ট পাতা চাওয়া */
export const startAutoDeposit = async (payload) => {
  const { data } = await api.post("/api/auto-deposit/create", payload);
  return data?.data || {};
};

/**
 * সবচেয়ে বড় বোনাসের হার।
 *
 * সারিতে "১০০% পর্যন্ত" লেখাটা এখান থেকেই আসে — ভিতরে যত বেশি বোনাস
 * আছে, সেটাই দেখানো হয়।
 */
export const topPercent = (methods = [], bonuses = []) => {
  let top = 0;

  methods.forEach((method) => {
    (method.channels || []).forEach((channel) => {
      top = Math.max(top, Number(channel.bonusPercent || 0));
    });

    (method.promotions || []).forEach((promo) => {
      if (promo.bonusType === "percent") {
        top = Math.max(top, Number(promo.bonusValue || 0));
      }
    });
  });

  bonuses.forEach((bonus) => {
    if (bonus.bonusType === "percent") {
      top = Math.max(top, Number(bonus.bonusValue || 0));
    }
  });

  return top;
};

const num = (value) => Number(value) || 0;

/**
 * ব্যবহারকারী যা পাবেন তার আগাম হিসাব।
 *
 * সার্ভারও ঠিক এই নিয়মেই গোনে (`utils/depositCalc.js`) — এখানে শুধু
 * দেখানোর জন্য, যাতে টাকার অঙ্ক লেখার সাথে সাথেই বোনাসটা চোখে পড়ে।
 */
export const previewCalc = ({ amount, method, channel, promo }) => {
  const base = num(amount);
  const channelPercent = num(channel?.bonusPercent);
  const percentBonus = (base * channelPercent) / 100;

  const promoBonus = promo
    ? promo.bonusType === "percent"
      ? (base * num(promo.bonusValue)) / 100
      : num(promo.bonusValue)
    : 0;

  const totalBonus = percentBonus + promoBonus;
  const credited = base + totalBonus;

  const multiplier = promo
    ? num(promo.turnoverMultiplier)
    : num(method?.turnoverMultiplier);

  return {
    amount: base,
    channelPercent,
    percentBonus,
    promoBonus,
    totalBonus,
    credited,
    multiplier,
    targetTurnover: credited * multiplier,
  };
};
