import React from "react";
import { Link } from "react-router";

import { useLang } from "../LangContext.jsx";
import { UI } from "../data.js";

const NotFound = () => {
  const { t } = useLang();

  return (
    <div className="hv-container flex flex-col items-center py-24 text-center">
      <p className="text-[64px] font-black text-[var(--gold)]">404</p>
      <p className="mt-2 text-[16px] text-[var(--text-mute)]">
        {t(UI.noResult)}
      </p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-[var(--gold)] px-6 py-2.5 text-[14px] font-bold text-black"
      >
        {t(UI.breadcrumbHome)}
      </Link>
    </div>
  );
};

export default NotFound;
