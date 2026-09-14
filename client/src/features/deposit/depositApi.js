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

/** মূল সাইটের মতো দুটো ভাগ — ই-ওয়ালেট ও ক্রিপ্টো */
export const GROUPS = [
  { key: "ewallet", labelKey: "groupEwallet" },
  { key: "crypto", labelKey: "groupCrypto" },
  { key: "bank", labelKey: "groupBank" },
];

/**
 * একটা ভাগের সবচেয়ে বড় বোনাসের হার।
 *
 * ভাগের সারিতে "১০০% পর্যন্ত" লেখাটা এখান থেকেই আসে — ভিতরের কোনো
 * মেথডে যত বেশি বোনাস আছে, সেটাই দেখানো হয়।
 */
export const groupTopPercent = (methods) => {
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
