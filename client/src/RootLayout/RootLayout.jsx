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

import { fetchGlobalClientData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

import { fetchGlobalGameData } from "../features/globalGame/globalGameSlice";
import { selectGlobalGameLoaded } from "../features/globalGame/globalGameSelectors";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);
  const gameLoaded = useSelector(selectGlobalGameLoaded);

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

  // ডেটা এলেই সাথে সাথে সাইট — কোনো কৃত্রিম দেরি নেই
  if (!loaded || !gameLoaded) {
    return <SiteLoader />;
  }

  return (
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
  );
};

export default RootLayout;
