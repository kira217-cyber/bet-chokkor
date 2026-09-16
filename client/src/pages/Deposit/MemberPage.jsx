import React from "react";
import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";

/**
 * member পেজগুলোর খোলস — ব্যাক বাটন, টাইটেল আর কেন্দ্রীভূত কলাম।
 *
 * `maxWidth` দিয়ে কলামটা চওড়া করা যায় — ইতিহাসের পাতাগুলোয় সারি
 * অনেক, ৬১৮px এ ল্যাপটপের দুপাশ ফাঁকা পড়ে থাকত।
 *
 * মূল সাইট থেকে মাপা: ডেস্কটপে কলাম ৬১৮px কেন্দ্রীভূত, ব্যাক বাটন
 * ৯.০৬৭u বর্গ (bg neutral800, radius --radius-10), টাইটেল ৫.৩৩৩u/৬০০।
 * মোবাইলে কলামটা পুরো চওড়া, দুপাশে ৪.২৬৭u ফাঁক।
 */
const MemberPage = ({ title, onBack, children, footer, maxWidth = "618px" }) => {
  const navigate = useNavigate();

  return (
    <div
      className="mx-auto flex w-full flex-col"
      style={{
        maxWidth,
        paddingInline: "calc(var(--u) * 4.267)",
        paddingBottom: "calc(var(--u) * 6.4)",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: "calc(var(--u) * 4.267)",
          paddingBlock: "calc(var(--u) * 6.4)",
        }}
      >
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          aria-label="back"
          className="flex shrink-0 cursor-pointer items-center justify-center bg-[var(--neutral800)] text-[var(--text-primary)] transition-colors hover:bg-[var(--neutral700)]"
          style={{
            height: "calc(var(--u) * 9.067)",
            width: "calc(var(--u) * 9.067)",
            borderRadius: "var(--radius-10)",
          }}
        >
          <ChevronLeft size={16} />
        </button>

        <h1
          className="font-semibold text-[var(--neutral100)]"
          style={{ fontSize: "calc(var(--u) * 5.333)" }}
        >
          {title}
        </h1>
      </div>

      {children}

      {footer}
    </div>
  );
};

export default MemberPage;
