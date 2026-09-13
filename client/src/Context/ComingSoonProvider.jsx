import React, { useCallback, useMemo, useState } from "react";

import ComingSoonModal from "../components/ComingSoonModal/ComingSoonModal";
import { ComingSoonContext } from "./comingSoonContext";

/**
 * গেম খেলা এখনো চালু হয়নি — যেকোনো গেমে ক্লিক করলে একটা মডাল দেখায়।
 *
 * মডালের state এক জায়গাতেই থাকে, তাই যে কম্পোনেন্ট থেকেই ক্লিক আসুক
 * (হোমের ফিচার্ড গেম, গেম লিস্ট পেজ) — একই মডাল খোলে।
 */
const ComingSoonProvider = ({ children }) => {
  const [game, setGame] = useState(null);

  const openComingSoon = useCallback((next) => setGame(next || {}), []);
  const closeComingSoon = useCallback(() => setGame(null), []);

  const value = useMemo(() => ({ openComingSoon }), [openComingSoon]);

  return (
    <ComingSoonContext.Provider value={value}>
      {children}

      <ComingSoonModal game={game} onClose={closeComingSoon} />
    </ComingSoonContext.Provider>
  );
};

export default ComingSoonProvider;
