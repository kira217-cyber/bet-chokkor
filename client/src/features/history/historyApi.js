import { api } from "../../api/axios";

/**
 * ইতিহাসের সব ডাটা এক জায়গা থেকে।
 *
 * ক্লায়েন্টের তিনটে পাতা (ট্রানজেকশন রেকর্ডস, বেটিং রেকর্ডস,
 * টার্নওভার) আর প্রোফাইল — সবাই এখান থেকেই ডাকে, তাই এন্ডপয়েন্টের নাম
 * এক জায়গাতেই লেখা থাকে।
 */

const qs = (params = {}) => {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.append(key, String(value));
  });

  const text = search.toString();
  return text ? `?${text}` : "";
};

/** ম্যানুয়াল ডিপোজিটের আবেদন */
export const fetchDepositHistory = async ({ status, limit = 30 } = {}) => {
  const { data } = await api.get(`/api/deposit-requests/my${qs({ status, limit })}`);
  return data?.data?.requests || [];
};

/** অটো ডিপোজিট (OraclePay) */
export const fetchAutoDepositHistory = async ({ limit = 30 } = {}) => {
  const { data } = await api.get(`/api/auto-deposit/history/my${qs({ limit })}`);
  return data?.data?.deposits || [];
};

/** উইথড্রের আবেদন */
export const fetchWithdrawHistory = async ({ status, limit = 30 } = {}) => {
  const { data } = await api.get(`/api/withdraw-requests/my${qs({ status, limit })}`);
  return data?.data?.requests || [];
};

/** খেলার (বেটিং) ইতিহাস */
export const fetchGameHistory = async ({ limit = 30 } = {}) => {
  const { data } = await api.get(`/api/game-history/my${qs({ limit })}`);
  return data?.data?.rows || [];
};

/** টার্নওভার — চলমান ও সম্পন্ন */
export const fetchTurnoverHistory = async ({ status, limit = 30 } = {}) => {
  const { data } = await api.get(`/api/turnover/my${qs({ status, limit })}`);
  return data?.data?.turnovers || [];
};

/**
 * প্রোভাইডারের নাম ও আইকন — কোড থেকে।
 *
 * টার্নওভারে শুধু প্রোভাইডার কোড সেভ থাকে, তাই দেখানোর সময় এই তালিকা
 * মিলিয়ে নেওয়া হয়। কী না বসানো থাকলে খালি তালিকা আসে, পাতা তবু চলে।
 */
export const fetchProviderCatalog = async () => {
  try {
    const { data } = await api.get("/api/admin/game-api-key/client/providers");
    return data?.data?.providers || [];
  } catch {
    return [];
  }
};
