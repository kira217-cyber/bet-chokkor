import { createSlice } from "@reduxjs/toolkit";

/**
 * না-পড়া নোটিফিকেশনের সংখ্যা — হেডারের লাল ব্যাজের জন্য।
 *
 * অ্যাপ চালু বা লগইন হলে একবার আনা হয়; নোটিফিকেশন পাতা খুললে ০ করে
 * দেওয়া হয়, তাই ব্যাজ সাথে সাথেই মিলিয়ে যায়।
 */
const notificationSlice = createSlice({
  name: "notification",
  initialState: { unread: 0 },
  reducers: {
    setUnread: (state, action) => {
      state.unread = Math.max(0, Number(action.payload) || 0);
    },
    clearUnread: (state) => {
      state.unread = 0;
    },
  },
});

export const { setUnread, clearUnread } = notificationSlice.actions;

export const selectUnread = (state) => state.notification.unread;

export default notificationSlice.reducer;
