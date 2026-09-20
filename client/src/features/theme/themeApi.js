import { api } from "../../api/axios";

/** ক্লায়েন্ট সাইটের বেস থিম কালার (অ্যাডমিন-নিয়ন্ত্রিত) */
export const fetchClientTheme = async () => {
  const { data } = await api.get("/api/theme/client/public");
  return data?.data || { active: true, colors: {} };
};

/** সব সেকশনের কালার একসাথে (nav-*, side-* …) */
export const fetchClientSections = async () => {
  const { data } = await api.get("/api/theme/client/sections/public");
  return data?.data?.colors || {};
};
