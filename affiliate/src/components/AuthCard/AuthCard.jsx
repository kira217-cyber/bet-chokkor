import React from "react";
import { useSelector } from "react-redux";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectAffiliateAuth } from "../../features/global/globalSelectors";

/**
 * লগইন ও রেজিস্টার পেজের শেয়ার্ড মোড়ক।
 *
 * `variant` ("login"/"register") অনুযায়ী আলাদা রঙ (scoped ক্লাস) ও
 * কনটেন্ট (title/subtitle/footer/image) admin থেকে আসে; খালি হলে
 * প্রপ/স্ট্যাটিকই থাকে।
 */
const AuthCard = ({ title, subtitle, width = "480px", children, footer, variant }) => {
  const { t, tv } = useLanguage();
  const auth = useSelector(selectAffiliateAuth);
  const c = (variant && auth?.[variant]) || {};

  const heading = tv(c.title) || title;
  const sub = tv(c.subtitle) || subtitle;

  return (
    <div className={`affauth ${variant ? `affauth--${variant}` : ""} aff-glow flex min-h-[calc(100vh-var(--header-height))] items-start justify-center lg:min-h-[calc(100vh-var(--desktop-header-height))]`}>
      <div className="aff-container flex justify-center py-10 lg:py-16">
        <div className="w-full" style={{ maxWidth: width }}>
          {c.image ? (
            <img
              src={c.image}
              alt=""
              className="mx-auto mb-5 max-h-24 w-auto object-contain"
              draggable="false"
            />
          ) : null}

          <div className="mb-7 text-center">
            <h1 className="aff-h2" style={{ color: "var(--affauth-title)" }}>{heading}</h1>
            <p className="aff-lead !mt-3" style={{ color: "var(--affauth-subtitle)" }}>{sub}</p>
          </div>

          <div className="aff-card" style={{ background: "var(--affauth-card-bg)" }}>{children}</div>

          {footer && (
            <p className="mt-6 text-center text-[14px] text-[var(--text-muted)]">
              {footer}
            </p>
          )}

          <p className="mt-6 text-center text-[12px] text-[var(--text-disabled)]">
            {t("ageNotice")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
