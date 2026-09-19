import { api } from "../../api/axios";

/** নিজের VIP অবস্থা (লেভেল, XP, পয়েন্ট, প্রোগ্রেস) */
export const fetchVipMe = async () => {
  const { data } = await api.get("/api/vip/me");
  return data?.data || {};
};

/** পুরো ল্যাডার + সেটিং (VIP ক্লাব পেজ) */
export const fetchVipLevels = async () => {
  const { data } = await api.get("/api/vip/levels");
  return data?.data || { levels: [], setting: {} };
};

/** পয়েন্ট → ক্যাশে রূপান্তর */
export const convertVipPoints = async (points) => {
  const { data } = await api.post("/api/vip/convert", points ? { points } : {});
  return data?.data || {};
};

/** নিজের VIP ইতিহাস */
export const fetchVipHistory = async (page = 1, type = "") => {
  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (type) params.set("type", type);
  const { data } = await api.get(`/api/vip/history/my?${params}`);
  return data?.data || { rows: [], meta: {} };
};
