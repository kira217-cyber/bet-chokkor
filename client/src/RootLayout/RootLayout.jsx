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
import MaintenanceModal from "../components/MaintenanceModal/MaintenanceModal";

import { fetchGlobalClientData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

import { fetchGlobalGameData } from "../features/globalGame/globalGameSlice";
import { selectGlobalGameLoaded } from "../features/globalGame/globalGameSelectors";

import { fetchMaintenance } from "../features/maintenance/maintenanceSlice";
import {
  selectMaintenance,
  selectMaintenanceLoaded,
  selectMaintenanceOn,
} from "../features/maintenance/maintenanceSelectors";

const RootLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);
  const gameLoaded = useSelector(selectGlobalGameLoaded);

  const maintenance = useSelector(selectMaintenance);
  const maintenanceOn = useSelector(selectMaintenanceOn);
  const maintenanceLoaded = useSelector(selectMaintenanceLoaded);

  useEffect(() => {
    if (!maintenanceLoaded) {
      dispatch(fetchMaintenance());
    }
  }, [dispatch, maintenanceLoaded]);

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
  if (!loaded || !gameLoaded || !maintenanceLoaded) {
    return <SiteLoader />;
  }

  // রক্ষণাবেক্ষণ চললে কনটেন্ট নয়, শুধু বার্তা
  if (maintenanceOn) {
    return <MaintenanceModal setting={maintenance} />;
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
