import React from "react";
import { Link } from "react-router";
import { ChevronLeft } from "lucide-react";

import { useLang } from "../LangContext.jsx";
import { useHelp } from "../HelpData.jsx";
import { UI } from "../data.js";

/**
 * শর্তাবলী ও প্রাইভেসি — সাধারণ লেখার পাতা।
 *
 * দুটোই একই খোলসে, `kind` দিয়ে কোনটা তা ঠিক হয়। লেখা অ্যাডমিন থেকে
 * (useHelp().LEGAL); অ্যাডমিন সেট না করলে data.js এর স্ট্যাটিক।
 */
const Legal = ({ kind }) => {
  const { t } = useLang();
  const { LEGAL } = useHelp();
  const data = LEGAL[kind] || LEGAL.terms;

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
