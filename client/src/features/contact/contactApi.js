import { api } from "../../api/axios";

/**
 * সাইডবারের যোগাযোগের মাধ্যম।
 *
 * অ্যাডমিন যেগুলো চালু রেখেছেন আর লিংক দিয়েছেন শুধু সেগুলোই আসে —
 * তাই ক্লায়েন্টে আলাদা করে বাছতে হয় না।
 */
export const fetchContacts = async () => {
  const { data } = await api.get("/api/contact/public");
  return data?.data?.channels || [];
};
