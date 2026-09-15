/** ড্যাশবোর্ডে টাকা ও তারিখ দেখানোর ফরম্যাট */

export const money = (value) =>
  `৳ ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const when = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "—";

/**
 * শুধু তারিখ।
 *
 * `toLocaleDateString()` খালি হাতে ডাকলে ব্রাউজারের ভাষা ধরত — বাংলা
 * ব্রাউজারে ইংরেজি সাইটেও "১৫/৯/২০২৬" বসে যেত। তাই `when` এর মতোই
 * এখানেও লোকেল বেঁধে দেওয়া।
 */
export const day = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";
