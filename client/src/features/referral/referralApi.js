import { api } from "../../api/axios";

/**
 * রেফারেল প্রোগ্রাম।
 *
 * `/my` খোলার সময়েই সার্ভার পেরিয়ে যাওয়া মাইলফলকগুলো বসিয়ে দেয়, তাই
 * পাতাটা খুললেই হিসাব হালনাগাদ হয়ে যায়।
 */
export const fetchReferral = async () => {
  const { data } = await api.get("/api/referral/my");
  return data?.data || { setting: {}, overview: null, achievement: null };
};

export const fetchReferralRewards = async ({ type, page = 1, limit = 10 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  if (type) params.set("type", type);

  const { data } = await api.get(`/api/referral/my/rewards?${params}`);
  return data?.data || { rows: [], meta: {} };
};

export const fetchDownline = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });

  const { data } = await api.get(`/api/referral/my/downline?${params}`);
  return data?.data || { rows: [], meta: {} };
};

/** জমে থাকা সব পুরস্কার ব্যালেন্সে নেওয়া */
export const claimReferral = async () => {
  const { data } = await api.post("/api/referral/my/claim");
  return data?.data || null;
};
