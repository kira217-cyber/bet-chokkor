import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import Navber from "../components/Navber/Navber";
import Footer from "../components/Footer/Footer";
import SiteLoader from "../components/SiteLoader/SiteLoader";

import { fetchAffiliateData } from "../features/global/globalSlice";
import { selectGlobalLoaded } from "../features/global/globalSelectors";

// ক্লায়েন্ট সাইটের মতোই — লোডার অন্তত এতক্ষণ দেখানো হয়
const MIN_LOADER_MS = 2000;

// পেজ লোডে একবারই
let minLoaderDone = false;

const RootLayout = () => {
  const [minTimePassed, setMinTimePassed] = useState(minLoaderDone);

  const dispatch = useDispatch();
  const loaded = useSelector(selectGlobalLoaded);
  const { pathname } = useLocation();

  useEffect(() => {
    if (minLoaderDone) return undefined;

    const timer = setTimeout(() => {
      minLoaderDone = true;
      setMinTimePassed(true);
    }, MIN_LOADER_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) {
      dispatch(fetchAffiliateData());
    }
  }, [dispatch, loaded]);

  // রুট বদলালে উপরে ফিরে যাওয়া
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (!loaded || !minTimePassed) {
    return <SiteLoader />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--neutral1000)]">
      <Navber />

      <main className="flex-1 pt-[var(--header-height)] lg:pt-[var(--desktop-header-height)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout;
