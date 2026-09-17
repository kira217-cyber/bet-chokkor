import { api } from "../../api/axios";

/** সক্রিয় নোটিফিকেশনের তালিকা + না-পড়া সংখ্যা */
export const fetchNotifications = async () => {
  const { data } = await api.get("/api/notifications/");
  return data?.data || { notifications: [], unread: 0 };
};

/** শুধু না-পড়া সংখ্যা — ব্যাজের জন্য */
export const fetchUnreadCount = async () => {
  const { data } = await api.get("/api/notifications/unread-count");
  return Number(data?.data?.unread) || 0;
};

/** সব দেখা হয়েছে — গণনা ০ হয়ে যায় */
export const markNotificationsSeen = async () => {
  const { data } = await api.post("/api/notifications/seen");
  return data?.data || { unread: 0 };
};
