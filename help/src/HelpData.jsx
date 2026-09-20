import React, { createContext, useContext, useEffect, useState } from "react";

import {
  UI as STATIC_UI,
  TOPICS as STATIC_TOPICS,
  FOOTER_QUICK as STATIC_FQ,
  FOOTER_INFO as STATIC_FI,
  LEGAL as STATIC_LEGAL,
} from "./data.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const img = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

/**
 * হেল্প সাইটের কনটেন্ট ও রঙ অ্যাডমিন থেকে আনে; না পেলে data.js এর
 * স্ট্যাটিকই থাকে। রঙ :root এ বসিয়ে দেয়। কম্পোনেন্ট useHelp() দিয়ে পড়ে।
 */
const HelpContext = createContext(null);

const hasLang = (o) => o && (o.en || o.bn);

/** সার্ভার UI মান থাকলে সেটা, নইলে স্ট্যাটিক */
/* legal পেজে কনটেন্ট আছে কিনা */
const hasLegalPage = (p) =>
  p && (p.title?.en || p.title?.bn || p.body?.en?.length || p.body?.bn?.length);
const mergeLegal = (serverLegal = {}) => ({
  terms: hasLegalPage(serverLegal.terms) ? serverLegal.terms : STATIC_LEGAL.terms,
  privacy: hasLegalPage(serverLegal.privacy) ? serverLegal.privacy : STATIC_LEGAL.privacy,
});

const mergeUi = (serverUi = {}) => {
  const out = { ...STATIC_UI };
  Object.entries(serverUi).forEach(([k, v]) => {
    // মডেলে "topicsHeading" কিন্তু data.js এ কী "topics"
    const key = k === "topicsHeading" ? "topics" : k;
    if (hasLang(v)) out[key] = v;
  });
  return out;
};

export const HelpProvider = ({ children }) => {
  const [data, setData] = useState({
    UI: STATIC_UI,
    TOPICS: STATIC_TOPICS,
    FOOTER_QUICK: STATIC_FQ,
    FOOTER_INFO: STATIC_FI,
    LEGAL: STATIC_LEGAL,
    identity: { logo: "", footerBg: "" },
  });

  useEffect(() => {
    let alive = true;

    // কনটেন্ট
    fetch(`${API_URL}/api/help-content/public`)
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return;
        const c = res?.data || {};
        setData((prev) => ({
          UI: mergeUi(c.ui),
          TOPICS: Array.isArray(c.topics) && c.topics.length ? c.topics : prev.TOPICS,
          FOOTER_QUICK: Array.isArray(c.footerQuick) && c.footerQuick.length ? c.footerQuick : prev.FOOTER_QUICK,
          FOOTER_INFO: Array.isArray(c.footerInfo) && c.footerInfo.length ? c.footerInfo : prev.FOOTER_INFO,
          LEGAL: mergeLegal(c.legal),
          identity: {
            logo: img(c.identity?.logo),
            footerBg: img(c.identity?.footerBg),
          },
        }));
      })
      .catch(() => {});

    // রঙ (:root override)
    fetch(`${API_URL}/api/theme/help/sections/public`)
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return;
        const colors = res?.data?.colors || {};
        const root = document.documentElement;
        Object.entries(colors).forEach(([k, v]) => {
          if (v) root.style.setProperty(`--${k}`, v);
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return <HelpContext.Provider value={data}>{children}</HelpContext.Provider>;
};

export const useHelp = () => useContext(HelpContext) || {
  UI: STATIC_UI,
  TOPICS: STATIC_TOPICS,
  FOOTER_QUICK: STATIC_FQ,
  FOOTER_INFO: STATIC_FI,
  LEGAL: STATIC_LEGAL,
  identity: { logo: "", footerBg: "" },
};

export default HelpProvider;
