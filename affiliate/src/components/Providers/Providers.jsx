import React from "react";
import { useSelector } from "react-redux";

import Section from "../Section/Section";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectProviders } from "../../features/global/globalSelectors";

/** প্রোভাইডার লোগোর গ্রিড — ক্লায়েন্ট সাইটের আসল ভেন্ডর লোগো */
const Providers = () => {
  const { t } = useLanguage();
  const providers = useSelector(selectProviders);

  return (
    <Section
      title={t("providersTitle")}
      text={t("providersText")}
      className="bg-[var(--neutral900)]"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {providers.map((item) => (
          <div
            key={item.key}
            className="flex h-[84px] items-center justify-center rounded-[14px] bg-[var(--neutral800)] px-4"
          >
            <img
              src={item.icon}
              alt={item.name}
              className="max-h-10 w-auto max-w-[70%] object-contain"
              loading="lazy"
              draggable="false"
            />
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Providers;
