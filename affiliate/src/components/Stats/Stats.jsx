import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectStats } from "../../features/global/globalSelectors";

/** হিরোর নিচে চারটি সংখ্যা — বাংলায় বাংলা অঙ্ক, ইংরেজিতে ইংরেজি */
const Stats = () => {
  const { t, isBangla } = useLanguage();
  const stats = useSelector(selectStats);

  return (
    <div className="border-b border-[var(--neutral800)] bg-[var(--neutral900)]">
      <div className="aff-container grid grid-cols-2 gap-6 py-8 lg:grid-cols-4 lg:py-10">
        {stats.map((item) => (
          <div key={item.key} className="text-center">
            <p className="text-[26px] font-extrabold leading-none text-[var(--primary500)] lg:text-[34px]">
              {isBangla ? item.value : item.valueEn}
            </p>

            <p className="mt-2 text-[13px] leading-snug text-[var(--text-muted)] lg:text-[14px]">
              {t(item.labelKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
