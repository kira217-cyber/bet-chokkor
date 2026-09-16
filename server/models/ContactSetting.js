import mongoose from "mongoose";

/**
 * সাইডবারের "যোগাযোগ করুন" — কোন কোন মাধ্যম দেখাবে আর কোথায় নিয়ে যাবে।
 *
 * তিনটে চ্যানেলই আগে থেকে বসানো থাকে, কিন্তু লিংক না দেওয়া পর্যন্ত
 * বন্ধ — নইলে চালু করার দিনই খালি লিংকে ক্লিক পড়ত।
 *
 * নতুন মাধ্যম যোগ করতে হলে `CHANNEL_KEYS` এ একটা কী বাড়ালেই চলে;
 * অ্যাডমিন পাতাও তালিকা ধরেই চলে, আলাদা করে কিছু লিখতে হয় না।
 *
 * একটাই ডকুমেন্ট থাকে।
 */
export const CHANNEL_KEYS = ["email", "telegram", "whatsapp"];

const channelSchema = new mongoose.Schema(
  {
    key: { type: String, enum: CHANNEL_KEYS, required: true },
    url: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: false },
    sort: { type: Number, default: 0 },
  },
  { _id: false },
);

const contactSettingSchema = new mongoose.Schema(
  {
    channels: { type: [channelSchema], default: [] },
  },
  { timestamps: true },
);

/** সব সময় একটাই ডকুমেন্ট, আর তিনটে চ্যানেলই থাকে */
contactSettingSchema.statics.current = async function current() {
  const existing = (await this.findOne().sort({ createdAt: 1 })) || (await this.create({}));

  // পরে নতুন কী যোগ হলে পুরোনো ডকুমেন্টেও সেটা বসে যায়
  const have = new Set(existing.channels.map((item) => item.key));
  const missing = CHANNEL_KEYS.filter((key) => !have.has(key));

  if (missing.length) {
    missing.forEach((key) =>
      existing.channels.push({
        key,
        url: "",
        isActive: false,
        sort: CHANNEL_KEYS.indexOf(key),
      }),
    );

    await existing.save();
  }

  return existing;
};

const ContactSetting =
  mongoose.models.ContactSetting ||
  mongoose.model("ContactSetting", contactSettingSchema);

export default ContactSetting;
