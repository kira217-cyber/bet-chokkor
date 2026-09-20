import { useEffect } from "react";

import { fetchAffiliateSections } from "../../features/theme/themeApi";

/**
 * অ্যাডমিন-নিয়ন্ত্রিত থিম কালার পুরো অ্যাফিলিয়েট সাইটে বসায়। কোনো UI
 * রেন্ডার করে না।
 *
 * কম্পোনেন্টগুলো CSS ভ্যারিয়েবল (var(--primary500) ইত্যাদি) ব্যবহার করে,
 * তাই :root এ ওভাররাইড করলেই রঙ বদলে যায়। অ্যাডমিন যা সেট করেনি
 * সেগুলো index.css এর ডিফল্টই থাকে।
 */
const ThemeApplier = () => {
  useEffect(() => {
    let alive = true;

    fetchAffiliateSections()
      .then((colors) => {
        if (!alive) return;
        const root = document.documentElement;
        Object.entries(colors || {}).forEach(([key, value]) => {
          if (value) root.style.setProperty(`--${key}`, value);
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return null;
};

export default ThemeApplier;
