import React from "react";

import Slider from "../../components/Slider/Slider";
import Notice from "../../components/Notice/Notice";
import Categories from "../../components/Categories/Categories";
import Providers from "../../components/Providers/Providers";
import MatchOdds from "../../components/MatchOdds/MatchOdds";
import EventSlider from "../../components/EventSlider/EventSlider";
import FeaturedGames from "../../components/FeaturedGames/FeaturedGames";

/**
 * মূল সাইটের main-page গঠন: ব্যানার পুরো প্রস্থ জুড়ে (head), বাকি সব
 * ১২০০px কলামে (body)।
 */
const Home = () => {
  return (
    <div style={{ paddingBottom: "calc(var(--u) * 4.267)" }}>
      <Slider />

      <div className="bc-page">
        <Notice />
        <Categories />
        <Providers />
        <MatchOdds />
        <EventSlider />
        <FeaturedGames />
      </div>
    </div>
  );
};

export default Home;
