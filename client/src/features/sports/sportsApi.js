import { api } from "../../api/axios";

/** হোম পেজের লাইভ ম্যাচ-অডস ফিড (সার্ভার প্রক্সি করে বাইরের ফিড থেকে) */
export const fetchLiveSports = async () => {
  const { data } = await api.get("/api/sports/all-live");
  return data?.data || { date: "", sports: [] };
};
