const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * সার্ভারে রাখা ছবির পুরো ঠিকানা।
 *
 * অ্যাডমিন লোগো আপলোড করলে ডেটাবেসে `/uploads/...` বসে; ক্লায়েন্ট আর
 * সার্ভার আলাদা পোর্টে চলে, তাই সামনে সার্ভারের ঠিকানা জুড়ে দিতে হয়।
 * বাইরের কোনো লিংক দিলে সেটা যেমন আছে তেমনই থাকে।
 */
export const imageUrl = (url) => {
  if (!url) return "";

  return url.startsWith("http") ? url : `${API_URL}${url}`;
};

export default imageUrl;
