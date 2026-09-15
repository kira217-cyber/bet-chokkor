import React from "react";
import { useNavigate } from "react-router";

/**
 * ইতিহাসের পাতাগুলোর সাধারণ অংশ।
 *
 * পাঁচটা পাতায় (গেম, টার্নওভার, অটো ডিপোজিট, ডিপোজিট, উইথড্র) একই
 * সারাংশের কার্ড, একই ইউজার-ঘর আর একই পাতা বদলানোর সারি — তাই এক
 * জায়গায়। একটা বদলালে সব জায়গায় বদলায়।
 */

/**
 * ইউজারের ঘর — নামে ক্লিক করলে তার বিস্তারিত পাতায়।
 *
 * যেকোনো ইতিহাস থেকে "এই লোকটা আসলে কে" দেখতে চাইলে আগে Users এ গিয়ে
 * খুঁজতে হতো; এখন নামটাই লিংক।
 *
 * `user` হতে পারে শুধু আইডি (lean কোয়েরি) বা populate করা অবজেক্ট —
 * দুটোই চলে। অ্যাফিলিয়েট হলে অ্যাফিলিয়েটের পাতায় যায়, কারণ দুই
 * তালিকার বিস্তারিত পাতা আলাদা।
 */
export const UserCell = ({ user, userId, sub }) => {
  const navigate = useNavigate();

  const id = String(user?._id || user || "").trim();
  const name = userId || user?.userId || "—";
  const isAffiliate = user?.role === "aff-user";

  const detail = sub ?? user?.phone ?? "";

  if (!id) {
    return (
      <div>
        <p className="text-[14px] font-semibold text-[var(--neutral100)]">
          {name}
        </p>
        {detail ? (
          <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{detail}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        title="Open user details"
        onClick={() => navigate(`/${isAffiliate ? "affiliates" : "users"}/${id}`)}
        className="cursor-pointer text-left text-[14px] font-semibold text-[var(--neutral100)] underline decoration-[var(--primary500)]/40 underline-offset-4 transition hover:text-[var(--primary500)]"
      >
        {name}
      </button>

      {detail ? (
        <p className="mt-0.5 text-[12px] text-[var(--text-muted)]">{detail}</p>
      ) : null}
    </div>
  );
};

/**
 * উপরের সারাংশের কার্ডগুলো।
 *
 * `items` এ `[label, value, tone?, sub?]` — এক নজরে মোট কত, কত গেল,
 * কত এলো। তালিকায় নামার আগেই ছবিটা পাওয়া যায়।
 */
export const SummaryCards = ({ items, columns = 4 }) => (
  <div
    className={`mb-4 grid gap-3 sm:grid-cols-2 ${
      columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
    }`}
  >
    {items.map(([label, value, tone, sub]) => (
      <div key={label} className="ad-card py-4">
        <p className="text-[13px] text-[var(--text-muted)]">{label}</p>

        <p
          className="mt-1 text-[22px] font-black"
          style={{ color: tone || "var(--text-primary)" }}
        >
          {value}
        </p>

        {sub ? (
          <p className="mt-1 text-[12px] text-[var(--text-disabled)]">{sub}</p>
        ) : null}
      </div>
    ))}
  </div>
);

/** পাতা বদলানোর সারি — একটাই পাতা হলে দেখা যায় না */
export const Pager = ({ page, totalPages, busy, onChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1 || busy}
        onClick={() => onChange(page - 1)}
        className="ad-btn ad-btn--ghost ad-btn--sm"
      >
        Previous
      </button>

      <span className="text-[13px] text-[var(--text-muted)]">
        {page} / {totalPages}
      </span>

      <button
        type="button"
        disabled={page >= totalPages || busy}
        onClick={() => onChange(page + 1)}
        className="ad-btn ad-btn--ghost ad-btn--sm"
      >
        Next
      </button>
    </div>
  );
};
