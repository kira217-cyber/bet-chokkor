import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { ChevronDown, X } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectSideNavLinks,
  selectSliders,
} from "../../features/global/globalSelectors";
import { selectGameCategories } from "../../features/globalGame/globalGameSelectors";

/**
 * বাঁ পাশের নেভিগেশন।
 *
 * ডেস্কটপ — হেডারের নিচ থেকে শুরু; বন্ধ অবস্থায় ৬৮px আইকন-রেল,
 * হেডারের হ্যামবার্গারে ক্লিকে ৩৫০px এ খোলে।
 * মোবাইল — bottom bar এর "মেনু" থেকে ড্রয়ার হিসেবে আসে (সবসময় খোলা রূপ)।
 *
 * মূল সাইট থেকে মাপা:
 *   খোলা অবস্থায় প্রস্থ ৩৫০px, আইটেম ৩১৮×৫২ (দুই পাশে ১৬px মার্জিন)
 *   বন্ধ অবস্থায় প্রস্থ ৬৮px, আইটেম ৫২×৫২ (দুই পাশে ৮px মার্জিন)
 *   আইটেম bg neutral800, radius --radius-10, আইকন ২০×২০
 *   সেকশনের মাঝে ১৬px প্যাডিং, আইটেমের মাঝে ৮px গ্যাপ
 *
 * খোলা অবস্থায় ক্যাটাগরিগুলো accordion — ভেতরে ভেন্ডরের তালিকা।
 */
const Sidebar = ({ open, setOpen, desktopOpen }) => {
  const { t, tv } = useLanguage();

  const categories = useSelector(selectGameCategories);
  const sideNavLinks = useSelector(selectSideNavLinks);
  const sliders = useSelector(selectSliders);

  const [openCategory, setOpenCategory] = useState(null);
  const [promoOpen, setPromoOpen] = useState(true);

  // প্রমোশন ব্যানার নিজে থেকে স্লাইড করে, শেষ হলে আবার শুরু থেকে
  const promoRef = useRef(null);

  useEffect(() => {
    if (!promoOpen) return undefined;

    const timer = setInterval(() => {
      const track = promoRef.current;
      if (!track) return;

      const step = track.clientWidth * 0.66;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;

      track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(timer);
  }, [promoOpen]);

  const label = (item) => tv(item.name);

  const rowClass =
    "side-row group flex h-[52px] shrink-0 items-center bg-[var(--neutral800)] transition-colors hover:bg-[var(--neutral700)]";

  const icon = (src) => (
    <img
      src={src}
      alt=""
      className="h-5 w-5 shrink-0 object-contain"
      draggable="false"
    />
  );

  const title = (text) => (
    <span
      className="truncate font-medium text-[var(--text-secondary)] group-hover:text-[var(--neutral100)]"
      style={{ fontSize: "var(--fs-larger)" }}
    >
      {text}
    </span>
  );

  /** খোলা অবস্থার accordion — ক্যাটাগরির ভেতরে ভেন্ডর তালিকা */
  const categoryAccordion = (item, onNavigate) => {
    const isOpen = openCategory === item.key;

    return (
      <div
        key={item.key}
        className="side-collapse shrink-0 overflow-hidden"
        style={{
          borderRadius: "var(--radius-10)",
          background: isOpen ? "var(--neutral900)" : "transparent",
        }}
      >
        <button
          type="button"
          onClick={() => setOpenCategory(isOpen ? null : item.key)}
          className={`${rowClass} w-full cursor-pointer justify-between gap-3`}
        >
          <span className="flex min-w-0 items-center gap-3">
            {icon(item.icon)}
            {title(label(item))}
          </span>

          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--neutral700)] text-[var(--text-secondary)]"
            aria-hidden="true"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>

        <div
          className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
            isOpen ? "max-h-[640px]" : "max-h-0"
          }`}
        >
          <ul
            className="flex flex-col"
            style={{
              gap: "calc(var(--u) * 2.133)",
              padding: "calc(var(--u) * 2.133) calc(var(--u) * 4.267) calc(var(--u) * 4.267)",
            }}
          >
            {item.vendors.map((vendor) => (
              <li key={vendor.key}>
                <Link
                  to={`/games/${item.key}?vendor=${vendor.key}`}
                  onClick={onNavigate}
                  className="flex h-[52px] items-center gap-3 bg-[var(--neutral800)] px-4 font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral700)] hover:text-[var(--neutral100)]"
                  style={{
                    fontSize: "var(--fs-larger)",
                    borderRadius: "var(--radius-10)",
                  }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--neutral700)]">
                    <img
                      src={vendor.icon}
                      alt=""
                      className="h-5 w-5 object-contain"
                      draggable="false"
                    />
                  </span>
                  {tv(vendor.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  /** বন্ধ রেলের আইকন-শুধু আইটেম */
  const railItem = (item, to, iconSrc) => (
    <Link
      key={item.key}
      to={to}
      title={label(item)}
      className={`${rowClass} justify-center`}
    >
      {icon(iconSrc)}
    </Link>
  );

  const liveSupport = (expanded) => (
    <button
      type="button"
      className={`${rowClass} cursor-pointer ${
        expanded ? "w-fit gap-3" : "justify-center"
      }`}
    >
      {icon("/assets/icons/utility/icon-livechat.svg")}
      {expanded && title(t("liveSupport"))}
    </button>
  );

  const promotions = (onNavigate) => (
    <div
      className="side-collapse shrink-0 overflow-hidden"
      style={{
        borderRadius: "var(--radius-10)",
        background: promoOpen ? "var(--neutral900)" : "transparent",
      }}
    >
      <div className={`${rowClass} justify-between gap-3`}>
        <span className="flex min-w-0 items-center gap-3">
          {icon("/assets/icons/utility/icon-gift.svg")}
          {title(t("promotion"))}
        </span>

        <span className="flex shrink-0 items-center gap-2">
          <Link
            to="/promotion"
            onClick={onNavigate}
            className="text-[var(--primary500)] underline underline-offset-4"
            style={{ fontSize: "var(--fs-normal)" }}
          >
            {t("viewAll")}
          </Link>

          <button
            type="button"
            onClick={() => setPromoOpen((prev) => !prev)}
            aria-label="toggle promotions"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[8px] bg-[var(--neutral700)] text-[var(--text-secondary)]"
          >
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${
                promoOpen ? "rotate-180" : ""
              }`}
            />
          </button>
        </span>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          promoOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <div
          ref={promoRef}
          className="no-scrollbar flex overflow-x-auto"
          style={{
            gap: "calc(var(--u) * 2.133)",
            padding:
              "calc(var(--u) * 2.133) calc(var(--u) * 4.267) calc(var(--u) * 4.267)",
          }}
        >
          {sliders.map((slide) => (
            <Link
              key={slide.id}
              to={slide.link}
              onClick={onNavigate}
              className="shrink-0"
              style={{ width: "62%" }}
            >
              <img
                src={slide.mobileImage}
                alt={tv(slide.title)}
                className="w-full object-cover"
                style={{
                  aspectRatio: "358.81 / 172.02",
                  borderRadius: "var(--radius-10)",
                }}
                draggable="false"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const linkGroup = (group, expanded, onNavigate) =>
    sideNavLinks
      .filter((item) => item.group === group)
      .map((item) =>
        expanded ? (
          <Link
            key={item.key}
            to={item.path}
            onClick={onNavigate}
            className={`${rowClass} gap-3`}
          >
            {icon(item.icon)}
            {title(label(item))}
          </Link>
        ) : (
          railItem(item, item.path, item.icon)
        ),
      );

  const nav = (expanded, onNavigate) => (
    <nav className="flex flex-1 flex-col overflow-y-auto">
      <div className="side-section side-section--first flex shrink-0 flex-col">
        {liveSupport(expanded)}
      </div>

      <span className="side-divider h-px shrink-0 bg-[var(--neutral700)]" />

      <div className="side-section flex shrink-0 flex-col">
        {expanded
          ? categories.map((item) => categoryAccordion(item, onNavigate))
          : categories.map((item) =>
              railItem(item, `/games/${item.key}`, item.icon),
            )}
      </div>

      <span className="side-divider h-px shrink-0 bg-[var(--neutral700)]" />

      <div className="side-section flex shrink-0 flex-col">
        {expanded ? (
          promotions(onNavigate)
        ) : (
          <Link
            to="/promotion"
            title={t("promotion")}
            className={`${rowClass} justify-center`}
          >
            {icon("/assets/icons/utility/icon-gift.svg")}
          </Link>
        )}

        {linkGroup("main", expanded, onNavigate)}
      </div>

      <span className="side-divider h-px shrink-0 bg-[var(--neutral700)]" />

      <div className="side-section flex shrink-0 flex-col">
        {linkGroup("support", expanded, onNavigate)}
      </div>
    </nav>
  );

  const scopedStyle = (
    <style>{`
      /* মূল সাইটে সাইডবারে দৃশ্যমান স্ক্রলবার নেই, শুধু ডান পাশে
         একটা সরু বিভাজক রেখা */
      .side-nav {
        border-inline-end: 1px solid var(--neutral800);
      }

      .side-nav nav {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .side-nav nav::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .side-section {
        gap: 8px;
        padding-block: 16px;
      }

      /* হেডারের নিচের বর্ডারের সাথে যেন লেগে না যায় */
      .side-section--first {
        padding-top: 8px;
      }

      .side-section .side-row {
        border-radius: var(--radius-10);
        margin-inline: 8px;
        padding-inline: 16px;
      }

      .side-divider {
        margin-inline: 8px;
      }

      /* খোলা অবস্থায় আইটেম ৩১৮px চওড়া — দুই পাশে ১৬px মার্জিন */
      .side-nav--open .side-section .side-row,
      .side-nav--open .side-divider {
        margin-inline: 16px;
      }

      /* accordion খোলা থাকলে বাইরের কনটেইনারই মার্জিন ধরে,
         ভেতরের হেডার সারি প্রান্ত পর্যন্ত যায় */
      .side-nav--open .side-collapse {
        margin-inline: 16px;
      }

      .side-nav--open .side-collapse .side-row {
        margin-inline: 0;
      }
    `}</style>
  );

  return (
    <>
      {/* ── ডেস্কটপ রেল — হেডারের নিচ থেকে ── */}
      <aside
        className={`side-nav fixed left-0 z-40 hidden flex-col bg-[var(--neutral900)] transition-[width] duration-300 ease-in-out lg:flex ${
          desktopOpen
            ? "side-nav--open w-[var(--side-nav-width-open)]"
            : "w-[var(--side-nav-width)]"
        }`}
        style={{
          top: "var(--desktop-header-height)",
          height: "calc(100vh - var(--desktop-header-height))",
        }}
      >
        {nav(desktopOpen, null)}
      </aside>

      {/* ── মোবাইল ড্রয়ার ── */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[60] bg-[var(--modal-mask-bg)] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`side-nav side-nav--open fixed left-0 top-0 z-[61] flex h-screen w-[350px] max-w-[88vw] flex-col bg-[var(--neutral900)] transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className="flex shrink-0 items-center justify-between px-4"
          style={{ height: "var(--header-height)" }}
        >
          <img
            src="/assets/brand/header-logo.png"
            alt="BET CHOKKOR"
            className="w-auto object-contain"
            style={{ height: "calc(var(--u) * 9.067)" }}
            draggable="false"
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="close menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[var(--radius-10)] bg-[var(--neutral800)] text-[var(--primary500)] transition-colors hover:bg-[var(--neutral700)]"
          >
            <X size={20} />
          </button>
        </div>

        {nav(true, () => setOpen(false))}
      </aside>

      {scopedStyle}
    </>
  );
};

export default Sidebar;
