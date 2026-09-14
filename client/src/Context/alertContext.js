import { createContext, useContext } from "react";

/**
 * সাইটের সব বার্তা মডালে দেখায় — টোস্টে নয়, মূল সাইটের মতোই।
 *
 *   const { showAlert, showConfirm } = useAlert();
 *   showAlert({ type: "success", title: "...", message: "..." });
 *   const ok = await showConfirm({ title: "...", message: "..." });
 */
export const AlertContext = createContext({
  showAlert: () => {},
  showConfirm: async () => false,
});

export const useAlert = () => useContext(AlertContext);
