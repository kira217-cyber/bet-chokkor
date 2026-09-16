import { api } from "../../api/axios";

/**
 * অ্যাপ ডাউনলোডের তথ্য।
 *
 * APK আপলোড থাকলে `available: true` আর ডাউনলোডের ঠিকানা আসে; নইলে
 * `note` এর লেখাটা — "শীঘ্রই আসছে" জাতীয় কিছু।
 */
export const fetchAppDownload = async () => {
  const { data } = await api.get("/api/app-download/public");
  return data?.data || { available: false, note: {} };
};
