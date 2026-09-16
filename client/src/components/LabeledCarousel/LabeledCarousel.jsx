import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";

/**
 * টাইটেল + prev/next বাটনসহ হরাইজন্টাল ক্যারোসেল।
 * প্রোভাইডার / ইভেন্ট / ফিচার্ড গেমস — তিন সেকশনেই এটাই ব্যবহার হয়।
 *
 * সব মাপ মূল সাইট থেকে মাপা (৩৯০px ও ১৩৬৬px দুই জায়গাতেই একই --u মান):
 *   সেকশন সাইড প্যাডিং ৪u, উপরে মার্জিন ৪.২৬৭u (ভার্টিক্যাল প্যাডিং নেই)
 *   লেবেল প্যাডিং-বটম ২.৬৬৭u · লেবেল সারি ৯.০৬৭u
 *   গোল্ড বার ১.০৬৭u × ৫.৩৩৩u, গ্যাপ ২.৬৬৭u · টাইটেল --fs-body/৬০০
 *   নেভ বাটন ৯.০৬৭u বর্গ, radius --radius-3
 *
 * মূল সাইটের মতোই নেভিগেশন বাটনের ক্রম `>` তারপর `<`।
 */
const NavButton = ({ label, icon, onClick }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--neutral700)]"
    style={{
      height: "calc(var(--u) * 9.067)",
      width: "calc(var(--u) * 9.067)",
      borderRadius: "var(--radius-3)",
    }}
  >
    {icon}
  </button>
);

const LabeledCarousel = ({
  title,
  items,
  renderItem,
  slidesPerView,
  aspect,
  autoplayDelay = 0,
  autoplayStartDelay = 0,
}) => {
  const swiperRef = useRef(null);

  if (!Array.isArray(items) || items.length === 0) return null;

  /*
   * ছবিগুলো নিজে থেকেই ঘুরবে, শেষ হলে আবার শুরু থেকে।
   *
   * পর্দায় যতগুলো দেখা যায় তার চেয়ে বেশি স্লাইড না থাকলে ঘোরানোর
   * কিছুই নেই — তখন অটোপ্লে বন্ধ, নইলে swiper একই ছবি নিয়ে লাফাত।
   */
  const perView = Math.ceil(slidesPerView[1]);
  const canLoop = autoplayDelay > 0 && items.length > perView;

  const slideNext = () => swiperRef.current?.slideNext();
  const slidePrev = () => swiperRef.current?.slidePrev();

  return (
    <section
      className="bc-pad bc-pad--carousel w-full"
      style={{ marginTop: "calc(var(--u) * 4.267)" }}
    >
      <div
        className="flex items-center"
        style={{
          height: "calc(var(--u) * 9.067)",
          paddingBottom: "calc(var(--u) * 2.667)",
          boxSizing: "content-box",
        }}
      >
        <span
          className="shrink-0 bg-[var(--primary500)]"
          style={{
            width: "calc(var(--u) * 1.067)",
            height: "calc(var(--u) * 5.333)",
            borderRadius: "999px",
            marginInlineEnd: "calc(var(--u) * 2.667)",
          }}
        />

        <h2
          className="font-semibold text-[var(--neutral100)]"
          style={{ fontSize: "var(--fs-body)", lineHeight: 1 }}
        >
          {title}
        </h2>

        <div
          className="ms-auto flex items-center"
          style={{ gap: "calc(var(--u) * 2.133)" }}
        >
          <NavButton
            label="next"
            icon={<ChevronRight size={16} />}
            onClick={slideNext}
          />
          <NavButton
            label="previous"
            icon={<ChevronLeft size={16} />}
            onClick={slidePrev}
          />
        </div>
      </div>

      <Swiper
        onSwiper={(swiper) => {
          swiperRef.current = swiper;

          /*
           * দুটো সেকশন যেন একসাথে না নড়ে।
           *
           * শুধু আলাদা `delay` দিলে মাঝেমধ্যে তাল মিলে যেত; তাই শুরুটাও
           * পিছিয়ে দেওয়া হয় — একটা আগে নড়ে, অন্যটা একটু পরে।
           */
          if (canLoop && autoplayStartDelay > 0) {
            swiper.autoplay?.stop();
            setTimeout(() => swiper.autoplay?.start(), autoplayStartDelay);
          }
        }}
        modules={canLoop ? [Autoplay] : []}
        loop={canLoop}
        autoplay={
          canLoop
            ? {
                delay: autoplayDelay,
                disableOnInteraction: false,
                // মাউস রাখলে থেমে যায় — পড়ার সময় ছবি সরে গেলে বিরক্তিকর
                pauseOnMouseEnter: true,
              }
            : false
        }
        spaceBetween={8}
        slidesPerView={slidesPerView[0]}
        breakpoints={{ 1024: { slidesPerView: slidesPerView[1] } }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.key} style={{ aspectRatio: aspect }}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default LabeledCarousel;
