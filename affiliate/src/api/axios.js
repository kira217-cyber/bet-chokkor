import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  // ফাইল পাঠানোর সময় ব্রাউজারকেই Content-Type বসাতে দিতে হয় —
  // multipart এর boundary ওখান থেকেই আসে, আমরা json বসিয়ে রাখলে
  // সার্ভার ফাইলটা খুঁজেই পায় না
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const token = localStorage.getItem("user_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// এই এন্ডপয়েন্টগুলোতে 401 এলে auto-logout করা হবে না (ভুল পাসওয়ার্ড/OTP এর কারণেও 401 আসতে পারে)
// path segment হিসেবে ম্যাচ করে, যাতে "/login-modal-settings" এর মতো নাম ভুলবশত ধরা না পড়ে
const AUTH_ENDPOINT_RE = /\/(login|register|forgot-password)(?:\/|$|\?)/i;
const isAuthEndpoint = (url = "") => AUTH_ENDPOINT_RE.test(url);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    if (status === 401 && !isAuthEndpoint(url)) {
      localStorage.removeItem("user_data");
      localStorage.removeItem("user_token");

      // client site এ invalid token হলে login/register পেজে নয়, হোম পেজে পাঠানো হয়
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

export default api;