import axios from "axios";

import OtpSetting from "../models/OtpSetting.js";

/**
 * OTP পাঠানো ও মেলানো।
 *
 * SMS যায় o-sms.com দিয়ে — সেটাই BetChokkor এর সার্ভিস। কোডটা
 * ডেটাবেসে না রেখে মেমরিতে রাখা হয়: ৫ মিনিট পরেই অকেজো, আর
 * ডেটাবেসে OTP জমলে সেটা ফাঁস হওয়ার একটা বাড়তি পথ তৈরি হতো।
 *
 * একাধিক সার্ভার ইনস্ট্যান্সে চালালে এটা ভাগ করা লাগবে (Redis) —
 * এক ইনস্ট্যান্সে কোনো সমস্যা নেই।
 */

const SEND_URL = "https://api.o-sms.com/api/service/send-otp";

const OTP_EXPIRE_MS = 5 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_TRIES = 5;

const store = new Map();

const keyOf = (flow, countryCode, phone) =>
  `${flow}:${String(countryCode || "").trim()}:${String(phone || "").trim()}`;

/** o-sms নম্বর চায় দেশের কোডসহ, কিন্তু + ছাড়া */
export const buildSmsPhone = (countryCode = "", phone = "") =>
  `${String(countryCode).replace(/\D/g, "")}${String(phone).replace(/\D/g, "")}`;

/**
 * এই ফ্লোতে OTP লাগবে কিনা।
 *
 * @param {"client"|"affiliate"} site
 * @param {"register"|"login"|"forgotPassword"|"withdraw"|"profileVerify"} flow
 */
export const isOtpRequired = async (site, flow) => {
  const setting = await OtpSetting.current();

  if (!setting.isActive || !setting.apiKey) return false;

  return Boolean(setting?.[site]?.[flow]);
};

/** OTP পাঠানো। ফেরত দেয় { ok, message } */
export const sendOtp = async ({ site, flow, countryCode, phone }) => {
  const setting = await OtpSetting.current();

  if (!setting.isActive || !setting.apiKey) {
    return { ok: false, message: "OTP service is not configured" };
  }

  const key = keyOf(flow, countryCode, phone);
  const existing = store.get(key);

  if (existing && Date.now() - existing.lastSentAt < RESEND_GAP_MS) {
    const wait = Math.ceil(
      (RESEND_GAP_MS - (Date.now() - existing.lastSentAt)) / 1000,
    );

    return { ok: false, message: `Please wait ${wait}s before asking again` };
  }

  try {
    const { data } = await axios.post(
      SEND_URL,
      { phoneNumber: buildSmsPhone(countryCode, phone) },
      {
        timeout: 20000,
        headers: {
          Authorization: `Bearer ${setting.apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!data?.success || !data?.otp) {
      return { ok: false, message: data?.message || "OTP send failed" };
    }

    store.set(key, {
      otp: String(data.otp).trim(),
      expiresAt: Date.now() + OTP_EXPIRE_MS,
      lastSentAt: Date.now(),
      tries: 0,
      verified: false,
    });

    return { ok: true, message: "OTP sent" };
  } catch (error) {
    return {
      ok: false,
      message:
        error?.response?.data?.message || error.message || "OTP send failed",
    };
  }
};

/** OTP মেলানো — মিললে ভেরিফাইড হিসেবে চিহ্নিত থাকে */
export const verifyOtp = ({ flow, countryCode, phone, otp }) => {
  const key = keyOf(flow, countryCode, phone);
  const entry = store.get(key);

  if (!entry) return { ok: false, message: "Please ask for an OTP first" };

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return { ok: false, message: "OTP has expired" };
  }

  entry.tries += 1;

  // বারবার আন্দাজ করা ঠেকাতে
  if (entry.tries > MAX_TRIES) {
    store.delete(key);
    return { ok: false, message: "Too many wrong tries, ask for a new OTP" };
  }

  if (String(otp || "").trim() !== entry.otp) {
    return { ok: false, message: "OTP did not match" };
  }

  entry.verified = true;
  return { ok: true, message: "OTP verified" };
};

/** আগে ভেরিফাই হয়েছে কিনা — রেজিস্টার/উইথড্র শেষ ধাপে দেখা হয় */
export const isVerified = ({ flow, countryCode, phone }) => {
  const entry = store.get(keyOf(flow, countryCode, phone));

  return Boolean(entry && entry.verified && Date.now() <= entry.expiresAt);
};

/** কাজ শেষ হলে মুছে ফেলা, যাতে একই OTP দুবার কাজে না লাগে */
export const clearOtp = ({ flow, countryCode, phone }) => {
  store.delete(keyOf(flow, countryCode, phone));
};
