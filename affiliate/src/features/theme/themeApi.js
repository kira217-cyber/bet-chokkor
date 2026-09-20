import { api } from "../../api/axios";

/** অ্যাফিলিয়েট সাইটের সেকশন থিম কালার (অ্যাডমিন-নিয়ন্ত্রিত) */
export const fetchAffiliateSections = async () => {
  const { data } = await api.get("/api/theme/affiliate/sections/public");
  return data?.data?.colors || {};
};
