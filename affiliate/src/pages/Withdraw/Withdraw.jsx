import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BanknoteArrowDown, Check, Plus, TriangleAlert } from "lucide-react";

import {
  Card,
  Loading,
  Stat,
} from "../../components/Panel/Panel";
import { money } from "../../components/Panel/panelFormat";
import FormAlert from "../../components/FormAlert/FormAlert";
import FormField from "../../components/FormField/FormField";
import OtpStep from "../../components/OtpStep/OtpStep";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { authError, sendOtp } from "../../features/auth/authApi";
import {
  addWallet,
  fetchEligibility,
  fetchMe,
  fetchWallets,
  fetchWithdrawMethods,
  submitWithdraw,
} from "../../features/affiliate/affiliateApi";

/**
 * কমিশনের টাকা তোলা।
 *
 * অ্যাফিলিয়েটের জমা কমিশন অ্যাডমিন হিসাব মিলিয়ে ব্যালেন্সে বসান;
 * সেখান থেকেই তোলা হয় — খেলোয়াড়দের সাথে একই ব্যবস্থায়, তাই নিয়মও
 * এক (একসাথে একটাই আবেদন, আর জমা দেওয়ার সাথে সাথেই টাকা কেটে রাখা)।
 */
const Withdraw = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [methods, setMethods] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  const [methodId, setMethodId] = useState("");
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");

  const [newNumber, setNewNumber] = useState("");
  const [adding, setAdding] = useState(false);

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [otpStep, setOtpStep] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;

    Promise.all([fetchWithdrawMethods(), fetchWallets(), fetchEligibility(), fetchMe()])
      .then(([list, walletData, elig, me]) => {
        if (!alive) return;

        setMethods(list);
        setWallets(walletData.wallets || []);
        setEligibility(elig);

        if (me) dispatch(updateUser(me));
        if (list.length && !methodId) setMethodId(list[0].methodId);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, dispatch]);

  const method = methods.find((item) => item.methodId === methodId);

  const addNumber = async () => {
    if (newNumber.length !== 11) return;

    try {
      setAdding(true);
      setError("");

      await addWallet({ walletNumber: newNumber });

      setNewNumber("");
      setReload((prev) => prev + 1);
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setAdding(false);
    }
  };

  const send = async () => {
    try {
      setBusy(true);
      setError("");

      const request = await submitWithdraw({
        methodId,
        walletId,
        amount: Number(amount),
      });

      setDone(request);
      setOtpStep(null);

      const me = await fetchMe();
      if (me) dispatch(updateUser(me));
    } catch (err) {
      // সার্ভার কোড চাইলে তখনই পাঠানো হয়
      if (err?.response?.data?.code === "otpNotVerified") {
        try {
          const sent = await sendOtp({ flow: "withdraw", userId: user?.userId });
          setOtpStep({ maskedPhone: sent.maskedPhone });
          return;
        } catch (otpErr) {
          setError(authError(otpErr, t("somethingWrong"), t));
          return;
        }
      }

      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();

    if (!methodId || !walletId || Number(amount) <= 0) {
      setError(t("errMissingFields"));
      return;
    }

    send();
  };

  if (loading) return <Loading label={t("loading")} />;

  if (otpStep) {
    return (
      <Card title={t("otpTitle")}>
        <OtpStep
          flow="withdraw"
          userId={user?.userId}
          maskedPhone={otpStep.maskedPhone}
          onVerified={send}
        />
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Check size={30} className="text-[var(--status-success)]" />
          <p className="text-[16px] font-bold text-[var(--text-primary)]">
            {t("withdrawDone")}
          </p>
          <p className="text-[14px] text-[var(--text-muted)]">
            {t("withdrawDoneText")}
          </p>

          <button
            type="button"
            onClick={() => {
              setDone(null);
              setAmount("");
              setReload((prev) => prev + 1);
            }}
            className="aff-btn aff-btn--primary mt-2"
          >
            {t("back")}
          </button>
        </div>
      </Card>
    );
  }

  const blocked = eligibility && !eligibility.eligible;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Stat
          label={t("availableBalance")}
          value={money(user?.balance)}
          tone="var(--primary500)"
          Icon={BanknoteArrowDown}
        />
        <Stat
          label={t("myNumbers")}
          value={wallets.length}
          sub={t("myNumbersText")}
        />
      </div>

      {blocked ? (
        <Card>
          <p className="flex items-start gap-2 text-[14px] text-[var(--status-pending)]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            {eligibility.reason === "pendingWithdraw"
              ? t("pendingWithdrawText")
              : eligibility.reason === "verification"
                ? t("needVerificationText")
                : `${t("turnoverLeftText")} ${money(eligibility.remaining)}`}
          </p>
        </Card>
      ) : null}

      <Card title={t("navWithdraw")} subtitle={t("withdrawText")}>
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <FormAlert>{error}</FormAlert>

          <FormField label={t("selectWithdrawMethod")}>
            <div className="flex flex-wrap gap-2">
              {methods.length === 0 ? (
                <p className="text-[13px] text-[var(--text-disabled)]">
                  {t("noWithdrawMethod")}
                </p>
              ) : (
                methods.map((item) => (
                  <button
                    key={item.methodId}
                    type="button"
                    onClick={() => {
                      setMethodId(item.methodId);
                      setWalletId("");
                    }}
                    className="h-10 cursor-pointer rounded-[10px] px-4 text-[13px] transition"
                    style={{
                      background:
                        methodId === item.methodId
                          ? "var(--primary500)"
                          : "var(--neutral800)",
                      color:
                        methodId === item.methodId
                          ? "var(--neutral1000)"
                          : "var(--text-secondary)",
                      fontWeight: methodId === item.methodId ? 700 : 400,
                    }}
                  >
                    {item.name?.en || item.methodId}
                  </button>
                ))
              )}
            </div>
          </FormField>

          <FormField label={t("selectWallet")}>
            <div className="flex flex-col gap-2">
              {wallets.length === 0 ? (
                <p className="text-[13px] text-[var(--text-disabled)]">
                  {t("noNumberYet")}
                </p>
              ) : (
                wallets.map((wallet) => (
                  <button
                    key={wallet._id}
                      type="button"
                      onClick={() => setWalletId(wallet._id)}
                      className="flex h-11 cursor-pointer items-center justify-between rounded-[10px] px-4 text-[14px] transition"
                      style={{
                        background:
                          walletId === wallet._id
                            ? "var(--primary500)"
                            : "var(--neutral800)",
                        color:
                          walletId === wallet._id
                            ? "var(--neutral1000)"
                            : "var(--text-primary)",
                      }}
                    >
                      <span>{wallet.walletNumber}</span>
                      {wallet.isAutoRegistration ? (
                        <span className="text-[11px] opacity-80">
                          {t("registrationNumber")}
                        </span>
                      ) : null}
                    </button>
                  ))
              )}

              <div className="mt-1 flex gap-2">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  value={newNumber}
                  onChange={(event) =>
                    setNewNumber(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="01XXXXXXXXX"
                  className="h-11 min-w-0 flex-1 rounded-[10px] bg-[var(--form-box-bg)] px-4 text-[14px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
                />

                <button
                  type="button"
                  onClick={addNumber}
                  disabled={newNumber.length !== 11 || adding}
                  className="flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-[10px] border border-white/[0.07] px-4 text-[13px] text-[var(--text-secondary)] disabled:opacity-40"
                >
                  <Plus size={14} />
                  {t("addNumber")}
                </button>
              </div>
            </div>
          </FormField>

          <FormField
            label={t("withdrawAmount")}
            error={
              method && amount && Number(amount) < Number(method.minimumWithdrawAmount)
                ? `${t("minMax")}: ${method.minimumWithdrawAmount} — ${method.maximumWithdrawAmount}`
                : ""
            }
          >
            <input
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder={t("amountPlaceholder")}
              className="h-12 w-full rounded-[12px] bg-[var(--form-box-bg)] px-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
            />
          </FormField>

          <button
            type="submit"
            disabled={busy || blocked}
            className="aff-btn aff-btn--primary w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? t("loading") : t("withdrawNow")}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Withdraw;
