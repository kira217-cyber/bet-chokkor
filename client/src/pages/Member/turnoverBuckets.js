/**
 * টার্নওভারকে প্রোভাইডার অনুযায়ী ভাগ করার হিসাব।
 *
 * সার্ভারের হিসাবের (utils/turnoverProgress.js) হুবহু প্রতিচ্ছবি —
 * নইলে পাতায় দেখা অগ্রগতি আর আসল অগ্রগতি মিলত না।
 */

const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/**
 * একটা টার্নওভারকে প্রোভাইডার অনুযায়ী ভাগ করে দেখায়।
 *
 * প্রতিটা eligible প্রোভাইডারের শতাংশ হলো তার নিজের বাধ্যতামূলক অংশ।
 * সব শতাংশ যোগ করে ১০০ না হলে বাকিটুকু "খোলা" — যেকোনো প্রোভাইডারে
 * খেললেই ভরে। সার্ভারের হিসাব (utils/turnoverProgress.js) এর হুবহু
 * প্রতিচ্ছবি, নইলে পাতায় দেখা অগ্রগতি আর আসল অগ্রগতি মিলত না।
 */
export const buildBuckets = (row, providers, openLabel) => {
  const eligible = Array.isArray(row?.eligibleProviders)
    ? row.eligibleProviders
    : [];

  if (!eligible.length) return [];

  const required = Number(row?.required || 0);
  const progressList = Array.isArray(row?.providerProgress)
    ? row.providerProgress
    : [];

  const nameOf = (code) =>
    providers.find((item) => String(item.providerCode).toUpperCase() === code)
      ?.providerName || code;

  const buckets = eligible.map((item) => {
    const code = String(item?.providerCode || "").toUpperCase();
    const percent = Number(item?.percent ?? 100);

    const entry = progressList.find(
      (p) => String(p?.providerCode || "").toUpperCase() === code,
    );

    const quota = round2((required * percent) / 100);

    return {
      key: code,
      name: nameOf(code),
      quota,
      done: round2(Math.min(quota, Number(entry?.progress || 0))),
    };
  });

  const usedPercent = Math.min(
    100,
    eligible.reduce((sum, item) => sum + Number(item?.percent ?? 100), 0),
  );
  const openPercent = Math.max(0, 100 - usedPercent);

  if (openPercent > 0) {
    const dedicated = progressList.reduce(
      (sum, entry) => sum + Number(entry?.progress || 0),
      0,
    );
    const openQuota = round2((required * openPercent) / 100);
    const openDone = round2(Math.max(0, Number(row?.progress || 0) - dedicated));

    buckets.push({
      key: "__open__",
      name: openLabel,
      quota: openQuota,
      done: round2(Math.min(openQuota, openDone)),
    });
  }

  return buckets;
};
