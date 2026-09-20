import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectStats, selectAffiliateHome } from "../../features/global/globalSelectors";

/** হিরোর নিচে চারটি সংখ্যা — বাংলায় বাংলা অঙ্ক, ইংরেজিতে ইংরেজি */
const Stats = () => {
  const { t, tv, isBangla } = useLanguage();
  const stats = useSelector(selectStats);
  const home = useSelector(selectAffiliateHome);

  // admin content থাকলে সেটা, নইলে স্ট্যাটিক
  const list = home?.stats?.length
    ? home.stats.map((s, i) => ({ key: i, value: tv(s.value), label: tv(s.label) }))
    : stats.map((s) => ({ key: s.key, value: isBangla ? s.value : s.valueEn, label: t(s.labelKey) }));

  return (
    <div className="border-b border-[var(--neutral800)] bg-[var(--neutral900)]">
      <div className="aff-container grid grid-cols-2 gap-6 py-8 lg:grid-cols-4 lg:py-10">
        {list.map((item) => (
          <div key={item.key} className="text-center">
            <p className="text-[26px] font-extrabold leading-none text-[var(--primary500)] lg:text-[34px]">
              {item.value}
            </p>

            <p className="mt-2 text-[13px] leading-snug text-[var(--text-muted)] lg:text-[14px]">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
