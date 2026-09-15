import React, { useEffect, useState } from "react";
import { Inbox, Loader2 } from "lucide-react";

import { useLanguage } from "../../Context/LanguageProvider";

/**
 * ইতিহাসের একটা তালিকা।
 *
 * তিনটে ইতিহাস পাতাই (ট্রানজেকশন, বেটিং, টার্নওভার) এটাই ব্যবহার করে —
 * শুধু কোন এন্ডপয়েন্ট আর প্রতিটা সারি কীভাবে আঁকা হবে সেটা বলে দিতে
 * হয়। ফলে তিন জায়গায় একই খালি-অবস্থা, লোডিং আর ট্যাবের কোড লিখতে
 * হয় না।
 *
 * লোডিং আলাদা state নয় — শেষ যে ফলটা এসেছে সেটা এখনকার ফিল্টারের
 * কিনা তা মিলিয়েই বের করা হয়। ফলে ট্যাব বদলালে পুরোনো তালিকা এক ঝলক
 * দেখা যায় না, আর অকারণ রি-রেন্ডারও হয় না।
 *
 * মূল সাইটের member পাতাগুলোর মতোই — সারি bg neutral800, radius
 * --radius-10, ভিতরে দুপাশে ৪.২৬৭u, মাঝে ২.১৩৩u ফাঁক।
 */
const HistoryList = ({ load, renderRow, deps = [], emptyText }) => {
  const { t } = useLanguage();

  const key = JSON.stringify(deps);
  const [result, setResult] = useState({ key: null, rows: [] });

  useEffect(() => {
    let alive = true;

    load()
      .then(
        (list) =>
          alive && setResult({ key, rows: Array.isArray(list) ? list : [] }),
      )
      .catch(() => alive && setResult({ key, rows: [] }));

    return () => {
      alive = false;
    };
    // load প্রতিবার নতুন ফাংশন হয়ে আসে, তাই ফিল্টারের key ই নির্ভরতা
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (result.key !== key) {
    return (
      <div
        className="flex items-center justify-center text-[var(--text-muted)]"
        style={{
          gap: "calc(var(--u) * 2.133)",
          paddingBlock: "calc(var(--u) * 10.667)",
        }}
      >
        <Loader2 size={18} className="animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (!result.rows.length) {
    return (
      <div
        className="flex flex-col items-center text-center"
        style={{
          gap: "calc(var(--u) * 3.2)",
          paddingBlock: "calc(var(--u) * 10.667)",
        }}
      >
        <Inbox size={28} className="text-[var(--text-disabled)]" />
        <p
          className="text-[var(--text-secondary)]"
          style={{ fontSize: "var(--fs-larger)" }}
        >
          {emptyText || t("nothingYet")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: "calc(var(--u) * 2.133)" }}>
      {result.rows.map((row, index) => (
        <div
          key={row._id || index}
          className="bg-[var(--neutral800)]"
          style={{
            borderRadius: "var(--radius-10)",
            padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
          }}
        >
          {renderRow(row)}
        </div>
      ))}
    </div>
  );
};

export default HistoryList;
