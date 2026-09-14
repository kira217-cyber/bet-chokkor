import { api } from "../../api/axios";

/**
 * সার্ভারের ভুলটা ব্যবহারকারীর ভাষায় বের করা।
 *
 * সার্ভার একটা `code` পাঠায় (যেমন `badLogin`), সেটা locale এর
 * `errBadLogin` কী হয়ে যায় — তাই সাইট বাংলায় থাকলে বার্তাটাও বাংলায়
 * আসে। কোড না চিনলে সার্ভারের নিজের লেখাটাই দেখানো হয়, আর সার্ভারই
 * চুপ থাকলে (নেটওয়ার্ক ভাঙা) ডাকা জায়গার দেওয়া লেখাটা।
 */
export const authError = (error, fallback, t) => {
  const data = error?.response?.data;
  const code = data?.code;

  if (code && t) {
    const key = `err${code.charAt(0).toUpperCase()}${code.slice(1)}`;
    const text = t(key);

    // অচেনা কী হলে t() কী-টাই ফেরত দেয়, তখন সার্ভারের লেখায় নামা হয়
    if (text && text !== key) return text;
  }

  return data?.message || fallback;
};

/** OTP চাওয়া — এই ফ্লোতে OTP বন্ধ থাকলে `required: false` আসে */
export const sendOtp = async (payload) => {
  const { data } = await api.post("/api/user/otp/send", payload);
  return data?.data || {};
};

export const verifyOtp = async (payload) => {
  const { data } = await api.post("/api/user/otp/verify", payload);
  return data?.data || {};
};

export const registerUser = async (payload) => {
  const { data } = await api.post("/api/user/register", payload);
  return data?.data || {};
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/api/user/login", payload);
  return data?.data || {};
};

export const resetPassword = async (payload) => {
  const { data } = await api.post("/api/user/forgot-password", payload);
  return data || {};
};

/** চালু রেজিস্টার বোনাস — না থাকলে `null`, রেজিস্টার তবু চলে */
export const fetchRegisterBonus = async () => {
  try {
    const { data } = await api.get("/api/register-bonus/active");
    return data?.data?.campaign || null;
  } catch {
    return null;
  }
};
