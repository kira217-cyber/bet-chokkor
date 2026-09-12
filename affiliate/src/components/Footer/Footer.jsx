import React from "react";
import { Link } from "react-router";

import { useLanguage } from "../../Context/LanguageProvider";

const LICENSES = [
  { key: "curacao", src: "/assets/footer/gaming_license.png", alt: "Gaming Curacao" },
  { key: "anjouan", src: "/assets/footer/anjouan_license.png", alt: "Anjouan eGaming" },
  { key: "montenegro", src: "/assets/footer/montenegro_license.png", alt: "Montenegro" },
];

const RESPONSIBLE = [
  { key: "regulations", src: "/assets/icons/trivial/regulations.svg", alt: "Regulations" },
  { key: "gamcare", src: "/assets/icons/trivial/gamcare.svg", alt: "GamCare" },
  { key: "age", src: "/assets/icons/trivial/age-limit.svg", alt: "18+" },
];

const Footer = () => {
  const { t } = useLanguage();

  const clientUrl = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";

  const linkClass =
    "text-[14px] text-[var(--text-muted)] transition-colors hover:text-[var(--primary500)]";

  return (
    <footer className="border-t border-[var(--neutral800)] bg-[var(--neutral1000)]">
      <div className="aff-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/assets/brand/header-logo.png"
                alt="BET CHOKKOR"
                className="h-8 w-auto object-contain"
                draggable="false"
              />
              <span className="text-[13px] font-semibold uppercase tracking-widest text-[var(--primary500)]">
                Affiliates
              </span>
            </div>

            <p className="aff-body mt-4 max-w-xs">{t("ctaText")}</p>
          </div>

          <div>
            <h3 className="mb-4 text-[14px] font-semibold text-[var(--primary500)]">
              {t("footerLinks")}
            </h3>

            <ul className="flex flex-col gap-3">
              <li>
                <a href="#commission" className={linkClass}>
                  {t("navCommission")}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className={linkClass}>
                  {t("navHowItWorks")}
                </a>
              </li>
              <li>
                <a href="#faq" className={linkClass}>
                  {t("navFaq")}
                </a>
              </li>
              <li>
                <a
                  href={clientUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {t("mainSite")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[14px] font-semibold text-[var(--primary500)]">
              {t("footerSupport")}
            </h3>

            <ul className="flex flex-col gap-3">
              <li>
                <Link to="/register" className={linkClass}>
                  {t("signup")}
                </Link>
              </li>
              <li>
                <Link to="/login" className={linkClass}>
                  {t("login")}
                </Link>
              </li>
              <li>
                <span className={linkClass}>{t("liveChat")}</span>
              </li>
              <li>
                <span className={linkClass}>{t("contactUs")}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h3 className="mb-4 text-[14px] font-semibold text-[var(--primary500)]">
                {t("footerLicense")}
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                {LICENSES.map((item) => (
                  <img
                    key={item.key}
                    src={item.src}
                    alt={item.alt}
                    className="h-8 w-auto object-contain"
                    draggable="false"
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[14px] font-semibold text-[var(--primary500)]">
                {t("footerResponsible")}
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                {RESPONSIBLE.map((item) => (
                  <img
                    key={item.key}
                    src={item.src}
                    alt={item.alt}
                    className="h-8 w-auto object-contain"
                    draggable="false"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--neutral800)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[var(--text-muted)]">{t("copyright")}</p>
          <p className="text-[13px] text-[var(--text-disabled)]">{t("ageNotice")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
