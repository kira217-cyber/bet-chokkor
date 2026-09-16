import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { useOpenGame } from "../../features/game/useOpenGame";
import LabeledCarousel from "../LabeledCarousel/LabeledCarousel";
import { selectFeaturedGames } from "../../features/globalGame/globalGameSelectors";

const FeaturedGames = () => {
  const { t } = useLanguage();
  const openGame = useOpenGame();
  const games = useSelector(selectFeaturedGames);

  return (
    <LabeledCarousel
      title={t("featuredGames")}
      items={games}
      aspect="114.27 / 152"
      slidesPerView={[3, 7.65]}
      /* ইভেন্টের থেকে আলাদা সময় আর দেরিতে শুরু — দুটো একসাথে নড়ে না */
      autoplayDelay={5500}
      autoplayStartDelay={2000}
      renderItem={(item) => (
        <button
          type="button"
          onClick={() => openGame(item)}
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
