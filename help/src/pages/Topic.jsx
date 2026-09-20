import React, { useState } from "react";
import { Link, useParams } from "react-router";
import { ChevronDown, ChevronLeft } from "lucide-react";

import { useLang } from "../LangContext.jsx";
import { useHelp } from "../HelpData.jsx";

/**
 * একটা টপিকের প্রশ্ন-উত্তর — অ্যাকর্ডিয়ন।
 *
 * প্রশ্নে চাপলে উত্তর খোলে। একসাথে একাধিক খোলা রাখা যায়, কারণ পাশাপাশি
 * উত্তর মিলিয়ে দেখা সুবিধাজনক।
 */
const Topic = () => {
  const { t } = useLang();
  const { UI, TOPICS } = useHelp();
  const { key } = useParams();
  const [open, setOpen] = useState({});

  const topic = TOPICS.find((item) => item.key === key);

  if (!topic) {
    return (
      <div className="hv-container py-20 text-center">
        <p className="text-[16px] text-[var(--text-mute)]">
          {t(UI.noResult)}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-[var(--gold)] hover:underline"
        >
          {t(UI.backToTopics)}
        </Link>
      </div>
    );
  }

  return (
    <div className="hv-container py-10">
      {/* ব্রেডক্রাম্ব */}
      <div className="mb-6 flex items-center gap-2 text-[14px] text-[var(--text-mute)]">
        <Link to="/" className="hover:text-white">
          {t(UI.breadcrumbHome)}
        </Link>
        <span>/</span>
        <span className="text-white">{t(topic.name)}</span>
      </div>

      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-[14px] text-[var(--gold)] hover:underline"
      >
        <ChevronLeft size={16} />
        {t(UI.backToTopics)}
      </Link>

      <h1 className="mb-6 text-[26px] font-extrabold text-white">
        {t(topic.name)}
      </h1>

      <div className="flex flex-col gap-3">
        {topic.faqs.map((faq, index) => {
          const isOpen = Boolean(open[index]);

          return (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)]"
            >
              <button
                type="button"
                onClick={() =>
                  setOpen((prev) => ({ ...prev, [index]: !prev[index] }))
                }
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-semibold text-white">
                  {t(faq.q)}
                </span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-[var(--gold)] transition-transform duration-300 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-[var(--text-soft)]">
                    {t(faq.a)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Topic;
