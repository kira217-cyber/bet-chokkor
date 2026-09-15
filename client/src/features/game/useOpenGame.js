import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

import { useComingSoon } from "../../Context/comingSoonContext";
import { selectIsAuth } from "../auth/authSelectors";

/**
 * গেমে ক্লিক করলে কী হবে — এক জায়গায়।
 *
 * তিনটে অবস্থা:
 *   লগইন করা নেই   → লগইন পাতায়, ফিরে এসে যেন গেমটাই খোলে
 *   গেমের uid নেই  → "শীঘ্রই আসছে" (অ্যাডমিনে গেম API key বসানো নেই,
 *                     তখন সাইট বিল্ট-ইন নমুনা তালিকা দেখায় — ওগুলোর
 *                     আসল uid নেই, তাই চালু করা যায় না)
 *   দুটোই আছে      → গেমের পাতা
 *
 * হোমের ফিচার্ড কার্ড আর গেম লিস্ট — দুই জায়গাতেই একই আচরণ দরকার,
 * তাই আলাদা আলাদা না লিখে এখানেই।
 */
export const useOpenGame = () => {
  const navigate = useNavigate();
  const isAuth = useSelector(selectIsAuth);
  const { openComingSoon } = useComingSoon();

  return useCallback(
    (game = {}) => {
      // শুধু লাইভ তালিকার গেমেই আসল uid থাকে — বিল্ট-ইন নমুনার
      // gameCode ("JILI-SLOT-027") দেখতে কোডের মতো হলেও ওটা দিয়ে গেম
      // চালু হয় না, তাই সেটা এখানে ধরা হয় না
      const uid = String(game.gameUId || "").trim();

      if (!uid) {
        openComingSoon({
          name: game.name || game.gameName,
          image: game.image || game.icon,
          vendor: game.vendor || game.vendorName,
        });
        return;
      }

      if (!isAuth) {
        navigate(`/login?next=${encodeURIComponent(`/play/${uid}`)}`);
        return;
      }

      navigate(`/play/${uid}`);
    },
    [isAuth, navigate, openComingSoon],
  );
};

export default useOpenGame;
