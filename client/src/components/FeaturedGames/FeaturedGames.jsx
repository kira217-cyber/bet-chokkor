import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectFeaturedGames } from "../../features/globalGame/globalGameSelectors";

const FeaturedGames = () => {
  const { t } = useLanguage();
  const games = useSelector(selectFeaturedGames);

  return (
    <LabeledCarousel
      title={t("featuredGames")}
      items={games}
      aspect="114.27 / 152"
      slidesPerView={[3, 7.65]}
      renderItem={(item) => (
        <Link to={`/play-game/${item.key}`} className="block h-full">
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

export default FeaturedGames;
