import { api } from "../../api/axios";

/**
 * নিজের প্রোফাইল বদলানো।
 *
 * প্রতিটা ঘরের আলাদা রুট — সার্ভারে নিয়মগুলোও আলাদা (নাম ও জন্ম
 * তারিখ একবারই বসে, ফোনে OTP লাগে, পাসওয়ার্ডে পুরোনোটা লাগে)।
 *
 * সবগুলোই সফল হলে নতুন `user` ফেরত দেয়, তাই ডাকার পর সরাসরি
 * `updateUser` এ বসিয়ে দেওয়া যায় — আবার `/me` ডাকতে হয় না।
 */

export const saveFullName = async (fullName) => {
  const { data } = await api.put("/api/profile/full-name", { fullName });
  return data?.data?.user || null;
};

export const saveBirthday = async (dateOfBirth) => {
  const { data } = await api.put("/api/profile/birthday", { dateOfBirth });
  return data?.data?.user || null;
};

export const saveEmail = async (email) => {
  const { data } = await api.put("/api/profile/email", { email });
  return data?.data?.user || null;
};

export const sendPhoneOtp = async ({ countryCode, phone }) => {
  const { data } = await api.post("/api/profile/phone/send-otp", {
    countryCode,
    phone,
  });

  return data?.data || { required: false };
};

export const savePhone = async ({ countryCode, phone, otp }) => {
  const { data } = await api.put("/api/profile/phone", {
    countryCode,
    phone,
    otp,
  });

  return data?.data?.user || null;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const { data } = await api.put("/api/profile/password", {
    currentPassword,
    newPassword,
  });

  return data?.message || "";
};

/**
 * পাসওয়ার্ডের নিয়ম — সার্ভারের `passwordProblems` এর হুবহু জোড়া।
 *
 * দুই জায়গায় এক নিয়ম রাখা হয় বলেই টিক দেখে সাবমিট করার পর সার্ভার
 * "না" বলে না। আসল যাচাই সার্ভারেই — এখানকারটা শুধু দেখানোর জন্য।
 */
export const passwordChecks = (password) => {
  const value = String(password || "");

  return [
    { key: "length", ok: value.length >= 6 && value.length <= 20 },
    { key: "upper", ok: /[A-Z]/.test(value) },
    { key: "lower", ok: /[a-z]/.test(value) },
    { key: "digit", ok: /[0-9]/.test(value) },
    { key: "charset", ok: value.length > 0 && !/[^A-Za-z0-9!@#$%*]/.test(value) },
  ];
};
