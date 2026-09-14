import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronDown, Gift, Loader2 } from "lucide-react";

import MemberPage from "./MemberPage";
import DepositForm from "./DepositForm";
import FormAlert from "../../components/FormAlert/FormAlert";
import { useLanguage } from "../../Context/LanguageProvider";
import { GROUPS, fetchDepositMethods } from "../../features/deposit/depositApi";

/** ছোট ধূসর লেবেল — প্রতিটা অংশের মাথায় */
const SectionLabel = ({ children }) => (
  <p
    className="text-[var(--text-secondary)]"
    style={{
      fontSize: "var(--fs-larger)",
      marginTop: "calc(var(--u) * 4.267)",
      marginBottom: "calc(var(--u) * 2.133)",
    }}
  >
    {children}
  </p>
);

const boxStyle = {
  borderRadius: "var(--radius-10)",
  paddingInline: "calc(var(--u) * 4.267)",
};

/**
 * একটা ভাগের ভিতরের পর্দা — প্রমোশন, উপায়, চ্যানেল আর নম্বর বেছে নেওয়া।
 *
 * মূল সাইট থেকে মাপা: প্রমোশনের সারি ১৬u উঁচু, উপায়ের কার্ড তিন কলামে
 * (কার্ড ১৮.৬৭u উঁচু, মাঝে ২.১৩৩u ফাঁক), চ্যানেলের সারি ১৪.৬৭u,
 * বাছাই করা কার্ড/সারিতে সোনালি বর্ডার, নিচে পুরো চওড়া
 * "চালিয়ে যান" বাটন ১৩.৩৩u।
 *
 * সব বাছাই শেষ হলে একই পর্দাতেই টাকার অঙ্কের ধাপটা খোলে।
 */
const DepositGroup = () => {
  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const { group } = useParams();

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [methodId, setMethodId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [promoId, setPromoId] = useState("none");
  const [contactId, setContactId] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let alive = true;

    fetchDepositMethods()
      .then((list) => alive && setMethods(list))
      .catch(() => alive && setMethods([]))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, []);

  const inGroup = useMemo(
    () => methods.filter((item) => item.group === group),
    [methods, group],
  );

  const method = inGroup.find((item) => item._id === methodId) || null;
  const channels = method?.channels || [];
  const promotions = method?.promotions || [];
  const contacts = method?.contacts || [];

  const channel = channels.find((item) => item.id === channelId) || null;
  const promo = promotions.find((item) => item.id === promoId) || null;
  const contact = contacts.find((item) => item.id === contactId) || contacts[0] || null;

  /** উপায় বদলালে আগের চ্যানেল/প্রোমো/নম্বর আর মেলে না */
  const pickMethod = (next) => {
    setMethodId(next._id);
    setChannelId(next.channels?.[0]?.id || "");
    setPromoId("none");
    setContactId(next.contacts?.[0]?.id || "");
  };

  const groupLabel =
    GROUPS.find((item) => item.key === group)?.labelKey || "deposit";

  const canContinue = Boolean(method && channel);

  if (showForm && method && channel) {
    return (
      <DepositForm
        method={method}
        channel={channel}
        promo={promo}
        contact={contact}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <MemberPage
      title={t(groupLabel)}
      onBack={() => navigate("/member/wallet/deposit")}
    >
      {loading ? (
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
      ) : inGroup.length === 0 ? (
        <FormAlert type="info">{t("noMethodYet")}</FormAlert>
      ) : (
        <>
          {/* ── প্রমোশন ── */}
          {promotions.length > 0 && (
            <>
              <SectionLabel>{t("selectPromotion")}</SectionLabel>

              <div
                className="flex w-full items-center justify-between bg-[var(--neutral800)]"
                style={{ ...boxStyle, height: "calc(var(--u) * 16)" }}
              >
                <span
                  className="flex items-center font-semibold text-[var(--neutral100)]"
                  style={{
                    gap: "calc(var(--u) * 2.133)",
                    fontSize: "var(--fs-larger)",
                  }}
                >
                  <Gift size={16} className="text-[var(--primary500)]" />
                  {t("promotionLabel")}
                </span>

                <span className="relative flex items-center">
                  <select
                    value={promoId}
                    onChange={(event) => setPromoId(event.target.value)}
                    className="cursor-pointer appearance-none bg-transparent text-right text-[var(--primary500)] outline-none"
                    style={{
                      fontSize: "var(--fs-larger)",
                      paddingInlineEnd: "calc(var(--u) * 5.333)",
                    }}
                  >
                    <option value="none">{t("noPromotion")}</option>
                    {promotions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {tv(item.name) || item.id}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute end-0 text-[var(--text-disabled)]"
                  />
                </span>
              </div>
            </>
          )}

          {/* ── উপায় ── */}
          <SectionLabel>{t("selectPayment")}</SectionLabel>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "calc(var(--u) * 2.133)",
            }}
          >
            {inGroup.map((item) => {
              const active = item._id === methodId;

              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => pickMethod(item)}
                  className="flex cursor-pointer flex-col items-center justify-center bg-[var(--neutral800)] transition-colors"
                  style={{
                    height: "calc(var(--u) * 18.667)",
                    borderRadius: "var(--radius-10)",
                    gap: "calc(var(--u) * 1.6)",
                    border: `1px solid ${
                      active ? "var(--primary500)" : "transparent"
                    }`,
                  }}
                >
                  {item.logoUrl ? (
                    <img
                      src={item.logoUrl}
                      alt=""
                      className="object-contain"
                      style={{
                        height: "calc(var(--u) * 7.467)",
                        width: "calc(var(--u) * 7.467)",
                      }}
                      draggable="false"
                    />
                  ) : (
                    <span
                      className="flex items-center justify-center rounded-full bg-[var(--neutral700)] font-bold text-[var(--primary500)]"
                      style={{
                        height: "calc(var(--u) * 7.467)",
                        width: "calc(var(--u) * 7.467)",
                        fontSize: "var(--fs-small)",
                      }}
                    >
                      {(tv(item.methodName) || item.methodId)
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  )}

                  <span
                    className="text-center leading-tight text-[var(--text-primary)]"
                    style={{ fontSize: "var(--fs-larger)" }}
                  >
                    {tv(item.methodName) || item.methodId}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── চ্যানেল ── */}
          {channels.length > 0 && (
            <>
              <SectionLabel>{t("selectChannel")}</SectionLabel>

              <div
                className="flex flex-col"
                style={{ gap: "calc(var(--u) * 2.133)" }}
              >
                {channels.map((item) => {
                  const active = item.id === channelId;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setChannelId(item.id)}
                      className="flex w-full cursor-pointer items-center justify-between bg-[var(--neutral800)] transition-colors"
                      style={{
                        ...boxStyle,
                        height: "calc(var(--u) * 14.667)",
                        border: `1px solid ${
                          active ? "var(--primary500)" : "transparent"
                        }`,
                      }}
                    >
                      <span
                        className="flex items-center font-semibold text-[var(--neutral100)]"
                        style={{
                          gap: "calc(var(--u) * 2.133)",
                          fontSize: "var(--fs-larger)",
                        }}
                      >
                        {tv(item.name) || item.id}

                        {item.tagText && item.tagText !== "+0%" && (
                          <span
                            className="text-[var(--primary500)]"
                            style={{ fontSize: "var(--fs-small)" }}
                          >
                            {item.tagText}
                          </span>
                        )}
                      </span>

                      {/* বাছাই করা চ্যানেলে ভরাট সোনালি বৃত্ত */}
                      <span
                        className="flex shrink-0 items-center justify-center rounded-full"
                        style={{
                          height: "calc(var(--u) * 5.333)",
                          width: "calc(var(--u) * 5.333)",
                          border: `1px solid ${
                            active ? "var(--primary500)" : "var(--neutral600)"
                          }`,
                          background: active ? "var(--primary500)" : "transparent",
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── নম্বর ── */}
          {contacts.length > 1 && (
            <>
              <SectionLabel>{t("depositChannel")}</SectionLabel>

              <div
                className="relative flex w-full items-center bg-[var(--neutral900)]"
                style={{ ...boxStyle, height: "calc(var(--u) * 13.867)" }}
              >
                <select
                  value={contact?.id || ""}
                  onChange={(event) => setContactId(event.target.value)}
                  className="w-full cursor-pointer appearance-none bg-transparent text-[var(--text-primary)] outline-none"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {contacts.map((item) => (
                    <option key={item.id} value={item.id}>
                      {tv(item.label) || item.number}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute text-[var(--text-disabled)]"
                  style={{ insetInlineEnd: "calc(var(--u) * 4.267)" }}
                />
              </div>
            </>
          )}

          <button
            type="button"
            disabled={!canContinue}
            onClick={() => setShowForm(true)}
            className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
            style={{
              marginTop: "calc(var(--u) * 6.4)",
              height: "calc(var(--u) * 13.333)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
              backgroundColor: canContinue
                ? "var(--primary500)"
                : "color-mix(in srgb, var(--primary500), black 40%)",
              color: "var(--btn-primary-txt)",
            }}
          >
            {t("continue")}
          </button>
        </>
      )}
    </MemberPage>
  );
};

export default DepositGroup;
