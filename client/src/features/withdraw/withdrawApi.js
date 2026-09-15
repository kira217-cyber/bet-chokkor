import { api } from "../../api/axios";

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

export const removeWallet = async (id) => {
  const { data } = await api.delete(`/api/e-wallets/${id}`);
  return data;
};

/**
 * এখন টাকা তোলা যাবে কিনা।
 *
 * না গেলে কারণটাও আসে — আগের আবেদন ঝুলে আছে, নাকি টার্নওভার বাকি
 * (আর কত বাকি)। তাই ব্যবহারকারীকে শুধু "পারবেন না" না বলে কী করতে
 * হবে সেটাও বলা যায়।
 */
export const fetchEligibility = async () => {
  const { data } = await api.get("/api/withdraw-requests/eligibility");
  return data?.data || { eligible: false };
};

export const submitWithdraw = async (payload) => {
  const { data } = await api.post("/api/withdraw-requests", payload);
  return data?.data?.request || null;
};

export const fetchMyWithdraws = async (limit = 20) => {
  const { data } = await api.get(`/api/withdraw-requests/my?limit=${limit}`);
  return data?.data?.requests || [];
};
