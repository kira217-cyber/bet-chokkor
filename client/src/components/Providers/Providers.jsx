import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectHomeProviders } from "../../features/globalGame/globalGameSelectors";

// মূল সাইটে কার্ডের aspect ২.০৮৭ আর প্যাডিং প্রস্থের ৭.১% — দুই ভিউপোর্টেই
// মাপ মিলে যায়, তাই ফিক্সড px এর বদলে অনুপাত ব্যবহার করা হয়েছে
const Providers = () => {
  const { t } = useLanguage();
  const providers = useSelector(selectHomeProviders);

  return (
    <LabeledCarousel
      title={t("provider")}
      items={providers}
      aspect="175.41 / 84.05"
      slidesPerView={[2, 6.86]}
      renderItem={(item) => (
        <Link
          to={`/games/slot?vendor=${item.key}`}
          className="flex h-full items-center justify-between bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]"
          style={{ padding: "7.1%", borderRadius: "var(--radius-10)" }}
        >
          <img
            src={item.icon}
            alt={item.name}
            className="h-full w-auto max-w-[55%] object-contain"
            draggable="false"
          />

          <span
            className="truncate ps-2 text-[var(--text-secondary)]"
            style={{ fontSize: "var(--fs-larger)" }}
          >
            {item.name}
          </span>
        </Link>
      )}
    />
  );
};

export default Providers;
