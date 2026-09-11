import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectEvents } from "../../features/globalGame/globalGameSelectors";

const EventSlider = () => {
  const { t } = useLanguage();
  const events = useSelector(selectEvents);

  return (
    <LabeledCarousel
      title={t("event")}
      items={events}
      aspect="358.81 / 172.02"
      slidesPerView={[1, 3.15]}
      renderItem={(item) => (
        <Link to="/promotion" className="block h-full">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            style={{ borderRadius: "var(--radius-10)" }}
            draggable="false"
          />
        </Link>
      )}
    />
  );
};

export default EventSlider;
