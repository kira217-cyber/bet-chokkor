import React, { useMemo } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import {
  selectHomeProviders,
  selectGameCategories,
} from "../../features/globalGame/globalGameSelectors";

// মূল সাইটে কার্ডের aspect ২.০৮৭ আর প্যাডিং প্রস্থের ৭.১% — দুই ভিউপোর্টেই
// মাপ মিলে যায়, তাই ফিক্সড px এর বদলে অনুপাত ব্যবহার করা হয়েছে
const Providers = () => {
  const { t } = useLanguage();
  const providers = useSelector(selectHomeProviders);
  const categories = useSelector(selectGameCategories);

  /*
   * প্রতিটা হোম প্রোভাইডার কোন ক্যাটাগরির — সেটা ক্যাটাগরির ভেন্ডর
   * তালিকা মিলিয়ে বের করা হয়। তাই casino প্রোভাইডারে ক্লিকে
   * /games/casino, slot প্রোভাইডারে /games/slot — আর ওখানে প্রোভাইডার
   * নিজে থেকেই বাছাই হয়ে থাকে (Games পাতা ?vendor= পড়ে)।
   *
   * একই প্রোভাইডার একাধিক ক্যাটাগরিতে থাকলে প্রথমটাই নেওয়া হয়; sports
   * বাদ (ওখানে আলাদা করে বাছাই নেই)।
   */
  const categoryOf = useMemo(() => {
    const map = {};

    categories.forEach((category) => {
      if (category.key === "sports") return;

      (category.vendors || []).forEach((vendor) => {
        if (!map[vendor.key]) map[vendor.key] = category.key;
      });
    });

    return map;
  }, [categories]);

  return (
    <LabeledCarousel
      title={t("provider")}
      items={providers}
      aspect="175.41 / 84.05"
      slidesPerView={[2, 6.86]}
      renderItem={(item) => {
        const categoryKey = categoryOf[item.key] || "slot";

        return (
          <Link
            to={`/games/${categoryKey}?vendor=${item.key}`}
            className="flex h-full items-center justify-between bg-[var(--home-card-bg)] transition-colors hover:bg-[var(--home-card-hover)]"
            style={{ padding: "7.1%", borderRadius: "var(--radius-10)" }}
          >
            <img
              src={item.icon}
              alt={item.name}
              className="h-full w-auto max-w-[55%] object-contain"
              draggable="false"
            />

            <span
              className="truncate ps-2 text-[var(--home-card-text)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {item.name}
            </span>
          </Link>
        );
      }}
    />
  );
};

export default Providers;
