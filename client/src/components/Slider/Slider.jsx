import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import { useLanguage } from "../../Context/LanguageProvider";
import {
  selectSliders,
  selectGlobalLoading,
  selectGlobalLoaded,
} from "../../features/global/globalSelectors";

/**
 * হোম ব্যানার।
 *
 * মোবাইল (মূল সাইট থেকে মাপা): সেকশন ৩৯০×২০২.৭৭, স্লাইড ৩৫৩.৫৯×১৬৯.৫২ —
 * অর্থাৎ দুই পাশে ৪.৬৭u প্যাডিং, উপর-নিচে ৪.২৭u, উচ্চতা ৪৩.৪৭u।
 * ডেস্কটপ: ছবি ফিক্সড ১৯২০×২১০ (সোর্সের ঠিক অর্ধেক) সেন্টারড, কনটেইনার
 * যত চওড়াই হোক — মূল সাইট ঠিক এভাবেই করে, তাই crop একই থাকে।
 */
const Slider = () => {
  const { tv } = useLanguage();

  const sliders = useSelector(selectSliders);
  const loading = useSelector(selectGlobalLoading);
  const loaded = useSelector(selectGlobalLoaded);

  // স্কেলিটন আর আসল ব্যানার একই <style> ব্লক শেয়ার করে, তাই দুটোই
  // এক return এর ভিতরে রাখা
  const ready = !(loading || !loaded) && sliders.length > 0;

  const navButton = (side, icon) => (
    <button
      type="button"
      aria-label={side === "prev" ? "previous banner" : "next banner"}
      className={`banner-${side} absolute top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer items-center justify-center bg-[var(--neutral800)]/80 text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral700)] lg:flex ${
        side === "prev" ? "left-6" : "right-6"
      }`}
      style={{
        height: "calc(var(--u) * 9.067)",
        width: "calc(var(--u) * 9.067)",
        borderRadius: "var(--radius-3)",
      }}
    >
      {icon}
    </button>
  );

  return (
    <section className="banner-section relative w-full">
      {!ready && (
        <div className="banner-slide">
          <div className="banner-media animate-pulse bg-[var(--neutral800)]" />
        </div>
      )}

      {ready && (
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          loop
          speed={700}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{ clickable: true, el: ".banner-pagination" }}
          navigation={{ nextEl: ".banner-next", prevEl: ".banner-prev" }}
          slidesPerView={1}
        >
          {sliders.map((item) => {
            const title = tv(item.title);

            return (
              <SwiperSlide key={item.id}>
                <Link to={item.link} className="banner-slide block">
                  <picture>
                    <source
                      media="(min-width: 1024px)"
                      srcSet={item.desktopImage}
                    />
                    <img
                      src={item.mobileImage}
                      alt={title}
                      className="banner-media object-cover"
                      draggable="false"
                    />
                  </picture>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}

      {/* মূল সাইটের মতোই বাঁ পাশে `>` আর ডান পাশে `<` */}
      {navButton("prev", <ChevronRight size={16} />)}
      {navButton("next", <ChevronLeft size={16} />)}

      <div className="banner-pagination absolute left-0 right-0 z-20 flex justify-center gap-[5px]" />

      <style>{`
        .banner-section {
          padding-block: calc(var(--u) * 4.27);
        }

        .banner-slide {
          padding-inline: calc(var(--u) * 4.67);
        }

        .banner-media {
          display: block;
          width: 100%;
          height: calc(var(--u) * 43.47);
          border-radius: var(--radius-10);
        }

        /* swiper এর নিজের .swiper-pagination-bullets রুল ওভাররাইড করতে
           সেকশন-স্কোপড সিলেক্টর দরকার */
        .banner-section .banner-pagination {
          bottom: calc(var(--u) * 6.5);
        }

        .banner-pagination .swiper-pagination-bullet {
          width: 12px;
          height: 3px;
          border-radius: 999px;
          background: var(--neutral700);
          opacity: 1;
          margin: 0 !important;
          transition: width 0.3s ease, background 0.3s ease;
        }

        .banner-pagination .swiper-pagination-bullet-active {
          width: 22px;
          background: var(--primary500);
        }

        @media (min-width: 1024px) {
          .banner-section {
            padding-block: 0;
          }

          .banner-slide {
            padding-inline: 0;
          }

          .banner-slide {
            display: flex;
            justify-content: center;
            overflow: hidden;
            background: var(--neutral1000);
          }

          .banner-slide picture {
            display: block;
            flex: none;
          }

          .banner-media {
            width: 1920px;
            max-width: none;
            height: 210px;
            border-radius: 0;
            object-fit: fill;
          }

          .banner-section .banner-pagination {
            bottom: 16px;
          }
        }
      `}</style>
    </section>
  );
};

export default Slider;
