import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Power, Save, Shuffle, X } from "lucide-react";

import { api } from "../../api/axios";

const money = (value) => Number(value || 0).toFixed(2);

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4 py-1">
    <span className="text-[13px] text-[var(--text-muted)]">{label}</span>
    <span className="break-all text-right text-[14px] font-semibold text-[var(--neutral100)]">
      {children}
    </span>
  </div>
);

const draftFrom = (user) => ({
  userId: user.userId || "",
  phone: user.phone || "",
  email: user.email || "",
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  password: "",
  referCommission: String(user.referCommission ?? 0),
  depositCommission: String(user.depositCommission ?? 0),
  gameWinCommission: String(user.gameWinCommission ?? 0),
  gameLossCommission: String(user.gameLossCommission ?? 0),
});

const fetchDetail = async (kind, id) => {
  const { data } = await api.get(`/api/admin/manage/${kind}/${id}`);
  return data?.data || null;
};

/**
 * একজনের পুরো তথ্য — খুললে সার্ভার থেকে বিস্তারিত আনা হয়।
 *
 * তালিকায় সবার সব তথ্য না এনে খোলার সময় একজনেরটা আনা হয়, তাতে
 * হাজারখানেক অ্যাকাউন্ট থাকলেও তালিকাটা হালকা থাকে।
 */
const UserDrawer = ({ kind, user, onClose, onChanged }) => {
  const isAffiliate = kind === "affiliates";

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [draft, setDraft] = useState(draftFrom(user));

  useEffect(() => {
    let alive = true;

    fetchDetail(kind, user._id)
      .then((data) => {
        if (!alive || !data) return;

        setDetail(data);
        setDraft(draftFrom(data.user));
      })
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load"),
      )
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [kind, user._id]);

  const current = detail?.user || user;

  const set = (key) => (event) =>
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));

  const run = async (action, request) => {
    try {
      setBusy(action);
      const { data } = await request();

      toast.success(data?.message || "Done");
      onChanged();

      const fresh = await fetchDetail(kind, user._id);

      if (fresh) {
        setDetail(fresh);
        setDraft(draftFrom(fresh.user));
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Request failed");
    } finally {
      setBusy("");
    }
  };

  const handleSave = (event) => {
    event.preventDefault();

    run("save", () =>
      api.patch(`/api/admin/manage/${user._id}`, {
        userId: draft.userId,
        phone: draft.phone,
        email: draft.email,
        firstName: draft.firstName,
        lastName: draft.lastName,
        // খালি পাঠালে পাসওয়ার্ড আগেরটাই থাকে
        ...(draft.password ? { password: draft.password } : {}),
        ...(isAffiliate
          ? {
              referCommission: Number(draft.referCommission) || 0,
              depositCommission: Number(draft.depositCommission) || 0,
              gameWinCommission: Number(draft.gameWinCommission) || 0,
              gameLossCommission: Number(draft.gameLossCommission) || 0,
            }
          : {}),
      }),
    );
  };

  const due =
    Number(current.referCommissionBalance || 0) +
    Number(current.depositCommissionBalance || 0) +
    Number(current.gameLossCommissionBalance || 0) -
    Number(current.gameWinCommissionBalance || 0);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="ad-card max-h-[88vh] w-full max-w-[620px] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[var(--neutral100)]">
              {current.userId}
            </h2>
            <p className="text-[13px] text-[var(--text-muted)]">
              {isAffiliate ? "Affiliate" : "Player"} · joined{" "}
              {new Date(current.createdAt).toLocaleDateString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ad-btn ad-btn--ghost ad-btn--sm"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── এক নজরে ── */}
        <div className="rounded-[14px] border border-white/[0.07] p-4">
          <Row label="Balance">{money(current.balance)} {current.currency}</Row>
          <Row label="Phone">{current.countryCode} {current.phone}</Row>
          {current.email && <Row label="Email">{current.email}</Row>}
          <Row label="Referral code">{current.referralCode || "—"}</Row>
          <Row label="Referred by">{current.referredBy?.userId || "—"}</Row>
          {isAffiliate && <Row label="Referrals">{current.referralCount || 0}</Row>}

          {loading ? (
            <p className="mt-2 flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
              <Loader2 size={14} className="animate-spin" />
              Loading history…
            </p>
          ) : (
            <>
              <Row label="Approved deposits">
                {detail?.summary?.depositCount || 0} ·{" "}
                {money(detail?.summary?.depositTotal)}
              </Row>
              <Row label="Running turnovers">
                {(detail?.turnovers || []).filter((t) => t.status === "running").length}
              </Row>
            </>
          )}

          {isAffiliate && (
            <div className="mt-3 border-t border-white/[0.07] pt-3">
              <Row label="Refer commission">
                {money(current.referCommissionBalance)}
              </Row>
              <Row label="Deposit commission">
                {money(current.depositCommissionBalance)}
              </Row>
              <Row label="Game loss commission">
                {money(current.gameLossCommissionBalance)}
              </Row>
              <Row label="Game win share (owed)">
                {Number(current.gameWinCommissionBalance) > 0 ? "−" : ""}
                {money(current.gameWinCommissionBalance)}
              </Row>
              <Row label="Net due">
                <span
                  style={{
                    color:
                      due > 0
                        ? "var(--status-success)"
                        : due < 0
                          ? "var(--status-danger)"
                          : "var(--text-muted)",
                  }}
                >
                  {money(due)}
                </span>
              </Row>
            </div>
          )}
        </div>

        {/* ── কাজ ── */}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() =>
              run("status", () =>
                api.patch(`/api/admin/manage/${user._id}/status`, {
                  isActive: current.isActive === false,
                }),
              )
            }
            className={`ad-btn ad-btn--sm ${
              current.isActive === false ? "ad-btn--primary" : "ad-btn--danger"
            }`}
          >
            {busy === "status" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Power size={15} />
            )}
            {current.isActive === false ? "Activate" : "Disable"}
          </button>

          <button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => {
              const next = isAffiliate ? "user" : "aff-user";

              if (
                !window.confirm(
                  `Make ${current.userId} ${
                    next === "aff-user" ? "an affiliate" : "a normal player"
                  }?`,
                )
              ) {
                return;
              }

              run("role", () =>
                api.patch(`/api/admin/manage/${user._id}/role`, { role: next }),
              );
            }}
            className="ad-btn ad-btn--ghost ad-btn--sm"
          >
            {busy === "role" ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Shuffle size={15} />
            )}
            {isAffiliate ? "Make normal player" : "Make affiliate"}
          </button>
        </div>

        {/* ── সম্পাদনা ── */}
        <form onSubmit={handleSave} className="mt-4 flex flex-col gap-4">
          <h3 className="text-[15px] font-extrabold text-[var(--neutral100)]">
            Edit details
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="ad-label" htmlFor="ud-userId">
                Username
              </label>
              <input
                id="ud-userId"
                value={draft.userId}
                onChange={set("userId")}
                className="ad-input"
              />
            </div>

            <div>
              <label className="ad-label" htmlFor="ud-phone">
                Phone
              </label>
              <input
                id="ud-phone"
                value={draft.phone}
                onChange={set("phone")}
                className="ad-input"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="ad-label" htmlFor="ud-first">
                First name
              </label>
              <input
                id="ud-first"
                value={draft.firstName}
                onChange={set("firstName")}
                className="ad-input"
              />
            </div>

            <div>
              <label className="ad-label" htmlFor="ud-last">
                Last name
              </label>
              <input
                id="ud-last"
                value={draft.lastName}
                onChange={set("lastName")}
                className="ad-input"
              />
            </div>

            <div>
              <label className="ad-label" htmlFor="ud-email">
                Email
              </label>
              <input
                id="ud-email"
                value={draft.email}
                onChange={set("email")}
                className="ad-input"
              />
            </div>
          </div>

          {isAffiliate && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["referCommission", "Refer %"],
                ["depositCommission", "Deposit %"],
                ["gameWinCommission", "Game win %"],
                ["gameLossCommission", "Game loss %"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="ad-label" htmlFor={`ud-${key}`}>
                    {label}
                  </label>
                  <input
                    id={`ud-${key}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={draft[key]}
                    onChange={set(key)}
                    className="ad-input"
                  />
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="ad-label" htmlFor="ud-password">
              New password
            </label>
            <input
              id="ud-password"
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep the current one"
              value={draft.password}
              onChange={set("password")}
              className="ad-input"
            />
          </div>

          <button
            type="submit"
            disabled={Boolean(busy)}
            className="ad-btn ad-btn--primary w-full sm:w-auto"
          >
            {busy === "save" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save
          </button>

          <p className="text-[12px] text-[var(--text-disabled)]">
            Balance is not edited here — money moves through Manual Deposit, so
            every change leaves a record.
          </p>
        </form>
      </div>
    </div>
  );
};

export default UserDrawer;
