import { api } from "../../api/axios";

/**
 * ইতিহাসের সব ডাটা এক জায়গা থেকে।
 *
 * পাঁচটা ট্যাবই (ডিপোজিট, অটো ডিপোজিট, উইথড্র, বেট, টার্নওভার) এখান
 * থেকেই ডাকে, তাই এন্ডপয়েন্টের নাম এক জায়গাতেই লেখা থাকে।
 *
 * প্রতিটা ফাংশন একই আকারে ফেরত দেয় — `{ rows, meta }` — তাই পাতার
 * কোডে কোন ট্যাব কী নামে তালিকা পাঠায় সেটা নিয়ে ভাবতে হয় না।
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

const shape = (rows, meta, page, limit) => ({
  rows: Array.isArray(rows) ? rows : [],
  meta: {
    page: Number(meta?.page || page),
    limit: Number(meta?.limit || limit),
    total: Number(meta?.total || 0),
    totalPages: Number(meta?.totalPages || 1),
  },
});

/** ম্যানুয়াল ডিপোজিটের আবেদন */
export const fetchDepositHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/deposit-requests/my${qs({ status, page, limit })}`,
  );

  return shape(data?.data?.requests, data?.data?.meta, page, limit);
};

/** অটো ডিপোজিট (OraclePay) */
export const fetchAutoDepositHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/auto-deposit/history/my${qs({ status, page, limit })}`,
  );

  return shape(data?.data?.deposits, data?.data?.meta, page, limit);
};

/** উইথড্রের আবেদন */
export const fetchWithdrawHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/withdraw-requests/my${qs({ status, page, limit })}`,
  );

  return shape(data?.data?.requests, data?.data?.meta, page, limit);
};

/** অটো উইথড্র (OraclePay) */
export const fetchAutoWithdrawHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/auto-withdraw/history/my${qs({ status, page, limit })}`,
  );

  return shape(data?.data?.withdrawals, data?.data?.meta, page, limit);
};

/** খেলার (বেট) ইতিহাস */
export const fetchGameHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/game-history/my${qs({ resultType: status, page, limit })}`,
  );

  return shape(data?.data?.rows, data?.data?.meta, page, limit);
};

/** টার্নওভার — চলমান ও সম্পন্ন */
export const fetchTurnoverHistory = async ({ status, page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(
    `/api/turnover/my${qs({ status, page, limit })}`,
  );

  return shape(data?.data?.turnovers, data?.data?.meta, page, limit);
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
