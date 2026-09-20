import React from "react";

/**
 * global + game ডেটা লোড হওয়ার আগ পর্যন্ত পুরো স্ক্রিন জুড়ে দেখানো হয়।
 *
 * মূল সাইটের লোডার হুবহু: neutral900 ব্যাকগ্রাউন্ডে উপরে ৬px উঁচু একটা
 * প্রোগ্রেস বার — ট্র্যাক neutral700, ফিল primary600 → primary500
 * গ্রেডিয়েন্ট, বাঁ থেকে ডানে এগোয়। মাঝখানে সাইটের নিজস্ব ঘূর্ণায়মান
 * রিং আর তার ভিতরে ব্র্যান্ড লোগো। (সাইটের loader.webp এর আর্ক সাদা,
 * কিন্তু আসল লোডারে সোনালি — তাই রিংটা CSS দিয়ে বানানো।)
 */
const SiteLoader = () => {
  return (
    <div className="site-loader">
      <span className="site-loader__track">
        <span className="site-loader__bar" />
      </span>

      <span className="site-loader__spinner">
        <span className="site-loader__disc" />
        <span className="site-loader__arc" />
        <img
          src={`${import.meta.env.BASE_URL}assets/brand/logo.png`}
          alt="BET CHOKKOR"
          className="site-loader__logo"
          draggable="false"
        />
      </span>

      <style>{`
        .site-loader {
          position: fixed;
          inset: 0;
          z-index: 999;
          background: var(--neutral900);
        }

        .site-loader__track {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          overflow: hidden;
          background: var(--neutral700);
        }

        .site-loader__bar {
          display: block;
          height: 100%;
          width: 100%;
          transform-origin: left center;
          background: linear-gradient(
            to right,
            var(--primary600),
            var(--primary500)
          );
          animation: siteLoaderProgress 1.6s ease-in-out infinite;
        }

        .site-loader__spinner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: block;
          width: 100px;
          height: 100px;
        }

        /* গাঢ় ডিস্ক + তার কিনারায় ঘুরতে থাকা সোনালি আর্ক */
        .site-loader__disc {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: #0b0b0a;
          box-shadow:
            0 0 0 4px #1a1a18,
            0 0 18px rgba(0, 0, 0, 0.6) inset;
        }

        .site-loader__arc {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 300deg,
            var(--primary600) 320deg,
            var(--primary500) 355deg,
            transparent 360deg
          );
          -webkit-mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 4px),
            #000 calc(100% - 4px)
          );
          mask: radial-gradient(
            farthest-side,
            transparent calc(100% - 4px),
            #000 calc(100% - 4px)
          );
          animation: siteLoaderSpin 1.1s linear infinite;
        }

        @keyframes siteLoaderSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .site-loader__logo {
          position: absolute;
          z-index: 1;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 42%;
          object-fit: contain;
        }

        @keyframes siteLoaderProgress {
          0% {
            transform: scaleX(0.05);
          }

          70% {
            transform: scaleX(0.75);
          }

          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SiteLoader;
