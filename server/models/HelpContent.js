import mongoose from "mongoose";

/**
 * হেল্প সাইটের কনটেন্ট — সবসময় একটাই ডকুমেন্ট।
 *
 * UI লেখা (bn/en), টপিক (FAQ), ফুটার লিংক ও দুটো ছবি (হেডার লোগো,
 * ফুটার bg)। কোনো ফিল্ড/অ্যারে খালি থাকলে ক্লায়েন্ট data.js এর
 * স্ট্যাটিক মান দেখায়। রঙ আলাদাভাবে section-theme (help:site) থেকে।
 */
const lang = () => ({
  en: { type: String, default: "", trim: true },
  bn: { type: String, default: "", trim: true },
});

const faqSchema = new mongoose.Schema({ q: lang(), a: lang() }, { _id: false });

const topicSchema = new mongoose.Schema(
  {
    key: { type: String, default: "", trim: true },
    icon: { type: String, default: "", trim: true },
    name: lang(),
    faqs: { type: [faqSchema], default: [] },
  },
  { _id: false },
);

const linkSchema = new mongoose.Schema(
  {
    en: { type: String, default: "", trim: true },
    bn: { type: String, default: "", trim: true },
    to: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const helpContentSchema = new mongoose.Schema(
  {
    identity: {
      logo: { type: String, default: "", trim: true },
      footerBg: { type: String, default: "", trim: true },
    },
    ui: {
      brand: lang(),
      heroTitle: lang(),
      heroText: lang(),
      helpLead: lang(),
      helpWord: lang(),
      helpTail: lang(),
      searchPlaceholder: lang(),
      quickLinks: lang(),
      information: lang(),
      footerAbout: lang(),
      topicsHeading: lang(),
      copyright: lang(),
    },
    topics: { type: [topicSchema], default: [] },
    footerQuick: { type: [linkSchema], default: [] },
    footerInfo: { type: [linkSchema], default: [] },

    /* শর্তাবলী ও প্রাইভেসি — body = প্রতি ভাষায় প্যারার তালিকা */
    legal: {
      terms: {
        title: lang(),
        body: { en: { type: [String], default: [] }, bn: { type: [String], default: [] } },
      },
      privacy: {
        title: lang(),
        body: { en: { type: [String], default: [] }, bn: { type: [String], default: [] } },
      },
    },
  },
  { timestamps: true },
);

helpContentSchema.statics.current = async function current() {
  return (await this.findOne().sort({ createdAt: 1 })) || this.create({});
};

const HelpContent =
  mongoose.models.HelpContent || mongoose.model("HelpContent", helpContentSchema);

export default HelpContent;
