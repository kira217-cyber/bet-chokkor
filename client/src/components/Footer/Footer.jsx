import React, { useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { ChevronDown } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import { selectFooterSetting } from "../../features/global/globalSelectors";

/**
 * মোবাইলে লিংকগুলো accordion, ডেস্কটপে ৪-কলাম গ্রিডে খোলা —
 * মূল সাইটের footer-collapses / footer-links এর মতো।
 *
 * মূল সাইট থেকে মাপা (--u এককে):
 *   কলাপ্স হেড প্যাডিং ৫.০৬৭u ০ · লাইসেন্স ব্লক প্যাডিং ৫.৩৩৩u ০ ১.৩৩৩u
 *   ব্লক টাইটেল --fs-larger/৬০০ গোল্ড, margin-bottom ৪u
 *   লাইসেন্স লোগো উচ্চতা ৮.৫u · দায়িত্বশীল আইকন ৮.২u, margin ০ ৫.৩৩৩u ১.৩৩৩u ০
 *   ব্র্যান্ড প্যাডিং ৫.৩৩৩u ০, লোগো ১০.৬৬u উঁচু margin-right ৪.২৬৭u
 *   ব্র্যান্ড টেক্সট --fs-normal · লাইসেন্স টেক্সট --fs-larger/৩০০
 */
const Footer = () => {
  const { tv } = useLanguage();
  const setting = useSelector(selectFooterSetting);

  const [openKey, setOpenKey] = useState(null);

  if (!setting) return null;

  const t = tv;

  const iconBlock = (group, itemHeight) => (
    <div
      style={{
        padding: "calc(var(--u) * 5.333) 0 calc(var(--u) * 1.333)",
      }}
    >
      <h3
        className="font-semibold text-[var(--primary500)]"
        style={{
          fontSize: "var(--fs-larger)",
          lineHeight: 1,
          marginBottom: "calc(var(--u) * 4)",
        }}
      >
        {t(group.title)}
      </h3>

      <div className="flex flex-wrap items-center">
        {group.items.map((item) => (
          <img
            key={item.key}
            src={item.image}
            alt={item.alt}
            className="object-contain"
            style={{
              height: `calc(var(--u) * ${itemHeight})`,
              margin:
                "0 calc(var(--u) * 5.333) calc(var(--u) * 1.333) 0",
            }}
            draggable="false"
          />
        ))}
      </div>
    </div>
  );

  return (
    <footer className="w-full bg-[var(--neutral1000)] lg:bg-transparent">
      <div className="bc-page">
        <div className="bc-pad lg:px-0">
          {/* ── লিংক সেকশন ── */}
          <div
            className="lg:grid lg:grid-cols-4"
            style={{ paddingBlock: "calc(var(--u) * 2.667)" }}
          >
            {setting.collapses.map((group) => {
              const isOpen = openKey === group.key;

              return (
                <div
                  key={group.key}
                  className="border-b border-white/10 lg:border-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenKey(isOpen ? null : group.key)}
                    className="flex w-full cursor-pointer items-center justify-between text-[var(--text-secondary)] lg:pointer-events-none lg:text-[var(--text-primary)]"
                    style={{
                      padding: "calc(var(--u) * 5.067) 0",
                      fontSize: "var(--fs-larger)",
                    }}
                  >
                    {t(group.title)}

                    <ChevronDown
                      size={18}
                      className={`text-[var(--text-muted)] transition-transform duration-300 lg:hidden ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <ul
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out lg:!max-h-none ${
                      isOpen ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    {group.items.map((item) => {
                      const linkClass =
                        "block text-[var(--text-muted)] transition-colors hover:text-[var(--primary500)]";
                      const linkStyle = {
                        paddingBlock: "calc(var(--u) * 2.133)",
                        fontSize: "var(--fs-normal)",
                      };

                      return (
                        <li key={item.path}>
                          {item.external ? (
                            /* হেল্প পেজ আলাদা সাইট — নতুন ট্যাবে ডোমেইনে */
                            <a
                              href={item.href || item.path}
                              target="_blank"
                              rel="noreferrer noopener"
                              className={linkClass}
                              style={linkStyle}
                            >
                              {t(item.name)}
                            </a>
                          ) : (
                            <Link to={item.path} className={linkClass} style={linkStyle}>
                              {t(item.name)}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* ডেস্কটপে লাইসেন্স ও দায়িত্বশীল-গেমিং পাশাপাশি */}
          <div className="lg:flex lg:gap-16">
            {iconBlock(setting.gamingLicense, 8.5)}
            {iconBlock(setting.responsibleGaming, 8.2)}
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* ── ব্র্যান্ড ── */}
          <div
            className="flex items-center"
            style={{ padding: "calc(var(--u) * 5.333) 0" }}
          >
            {setting.brand.logo ? (
              <img
                src={setting.brand.logo}
                alt="BET CHOKKOR"
                className="shrink-0 object-contain"
                style={{
                  height: "calc(var(--u) * 10.66)",
                  marginInlineEnd: "calc(var(--u) * 4.267)",
                }}
                draggable="false"
              />
            ) : (
              <span
                className="shrink-0 font-bold text-[var(--text-muted)]"
                style={{
                  fontSize: "var(--fs-normal)",
                  marginInlineEnd: "calc(var(--u) * 4.267)",
                }}
              >
                Logo not found
              </span>
            )}

            <div>
              <p
                className="font-semibold text-[var(--primary500)]"
                style={{ fontSize: "var(--fs-normal)" }}
              >
                {t(setting.brand.subtitle) || "Not set"}
              </p>

              <p
                className="text-[var(--text-muted)]"
                style={{ fontSize: "var(--fs-normal)" }}
              >
                {t(setting.brand.copyright) || "Not set"}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-white/10" />

          {/* ── লাইসেন্স ── */}
          <p
            className="font-light leading-relaxed text-[var(--text-muted)]"
            style={{
              fontSize: "var(--fs-larger)",
              padding: "calc(var(--u) * 5.333) 0",
            }}
          >
            {t(setting.license) || "Not set"}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
