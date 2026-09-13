import { createContext, useContext } from "react";

/**
 * ডান পাশে ডক করা প্যানেল (যেমন গেম পেজের ফিল্টার) কত চওড়া।
 *
 * ০ মানে কোনো প্যানেল খোলা নেই। খোলা থাকলে RootLayout কনটেন্ট এলাকাটা
 * ততটা সরু করে নিজের স্ক্রল কন্টেইনার বানায় — তাতে স্ক্রলবারটা
 * প্যানেলের বাঁয়ে পড়ে, মূল সাইটে যেমন।
 */
export const PanelContext = createContext({
  panelWidth: 0,
  setPanelWidth: () => {},
});

export const usePanel = () => useContext(PanelContext);
