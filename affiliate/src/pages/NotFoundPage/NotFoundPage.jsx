import React from "react";
import { Link } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--neutral1000)] px-6 text-center">
      <img
        src={`${import.meta.env.BASE_URL}assets/brand/header-logo.png`}
        alt="BET CHOKKOR"
        className="h-9 w-auto object-contain"
        draggable="false"
      />

      <p className="text-[48px] font-extrabold leading-none text-[var(--primary500)]">
        404
      </p>

      <p className="aff-body">{t("notFoundText")}</p>

      <Link to="/" className="aff-btn aff-btn--primary">
        {t("backToHome")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
