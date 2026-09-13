import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api } from "../../api/axios";
import { gameListPage } from "../../data/gameListData";

const GAME_PROXY_API = "/api/admin/game-api-key/client";

/**
 * লাইভ রেকর্ডকে স্ট্যাটিক ডেটার আকারে আনে।
 *
 * গেম লিস্ট পেজের JSX `gameName / vendorName / icon` ধরে লেখা — উৎস
 * বদলালেও সেই নাম যেন বদলাতে না হয়, তাই অনুবাদটা এখানেই সেরে ফেলা হয়।
 */
const toPageShape = (game) => ({
  gameId: game.gameId || game.key,
  gameCode: game.gameUId || game.key,
  gameName: game.name,
  vendorName: game.vendor,
  // master গেমের সাথে প্রোভাইডারের নাম পাঠায় না, আইডি পাঠায় —
  // তাই ফিল্টার ও গণনা এই আইডি ধরেই হয়
  providerId: game.providerId,
  icon: game.image,

  // white-label এর ব্যাজ/ফিল্টার টগল
  isHot: game.isHot,
  isFavorites: game.isFavorites,
  isLatest: game.isLatest,
  isAZ: game.isAZ,
  createdAt: game.createdAt,
});

/** এক পেজ গেম আনে — কম্পোনেন্টের বাইরে, যাতে effect থেকে ডাকলে sync setState না হয় */
const fetchGamePage = async ({ categoryId, providerId, page }) => {
  const res = await api.get(`${GAME_PROXY_API}/game-list`, {
    params: { categoryId, providerDbId: providerId, page, limit: 40 },
  });

  const payload = res?.data?.data;
  const data = payload?.configured ? payload.data : null;

  return {
    records: (data?.records || []).map(toPageShape),
    pageInfo: data?.pageInfo || null,
  };
};

/**
 * এক ক্যাটাগরি/ভেন্ডরের গেম তালিকা।
 *
 * `categoryId` না থাকলে (অর্থাৎ অ্যাডমিনে গেম API key বসানো হয়নি)
 * আগের মতোই বিল্ট-ইন স্ট্যাটিক তালিকাই ফেরত যায়, কোনো নেটওয়ার্ক কল
 * হয় না — তাই key বসার আগে পেজটা হুবহু আগের মতোই চলে।
 */
export const useGameList = ({ categoryId, providerId }) => {
  const isLive = Boolean(categoryId);
  const scopeKey = `${categoryId || ""}|${providerId || ""}`;

  const [records, setRecords] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);

  // কোন scope এর ডেটা এখন হাতে আছে — এটাই বলে দেয় লোড চলছে কিনা,
  // তাই লোডিংয়ের জন্য আলাদা setState করতে হয় না
  const [loadedScope, setLoadedScope] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // পুরোনো অনুরোধের উত্তর দেরিতে এসে নতুন তালিকা মুছে দিতে না পারে
  const requestRef = useRef(0);

  useEffect(() => {
    if (!isLive) return undefined;

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    fetchGamePage({ categoryId, providerId, page: 1 })
      .then((data) => {
        if (requestId !== requestRef.current) return;

        setRecords(data.records);
        setPageInfo(data.pageInfo);
      })
      .catch(() => {
        // তালিকা আনা না গেলে খালি থাকে — পেজ ভাঙে না
        if (requestId !== requestRef.current) return;

        setRecords([]);
        setPageInfo(null);
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoadedScope(scopeKey);
      });

    return undefined;
  }, [isLive, categoryId, providerId, scopeKey]);

  const loading = isLive && (loadedScope !== scopeKey || loadingMore);

  const loadMore = useCallback(() => {
    if (!pageInfo || loadingMore) return;
    if (pageInfo.currentPage >= pageInfo.totalPage) return;

    const requestId = requestRef.current;

    setLoadingMore(true);

    fetchGamePage({ categoryId, providerId, page: pageInfo.currentPage + 1 })
      .then((data) => {
        if (requestId !== requestRef.current) return;

        setRecords((prev) => [...prev, ...data.records]);
        setPageInfo(data.pageInfo);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [pageInfo, loadingMore, categoryId, providerId]);

  const hasMore = Boolean(pageInfo && pageInfo.currentPage < pageInfo.totalPage);

  return useMemo(() => {
    if (!isLive) {
      return {
        records: gameListPage.records,
        total: gameListPage.records.length,
        hasMore: false,
        loading: false,
        loadMore: () => {},
        isLive: false,
      };
    }

    return {
      records,
      total: pageInfo?.totalRecords || records.length,
      hasMore,
      loading,
      loadMore,
      isLive: true,
    };
  }, [isLive, records, pageInfo, hasMore, loading, loadMore]);
};

export default useGameList;
