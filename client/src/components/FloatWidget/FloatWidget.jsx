import React from "react";

/**
 * ডান-নিচে ভাসমান ব্র্যান্ড বাটন (মূল সাইটের কাস্টমার-সার্ভিস উইজেট)।
 */
const FloatWidget = () => {
  return (
    <button
      type="button"
      aria-label="support"
      className="fixed bottom-[calc(var(--u)*17)] right-3 z-30 flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-full bg-[var(--neutral1000)] shadow-lg shadow-black/40 transition-transform hover:scale-105 lg:bottom-6 lg:right-6"
    >
      <img
        src="/assets/brand/header-logo.png"
        alt=""
        className="h-6 w-auto object-contain"
        draggable="false"
      />
    </button>
  );
};

export default FloatWidget;
