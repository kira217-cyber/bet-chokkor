import React from "react";
import { Link } from "react-router";

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--neutral1000)] px-6 text-center">
    <img
      src="/assets/brand/header-logo.png"
      alt="BET CHOKKOR"
      className="h-9 w-auto object-contain"
      draggable="false"
    />

    <p className="text-[44px] font-extrabold leading-none text-[var(--primary500)]">
      404
    </p>

    <p className="text-[15px] text-[var(--text-muted)]">
      This admin page does not exist.
    </p>

    <Link to="/" className="ad-btn ad-btn--primary">
      Back to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
