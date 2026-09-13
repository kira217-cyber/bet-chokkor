import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { useComingSoon } from "../../Context/comingSoonContext";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectFeaturedGames } from "../../features/globalGame/globalGameSelectors";

const FeaturedGames = () => {
  const { t } = useLanguage();
  const { openComingSoon } = useComingSoon();
  const games = useSelector(selectFeaturedGames);

  return (
    <LabeledCarousel
      title={t("featuredGames")}
      items={games}
      aspect="114.27 / 152"
      slidesPerView={[3, 7.65]}
      renderItem={(item) => (
        // গেম খেলা এখনো চালু হয়নি — ক্লিকে "শীঘ্রই আসছে" মডাল
        <button
          type="button"
          onClick={() => openComingSoon(item)}
          className="block h-full w-full cursor-pointer text-start"
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
            style={{ borderRadius: "var(--radius-10)" }}
            draggable="false"
          />
        </button>
      )}
    />
  );
};

export default FeaturedGames;
