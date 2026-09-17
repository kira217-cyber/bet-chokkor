import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { BadgeCheck, Banknote, Loader2, Plus, Trash2 } from "lucide-react";

import MemberPage from "../Deposit/MemberPage";
import FormField from "../../components/FormField/FormField";
import FormAlert from "../../components/FormAlert/FormAlert";
import AmountPicker from "../../components/AmountPicker/AmountPicker";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useLanguage } from "../../Context/LanguageProvider";
import { useAlert } from "../../Context/alertContext";
import { api } from "../../api/axios";
import { authError, sendOtp } from "../../features/auth/authApi";
import { imageUrl } from "../../features/deposit/imageUrl";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import {
  addWallet,
  fetchAutoWithdrawEligibility,
  fetchAutoWithdrawStatus,
  fetchEligibility,
  fetchWallets,
  fetchWithdrawMethods,
  removeWallet,
  submitAutoWithdraw,
  submitWithdraw,
} from "../../features/withdraw/withdrawApi";

/**
 * ম্যানুয়াল ও অটো — দুই মোডে মেথডের আকার আলাদা, তাই এক রূপে আনা হয়।
 * manual: { _id, methodId, name, logoUrl, minimumWithdrawAmount, ... }
 * auto:   { code, name, logoUrl, minAmount, maxAmount }
 */
const normalizeMethods = (list, isAuto, fallbackMin, fallbackMax) =>
  (list || []).map((item) =>
    isAuto
      ? {
          id: item.code,
          name: item.name,
          logoUrl: item.logoUrl,
          min: Number(item.minAmount) || Number(fallbackMin) || 0,
          max: Number(item.maxAmount) || Number(fallbackMax) || 0,
        }
      : {
          id: item.methodId,
          name: item.name,
          logoUrl: item.logoUrl,
          min: Number(item.minimumWithdrawAmount) || 0,
          max: Number(item.maximumWithdrawAmount) || 0,
        },
  );

const num = (value) => Number(value) || 0;

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

/**
 * টাকা তোলা।
 *
 * ডিপোজিট পেজের মতোই সাজানো — উপায়ের কার্ড তিন কলামে, তারপর নিজের
 * নম্বরের সারি, তারপর অঙ্ক। বাছাই করা কার্ড/সারিতে সোনালি বর্ডার।
 *
 * চলতি টার্নওভার থাকলে ফর্মটাই দেখানো হয় না — বদলে কত বাকি আর
 * কতটুকু হয়েছে সেটা দেখানো হয়, কারণ ফর্ম ভরে জমা দেওয়ার পর "পারবেন
 * না" শোনাটা বিরক্তিকর।
 */
const Withdraw = ({ mode = "manual" }) => {
  const isAuto = mode === "auto";

  const { t, tv } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showAlert, showConfirm } = useAlert();

  const user = useSelector(selectUser);

  const [methods, setMethods] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [walletMeta, setWalletMeta] = useState({ manualCap: 0, manualCount: 0 });
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  const [methodId, setMethodId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");

  const [adding, setAdding] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  // OTP লাগলে কোন কাজটা আটকে আছে সেটা মনে রাখা হয়, যাতে কোড মেলার পর
  // ব্যবহারকারীকে আবার ফর্ম ভরতে না হয়
  const [otpFor, setOtpFor] = useState(null);
  const [maskedPhone, setMaskedPhone] = useState("");

  /**
   * OTP দরকার হলে কোড পাঠিয়ে ধাপটা খোলা।
   *
   * সার্ভার `otpNotVerified` বললে তবেই — আগেভাগে পাঠালে যাদের জন্য OTP
   * বন্ধ তাঁদেরও অকারণে SMS যেত।
   */
  const startOtp = async (task) => {
    try {
      const sent = await sendOtp({
        flow: "withdraw",
        site: "client",
        userId: user?.userId,
      });

      setMaskedPhone(sent.maskedPhone || "");
      setOtpFor(task);
      setError("");

      return true;
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
      return false;
    }
  };

  // মোড অনুযায়ী মেথড ও যোগ্যতা আনা — দুটোই এক রূপে ফেরে
  const loadMethodsAndElig = async () => {
    if (isAuto) {
      const [status, elig] = await Promise.all([
        fetchAutoWithdrawStatus(),
        fetchAutoWithdrawEligibility(),
      ]);

      return {
        methods: normalizeMethods(
          status.methods,
          true,
          status.minAmount,
          status.maxAmount,
        ),
        eligibility: elig,
      };
    }

    const [list, elig] = await Promise.all([
      fetchWithdrawMethods(),
      fetchEligibility(),
    ]);

    return { methods: normalizeMethods(list, false), eligibility: elig };
  };

  const load = async () => {
    const [{ methods: list, eligibility: elig }, walletData] = await Promise.all([
      loadMethodsAndElig(),
      fetchWallets(),
    ]);

    setMethods(list);
    setWallets(walletData.wallets);
    setWalletMeta({
      manualCap: walletData.manualCap,
      manualCount: walletData.manualCount,
    });
    setEligibility(elig);

    if (!methodId && list.length) setMethodId(list[0].id);

    if (!walletId && walletData.wallets.length) {
      const preferred =
        walletData.wallets.find((item) => item.isDefault) || walletData.wallets[0];

      setWalletId(preferred._id);
    }
  };

  useEffect(() => {
    let alive = true;

    Promise.all([
      loadMethodsAndElig(),
      fetchWallets(),
      api.get("/api/user/me").catch(() => null),
    ])
      .then(([{ methods: list, eligibility: elig }, walletData, me]) => {
        if (!alive) return;

        setMethods(list);
        setWallets(walletData.wallets);
        setWalletMeta({
          manualCap: walletData.manualCap,
          manualCount: walletData.manualCount,
        });
        setEligibility(elig);

        if (list.length) setMethodId(list[0].id);

        if (walletData.wallets.length) {
          const preferred =
            walletData.wallets.find((item) => item.isDefault) ||
            walletData.wallets[0];

          setWalletId(preferred._id);
        }

        // ব্যালেন্সটা তাজা করে নেওয়া — পুরোনো অঙ্ক দেখে আবেদন করলে
        // সার্ভারে গিয়ে আটকে যেত
        if (me?.data?.data?.user) dispatch(updateUser(me.data.data.user));
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, isAuto]);

  const method = methods.find((item) => item.id === methodId) || null;

  const balance = num(user?.balance);
  const min = num(method?.min);
  const max = num(method?.max);

  const value = num(amount);

  const amountOk =
    value > 0 &&
    value <= balance &&
    (min <= 0 || value >= min) &&
    (max <= 0 || value <= max);

  const canSubmit = Boolean(method && walletId) && amountOk && !busy;

  const handleAddNumber = async (event) => {
    event.preventDefault();

    try {
      setBusy("wallet");
      setError("");

      await addWallet({ walletNumber: newNumber, label: newLabel });

      setNewNumber("");
      setNewLabel("");
      setAdding(false);
      setOtpFor(null);

      await load();
    } catch (err) {
      if (err?.response?.data?.code === "otpNotVerified") {
        await startOtp("wallet");
        return;
      }

      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy("");
    }
  };

  const handleRemove = async (wallet) => {
    const yes = await showConfirm({
      title: t("removeNumber"),
      message: wallet.walletNumber,
    });

    if (!yes) return;

    try {
      setBusy(wallet._id);
      await removeWallet(wallet._id);

      if (walletId === wallet._id) setWalletId("");

      await load();
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) return;

    try {
      setBusy("submit");
      setError("");

      if (isAuto) {
        // অটো — গেটওয়েতে সরাসরি; প্রাপক নম্বর বাছাই করা ওয়ালেট থেকে
        const wallet = wallets.find((item) => item._id === walletId);
        const accountNumber = wallet ? `0${wallet.walletNumber}` : "";

        const data = await submitAutoWithdraw({
          paymentMethod: methodId,
          accountNumber,
          amount: value,
        });

        if (data?.balance !== undefined) {
          dispatch(updateUser({ ...user, balance: data.balance }));
        }
      } else {
        await submitWithdraw({ methodId, walletId, amount: value });
      }

      setOtpFor(null);

      await showAlert({
        type: "success",
        title: t("withdrawDone"),
        message: isAuto ? t("autoWithdrawDoneText") : t("withdrawDoneText"),
      });

      navigate("/member/profile", { replace: true });
    } catch (err) {
      if (err?.response?.data?.code === "otpNotVerified") {
        await startOtp("withdraw");
        return;
      }

      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy("");
    }
  };

  /** কোড মিলে গেলে আটকে থাকা কাজটাই আবার চালানো */
  const handleVerified = () => {
    const task = otpFor;

    setOtpFor(null);

    if (task === "wallet") handleAddNumber({ preventDefault: () => {} });
    else handleSubmit({ preventDefault: () => {} });
  };

  /* ── এখনো তোলা যাবে না ── */
  const blocked = eligibility && !eligibility.eligible;
  const pageTitle = isAuto ? t("autoWithdraw") : t("withdrawTitle");

  if (otpFor) {
    return (
      <MemberPage title={pageTitle} onBack={() => setOtpFor(null)}>
        <OtpStep
          flow="withdraw"
          userId={user?.userId}
          maskedPhone={maskedPhone}
          onVerified={handleVerified}
        />
      </MemberPage>
    );
  }

  return (
    <MemberPage
      title={pageTitle}
      maxWidth="820px"
      onBack={() => navigate("/member/wallet/withdraw")}
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
      ) : blocked ? (
        <div className="flex flex-col" style={{ gap: "calc(var(--u) * 3.2)" }}>
          {/*
            * পরিচয় যাচাই আটকালে আলাদা কার্ড — শুধু "পারবেন না" বললে
            * কোথায় গিয়ে কী করতে হবে বোঝা যেত না, তাই সরাসরি যাওয়ার
            * বোতামও থাকে।
            */}
          {eligibility.reason === "verification" ? (
            <div
              className="flex flex-col items-center text-center"
              style={{
                borderRadius: "var(--radius-10)",
                background: "var(--neutral900)",
                padding: "calc(var(--u) * 6.4) calc(var(--u) * 4.267)",
                gap: "calc(var(--u) * 3.2)",
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  height: "calc(var(--u) * 18.133)",
                  width: "calc(var(--u) * 18.133)",
                  background:
                    "color-mix(in srgb, var(--status-pending), transparent 88%)",
                  color: "var(--status-pending)",
                }}
              >
                <BadgeCheck size={34} />
              </span>

              <p
                className="font-bold text-[var(--neutral100)]"
                style={{ fontSize: "var(--fs-body)" }}
              >
                {eligibility.verificationStatus === "pending"
                  ? t("verifyPendingTitle")
                  : t("withdrawNeedVerifyTitle")}
              </p>

              <p
                className="leading-relaxed text-[var(--text-secondary)]"
                style={{ fontSize: "var(--fs-larger)" }}
              >
                {eligibility.verificationStatus === "pending"
                  ? t("verifyPendingText")
                  : t("withdrawNeedVerifyText")}
              </p>

              {eligibility.verificationStatus !== "pending" ? (
                <button
                  type="button"
                  onClick={() => navigate("/member/verification")}
                  className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] hover:brightness-105"
                  style={{
                    height: "calc(var(--u) * 11.2)",
                    borderRadius: "var(--radius-10)",
                    fontSize: "var(--fs-larger)",
                    backgroundColor: "var(--primary500)",
                    color: "var(--neutral900)",
                  }}
                >
                  {t("goToVerification")}
                </button>
              ) : null}
            </div>
          ) : (
            <FormAlert type="warning">
              {eligibility.reason === "pendingWithdraw"
                ? `${t("pendingWithdrawTitle")} — ${t("pendingWithdrawText")}`
                : `${t("turnoverLeftTitle")} — ${t("turnoverLeftText")} ${eligibility.remaining}`}
            </FormAlert>
          )}

          {/* চলতি শর্তগুলোর অগ্রগতি */}
          {(eligibility.turnovers || []).map((item, index) => (
            <div
              key={index}
              className="bg-[var(--neutral900)]"
              style={{
                borderRadius: "var(--radius-10)",
                padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
              }}
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="text-[var(--text-secondary)]"
                  style={{ fontSize: "var(--fs-larger)" }}
                >
                  {item.title}
                </span>

                <span
                  className="text-[var(--text-primary)]"
                  style={{ fontSize: "var(--fs-small)" }}
                >
                  {item.progress} / {item.required}
                </span>
              </div>

              <div
                className="mt-2 overflow-hidden bg-[var(--neutral700)]"
                style={{
                  height: "calc(var(--u) * 1.6)",
                  borderRadius: "var(--radius-10)",
                }}
              >
                <div
                  className="h-full bg-[var(--primary500)]"
                  style={{ width: `${item.percent || 0}%` }}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] hover:brightness-105"
            style={{
              height: "calc(var(--u) * 13.333)",
              borderRadius: "var(--radius-10)",
              fontSize: "var(--fs-larger)",
              backgroundColor: "var(--primary500)",
              color: "var(--btn-primary-txt)",
            }}
          >
            {t("backToHome")}
          </button>
        </div>
      ) : methods.length === 0 ? (
        <FormAlert type="info">
          {isAuto ? t("autoWithdrawOffNow") : t("noWithdrawMethod")}
        </FormAlert>
      ) : (
        <form
          className="flex flex-col"
          onSubmit={handleSubmit}
          style={{ gap: 0 }}
        >
          <FormAlert>{error}</FormAlert>

          {/* ── উপায় ── */}
          <SectionLabel>{t("selectWithdrawMethod")}</SectionLabel>

          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "calc(var(--u) * 2.133)",
            }}
          >
            {methods.map((item) => {
              const active = item.id === methodId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMethodId(item.id)}
                  className="dep-card flex cursor-pointer flex-col items-center justify-center bg-[var(--neutral800)] transition-colors"
                  style={{
                    borderRadius: "var(--radius-10)",
                    border: `1px solid ${
                      active ? "var(--primary500)" : "transparent"
                    }`,
                  }}
                >
                  {item.logoUrl ? (
                    <img
                      src={imageUrl(item.logoUrl)}
                      alt=""
                      className="dep-logo object-contain"
                      draggable="false"
                    />
                  ) : (
                    <span className="dep-logo dep-label flex items-center justify-center rounded-full bg-[var(--neutral700)] font-bold text-[var(--primary500)]">
                      {(tv(item.name) || item.id).slice(0, 2).toUpperCase()}
                    </span>
                  )}

                  <span className="dep-label px-1 text-center leading-tight text-[var(--text-primary)]">
                    {tv(item.name) || item.id}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── নিজের নম্বর ── */}
          <SectionLabel>{t("selectWallet")}</SectionLabel>

          <div className="flex flex-col" style={{ gap: "calc(var(--u) * 2.133)" }}>
            {wallets.map((wallet) => {
              const active = wallet._id === walletId;

              return (
                <div
                  key={wallet._id}
                  className="dep-row flex w-full items-center bg-[var(--neutral800)] transition-colors"
                  style={{
                    borderRadius: "var(--radius-10)",
                    paddingInline: "calc(var(--u) * 4.267)",
                    border: `1px solid ${
                      active ? "var(--primary500)" : "transparent"
                    }`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setWalletId(wallet._id)}
                    className="flex min-w-0 flex-1 cursor-pointer items-center text-start"
                    style={{ gap: "calc(var(--u) * 3.2)" }}
                  >
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

                    <span className="flex min-w-0 flex-col">
                      <span
                        className="font-semibold text-[var(--neutral100)]"
                        style={{ fontSize: "var(--fs-larger)" }}
                      >
                        0{wallet.walletNumber}
                      </span>

                      <span
                        className="truncate text-[var(--text-disabled)]"
                        style={{ fontSize: "var(--fs-small)" }}
                      >
                        {wallet.isAutoRegistration
                          ? t("registrationNumber")
                          : wallet.label}
                      </span>
                    </span>
                  </button>

                  {/* রেজিস্ট্রেশনের নম্বরটা সরানো যায় না */}
                  {!wallet.isAutoRegistration && (
                    <button
                      type="button"
                      onClick={() => handleRemove(wallet)}
                      disabled={busy === wallet._id}
                      aria-label={t("removeNumber")}
                      className="shrink-0 cursor-pointer text-[var(--text-disabled)] transition-colors hover:text-[var(--status-danger)]"
                    >
                      {busy === wallet._id ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}

            {adding ? (
              <div
                className="bg-[var(--neutral900)]"
                style={{
                  borderRadius: "var(--radius-10)",
                  padding: "calc(var(--u) * 3.2) calc(var(--u) * 4.267)",
                }}
              >
                <div
                  className="flex flex-col"
                  style={{ gap: "calc(var(--u) * 2.667)" }}
                >
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={newNumber}
                    onChange={(event) =>
                      setNewNumber(event.target.value.replace(/\D/g, ""))
                    }
                    placeholder={t("numberPlaceholder")}
                    className="w-full bg-[var(--form-box-bg)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                    style={{
                      height: "calc(var(--u) * 12)",
                      borderRadius: "var(--radius-10)",
                      paddingInline: "calc(var(--u) * 4.267)",
                      fontSize: "var(--fs-larger)",
                    }}
                  />

                  <input
                    type="text"
                    value={newLabel}
                    onChange={(event) => setNewLabel(event.target.value)}
                    placeholder={t("numberLabel")}
                    className="w-full bg-[var(--form-box-bg)] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                    style={{
                      height: "calc(var(--u) * 12)",
                      borderRadius: "var(--radius-10)",
                      paddingInline: "calc(var(--u) * 4.267)",
                      fontSize: "var(--fs-larger)",
                    }}
                  />

                  <div className="flex" style={{ gap: "calc(var(--u) * 2.133)" }}>
                    <button
                      type="button"
                      onClick={handleAddNumber}
                      disabled={newNumber.length < 10 || Boolean(busy)}
                      className="flex flex-1 cursor-pointer items-center justify-center font-bold disabled:cursor-not-allowed"
                      style={{
                        height: "calc(var(--u) * 12)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                        backgroundColor:
                          newNumber.length >= 10 && !busy
                            ? "var(--primary500)"
                            : "color-mix(in srgb, var(--primary500), black 40%)",
                        color: "var(--btn-primary-txt)",
                      }}
                    >
                      {busy === "wallet" ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        t("addNumber")
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdding(false)}
                      className="flex flex-1 cursor-pointer items-center justify-center bg-[var(--neutral800)] font-semibold text-[var(--text-secondary)]"
                      style={{
                        height: "calc(var(--u) * 12)",
                        borderRadius: "var(--radius-10)",
                        fontSize: "var(--fs-larger)",
                      }}
                    >
                      {t("close")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              walletMeta.manualCount < walletMeta.manualCap && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="flex w-full cursor-pointer items-center justify-center border border-dashed font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--neutral100)]"
                  style={{
                    height: "calc(var(--u) * 12)",
                    borderRadius: "var(--radius-10)",
                    borderColor: "var(--neutral600)",
                    fontSize: "var(--fs-larger)",
                    gap: "calc(var(--u) * 2.133)",
                  }}
                >
                  <Plus size={15} />
                  {t("addNumber")}
                </button>
              )
            )}
          </div>

          {/* ── অঙ্ক ── */}
          <SectionLabel>{t("withdrawAmount")}</SectionLabel>

          <FormField
            error={
              value > 0 && !amountOk
                ? value > balance
                  ? t("errLowBalance")
                  : `${t("minMax")}: ${min} / ${max}`
                : ""
            }
          >
            <AmountPicker
              value={amount}
              onChange={setAmount}
              placeholder={t("amountPlaceholder")}
              currency={user?.currency || "BDT"}
              min={min}
              /* ব্যালেন্সের বেশি অঙ্কের বোতাম দেখিয়ে লাভ নেই */
              max={Math.min(max || balance, balance)}
            />
          </FormField>

          <div
            className="flex items-baseline justify-between"
            style={{ marginTop: "calc(var(--u) * 2.133)" }}
          >
            <span
              className="text-[var(--text-secondary)]"
              style={{ fontSize: "var(--fs-larger)" }}
            >
              {t("availableBalance")}
            </span>

            <span
              className="font-bold text-[var(--primary500)]"
              style={{ fontSize: "var(--fs-h5)" }}
            >
              {user?.currency || "BDT"} {balance.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="dep-btn flex w-full cursor-pointer items-center justify-center font-bold transition-[filter] enabled:hover:brightness-105 disabled:cursor-not-allowed"
            style={{
              marginTop: "calc(var(--u) * 6.4)",
              borderRadius: "var(--radius-10)",
              gap: "calc(var(--u) * 2.133)",
              backgroundColor: canSubmit
                ? "var(--primary500)"
                : "color-mix(in srgb, var(--primary500), black 40%)",
              color: "var(--btn-primary-txt)",
            }}
          >
            {busy === "submit" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Banknote size={16} />
            )}
            {t("withdrawNow")}
          </button>
        </form>
      )}
    </MemberPage>
  );
};

export default Withdraw;
