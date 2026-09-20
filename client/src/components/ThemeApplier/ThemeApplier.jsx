import { useEffect } from "react";

import {
  fetchClientTheme,
  fetchClientSections,
} from "../../features/theme/themeApi";

/**
 * অ্যাডমিন-নিয়ন্ত্রিত থিম কালার পুরো সাইটে বসায়। কোনো UI রেন্ডার করে না।
 *
 * সব কম্পোনেন্ট CSS ভ্যারিয়েবল (var(--primary500) ইত্যাদি) ব্যবহার করে,
 * তাই :root এ ভ্যারিয়েবলগুলো ওভাররাইড করলেই পুরো সাইটের সব পেজের রঙ
 * বদলে যায়। অ্যাডমিন যা সেট করেনি সেগুলো index.css এর ডিফল্টই থাকে।
 */
const ThemeApplier = () => {
  useEffect(() => {
    let alive = true;

    const apply = (colors) => {
      const root = document.documentElement;
      Object.entries(colors || {}).forEach(([key, value]) => {
        if (value) root.style.setProperty(`--${key}`, value);
      });
    };

    // বেস থিম (palette) + প্রতি সেকশনের override — দুটোই :root এ বসে
    fetchClientTheme()
      .then((theme) => {
        if (alive && theme?.active !== false) apply(theme?.colors);
      })
      .catch(() => {});

    fetchClientSections()
      .then((colors) => {
        if (alive) apply(colors);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return null;
};

export default ThemeApplier;
