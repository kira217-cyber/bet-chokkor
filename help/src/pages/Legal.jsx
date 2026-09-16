import React from "react";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

import { useLang } from "../LangContext.jsx";
import { UI } from "../data.js";

/**
 * শর্তাবলী ও প্রাইভেসি — সাধারণ লেখার পাতা।
 *
 * দুটোই একই খোলসে, `kind` দিয়ে কোনটা তা ঠিক হয়। লেখা এক জায়গায়
 * রাখা, পরে সম্পাদনা সহজ।
 */
const CONTENT = {
  terms: {
    title: { en: "Terms & Conditions", bn: "শর্তাবলী" },
    body: {
      en: [
        "By using BET CHOKKOR you confirm that you are at least 18 years old and legally allowed to gamble where you live.",
        "Each account belongs to one person. Creating multiple accounts, or sharing an account, may lead to suspension.",
        "Bonuses and promotions follow their own turnover and eligibility rules, shown at the time of the offer.",
        "Deposits and withdrawals are processed through the methods listed on the site. Identity verification may be required before a withdrawal.",
        "BET CHOKKOR reserves the right to update these terms; continued use means you accept the current version.",
      ],
      bn: [
        "বেট চক্কর ব্যবহার করে আপনি নিশ্চিত করছেন যে আপনার বয়স অন্তত ১৮ এবং আপনার এলাকায় বাজি ধরা আইনত অনুমোদিত।",
        "প্রতিটি অ্যাকাউন্ট একজনের। একাধিক অ্যাকাউন্ট খোলা বা অ্যাকাউন্ট ভাগাভাগি করলে সেটি বন্ধ হয়ে যেতে পারে।",
        "বোনাস ও প্রমোশন তাদের নিজস্ব টার্নওভার ও যোগ্যতার নিয়ম মেনে চলে, যা অফারের সময় দেখানো হয়।",
        "জমা ও উত্তোলন সাইটে দেওয়া মাধ্যমগুলো দিয়ে হয়। উত্তোলনের আগে পরিচয় যাচাই লাগতে পারে।",
        "বেট চক্কর যেকোনো সময় এই শর্ত হালনাগাদ করতে পারে; ব্যবহার চালিয়ে গেলে চলতি সংস্করণ মেনে নেওয়া হয়।",
      ],
    },
  },
  privacy: {
    title: { en: "Privacy Policy", bn: "প্রাইভেসি পলিসি" },
    body: {
      en: [
        "We collect only the information needed to run your account — such as your username, phone number and transaction records.",
        "Your data is used to process deposits and withdrawals, verify identity, and keep the platform secure.",
        "We do not sell your personal information. It is shared only with the providers required to deliver the service.",
        "You can request updates to your profile details through the account section or by contacting support.",
        "Reasonable technical measures protect your data, but no online service can promise absolute security.",
      ],
      bn: [
        "আপনার অ্যাকাউন্ট চালাতে যতটুকু দরকার ততটুকু তথ্যই আমরা রাখি — যেমন ইউজারনেম, ফোন নম্বর ও লেনদেনের রেকর্ড।",
        "এই তথ্য জমা-উত্তোলন প্রক্রিয়া, পরিচয় যাচাই আর প্ল্যাটফর্ম নিরাপদ রাখতে কাজে লাগে।",
        "আমরা আপনার ব্যক্তিগত তথ্য বিক্রি করি না। সেবা দিতে যেসব প্রোভাইডার লাগে কেবল তাদের সাথেই ভাগ করা হয়।",
        "অ্যাকাউন্ট অংশ থেকে বা সাপোর্টে যোগাযোগ করে আপনি নিজের তথ্য হালনাগাদের অনুরোধ করতে পারেন।",
        "যুক্তিসঙ্গত কারিগরি ব্যবস্থা আপনার তথ্য রক্ষা করে, তবে কোনো অনলাইন সেবাই শতভাগ নিরাপত্তার নিশ্চয়তা দিতে পারে না।",
      ],
    },
  },
};

const Legal = ({ kind }) => {
  const { t } = useLang();
  const data = CONTENT[kind] || CONTENT.terms;

  return (
    <div className="hv-container py-10">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[14px] text-[var(--gold)] hover:underline"
      >
        <ChevronLeft size={16} />
        {t(UI.breadcrumbHome)}
      </Link>

      <h1 className="mb-6 text-[26px] font-extrabold text-[var(--gold)]">
        {t(data.title)}
      </h1>

      <div className="flex flex-col gap-4">
        {t(data.body).map((para, index) => (
          <p
            key={index}
            className="rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 text-[14px] leading-relaxed text-[var(--text-soft)]"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  );
};

export default Legal;
