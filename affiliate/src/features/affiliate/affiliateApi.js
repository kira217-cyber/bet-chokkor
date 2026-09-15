import { api } from "../../api/axios";

/**
 * অ্যাফিলিয়েটের নিজের হিসাব।
 *
 * উইথড্র আর নম্বরের রুটগুলো খেলোয়াড়দের সাথেই ভাগাভাগি — সার্ভারে
 * ওগুলো ভূমিকা দেখে না, টোকেন দেখে। তাই এখানে আলাদা কিছু লাগে না।
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

export const fetchAffiliate = async () => {
  const { data } = await api.get("/api/affiliate/me");
  return data?.data || null;
};

export const fetchCommissionStatus = async () => {
  const { data } = await api.get("/api/affiliate/commission-status");
  return data?.data || null;
};

export const fetchMyUsers = async ({ page = 1, limit = 20, q, status } = {}) => {
  const { data } = await api.get(`/api/affiliate/my-users${qs({ page, limit, q, status })}`);
  return data?.data || { rows: [], summary: {}, meta: {} };
};

export const fetchCommissionHistory = async ({ page = 1, limit = 20, type } = {}) => {
  const { data } = await api.get(
    `/api/affiliate/commission-history${qs({ page, limit, type })}`,
  );
  return data?.data || { rows: [], meta: {} };
};

/* ── উইথড্র — খেলোয়াড়ের সাথে একই রুট ── */

export const fetchWithdrawMethods = async () => {
  const { data } = await api.get("/api/withdraw-methods/public");
  return data?.data?.methods || [];
};

export const fetchWallets = async () => {
  const { data } = await api.get("/api/e-wallets");
  return data?.data || { wallets: [], manualCap: 0, manualCount: 0 };
};

export const addWallet = async (payload) => {
  const { data } = await api.post("/api/e-wallets", payload);
  return data?.data?.wallet || null;
};

export const fetchEligibility = async () => {
  const { data } = await api.get("/api/withdraw-requests/eligibility");
  return data?.data || { eligible: false };
};

export const submitWithdraw = async (payload) => {
  const { data } = await api.post("/api/withdraw-requests", payload);
  return data?.data?.request || null;
};

export const fetchMyWithdraws = async ({ page = 1, limit = 20, status } = {}) => {
  const { data } = await api.get(`/api/withdraw-requests/my${qs({ page, limit, status })}`);
  return data?.data || { requests: [], meta: {} };
};

export const fetchMe = async () => {
  const { data } = await api.get("/api/user/me");
  return data?.data?.user || null;
};
