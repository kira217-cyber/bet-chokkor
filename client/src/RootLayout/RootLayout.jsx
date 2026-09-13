import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navber from "../components/Navber/Navber";
import Sidebar from "../components/Sidebar/Sidebar";
import BottomNavbar from "../components/BottomNavbar/BottomNavbar";
import Footer from "../components/Footer/Footer";
import FloatWidget from "../components/FloatWidget/FloatWidget";
import SiteIdentity from "../components/SiteIdentity/SiteIdentity";
import SiteLoader from "../components/SiteLoader/SiteLoader";
import ComingSoonProvider from "../Context/ComingSoonProvider";

import { fetchGlobalClientData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

import { fetchGlobalGameData } from "../features/globalGame/globalGameSlice";
import { selectGlobalGameLoaded } from "../features/globalGame/globalGameSelectors";

// ডেটা তাৎক্ষণিক এলেও লোডারটা অন্তত এতক্ষণ দেখানো হয়, নাহলে এক ঝলকে
// মিলিয়ে যায় আর সাইট লোড হওয়াটা বোঝা যায় না
const MIN_LOADER_MS = 2000;

// পেজ লোডে একবারই — লগইন/রেজিস্টার থেকে হোমে ফিরলে RootLayout আবার
// mount হয়, তখন যেন নতুন করে লোডার না দেখায়
let minLoaderDone = false;

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);
  const [minTimePassed, setMinTimePassed] = useState(minLoaderDone);

  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);
  const gameLoaded = useSelector(selectGlobalGameLoaded);

  useEffect(() => {
    if (minLoaderDone) return undefined;

    const timer = setTimeout(() => {
      minLoaderDone = true;
      setMinTimePassed(true);
    }, MIN_LOADER_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!gameLoaded) {
      dispatch(fetchGlobalGameData());
    }
  }, [dispatch, gameLoaded]);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchGlobalClientData());
    }
  }, [dispatch, loaded]);

  if (!loaded || !gameLoaded || !minTimePassed) {
    return <SiteLoader />;
  }

  return (
    <ComingSoonProvider>
      <div className="min-h-screen bg-[var(--content-bg)]">
        <SiteIdentity />

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          desktopOpen={desktopSidebarOpen}
        />

        <Navber setDesktopOpen={setDesktopSidebarOpen} />

        <main
          className={`min-h-screen pt-[var(--header-height)] transition-[padding] duration-300 ease-in-out lg:pt-[var(--desktop-header-height)] ${
            desktopSidebarOpen
              ? "lg:ps-[var(--side-nav-width-open)]"
              : "lg:ps-[var(--side-nav-width)]"
          }`}
        >
          <Outlet />

          <Footer />

          {/* bottom bar এর নিচে কনটেন্ট যেন না ঢাকা পড়ে */}
          <div
            className="lg:hidden"
            style={{ height: "var(--bottom-bar-height)" }}
          />
        </main>

        <FloatWidget />

        <BottomNavbar setSidebarOpen={setSidebarOpen} />
      </div>
    </ComingSoonProvider>
  );
};

export default RootLayout;
