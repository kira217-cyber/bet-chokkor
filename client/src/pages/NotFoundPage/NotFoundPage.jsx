import React from "react";
import { Link } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

const NotFoundPage = () => {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--neutral1000)] px-6 text-center">
      <img
        src="/assets/brand/header-logo.png"
        alt="BET CHOKKOR"
        className="h-10 w-auto object-contain"
        draggable="false"
      />

      <p className="text-[48px] font-bold leading-none text-[var(--primary500)]">
        404
      </p>

      <p className="text-[15px] text-[var(--text-muted)]">
        {t("notFoundText")}
      </p>

      <Link
        to="/"
        className="rounded-[10px] bg-[var(--btn-primary-bg)] px-6 py-2.5 text-[14px] font-bold text-[var(--btn-primary-txt)] transition-colors hover:brightness-105"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
};

export default NotFoundPage;
