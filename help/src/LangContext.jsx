import React, { createContext, useContext, useEffect, useState } from "react";

/**
 * ভাষা — ইংরেজি ও বাংলা।
 *
 * পছন্দটা localStorage এ থাকে, তাই পাতা বদলালেও একই ভাষা থাকে।
 * `t(obj)` একটা {en, bn} অবজেক্ট থেকে চলতি ভাষার লেখা দেয়।
 */
const LangContext = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("help-lang");
      if (saved === "en" || saved === "bn") setLang(saved);
    } catch {
      // localStorage বন্ধ থাকলে ডিফল্ট ইংরেজিই চলবে
    }
  }, []);

  const change = (next) => {
    setLang(next);
    try {
      localStorage.setItem("help-lang", next);
    } catch {
      // সেভ না হলেও চলতি সেশনে ভাষা কাজ করবে
    }
  };

  const t = (obj) => (obj ? obj[lang] ?? obj.en ?? "" : "");

  return (
    <LangContext.Provider value={{ lang, setLang: change, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
