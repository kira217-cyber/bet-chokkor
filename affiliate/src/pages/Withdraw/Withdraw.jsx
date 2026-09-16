import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { BadgeCheck, BanknoteArrowDown, Check, TriangleAlert, Users } from "lucide-react";

import { Card, Loading, Stat } from "../../components/Panel/Panel";
import { money } from "../../components/Panel/panelFormat";
import FormAlert from "../../components/FormAlert/FormAlert";
import FormField from "../../components/FormField/FormField";
import { useLanguage } from "../../Context/LanguageProvider";
import { selectUser } from "../../features/auth/authSelectors";
import { updateUser } from "../../features/auth/authSlice";
import { authError } from "../../features/auth/authApi";
import {
  fetchAffEligibility,
  fetchAffWithdrawMethods,
  fetchMe,
  submitAffWithdraw,
} from "../../features/affiliate/affiliateApi";

/**
 * অ্যাফিলিয়েটের টাকা তোলা — খেলোয়াড়ের থেকে আলাদা।
 *
 * খেলোয়াড় সেভ করা মোবাইল নম্বরে টাকা নেন; অ্যাফিলিয়েট প্রায়ই ব্যাংকে,
 * যেখানে অ্যাকাউন্টের নাম-নম্বর-শাখা এরকম কয়েকটা ঘর লাগে। কোন ঘরগুলো
 * চাওয়া হবে সেটা অ্যাডমিন প্রতিটা উপায়ের জন্য ঠিক করে দেন, তাই এখানে
 * ফর্মটা সার্ভারের বলে দেওয়া ঘর ধরেই তৈরি হয় — নতুন ব্যাংক যোগ করতে
 * এই পাতা বদলাতে হয় না।
 *
 * তোলার আগে কয়েকটা শর্ত: কতজন সক্রিয় খেলোয়াড় এনেছেন, আর জমে থাকা
 * কমিশন অ্যাডমিন মিলিয়েছেন কিনা। কোনটায় আটকাচ্ছে সেটা পরিষ্কার করে
 * বলা হয় — নইলে "পারবেন না" শুনে কী করতে হবে বোঝা যেত না।
 */
const Withdraw = () => {
  const { t, tv } = useLanguage();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [methods, setMethods] = useState([]);
  const [setting, setSetting] = useState({});
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);

  const [methodId, setMethodId] = useState("");
  const [amount, setAmount] = useState("");
  const [values, setValues] = useState({});

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;

    Promise.all([fetchAffWithdrawMethods(), fetchAffEligibility(), fetchMe()])
      .then(([methodData, elig, me]) => {
        if (!alive) return;

        setMethods(methodData.methods || []);
        setSetting(methodData.setting || {});
        setEligibility(elig);

        if (me) dispatch(updateUser(me));

        if (methodData.methods?.length) {
          setMethodId((prev) => prev || methodData.methods[0].methodId);
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [reload, dispatch]);

  const method = methods.find((item) => item.methodId === methodId);

  const submit = async (event) => {
    event.preventDefault();

    if (busy) return;

    if (!methodId || Number(amount) <= 0) {
      setError(t("errMissingFields"));
      return;
    }

    try {
      setBusy(true);
      setError("");

      await submitAffWithdraw({
        methodId,
        amount: Number(amount),
        fields: values,
      });

      setDone(true);
      setAmount("");
      setValues({});

      const me = await fetchMe();
      if (me) dispatch(updateUser(me));
    } catch (err) {
      setError(authError(err, t("somethingWrong"), t));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading label={t("loading")} />;

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
              setDone(false);
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

  /** কোন শর্তে আটকাচ্ছে, আর কী করলে খুলবে */
  const blockText = () => {
    if (!eligibility || eligibility.eligible) return "";

    const map = {
      referrals: `${t("blockReferrals")} ${eligibility.remainingReferrals} ${t("blockReferralsTail")}`,
      unsettled: `${t("blockUnsettled")} ${money(eligibility.unsettled)}`,
      pending: t("blockPending"),
      noBalance: t("blockNoBalance"),
    };

    return map[eligibility.reason] || t("blockGeneric");
  };

  const blocked = eligibility && !eligibility.eligible;

  /*
   * পরিচয় যাচাই না হলে উইথড্রের কিছুই দেখানো হয় না।
   *
   * ব্যালেন্স, খেলোয়াড়ের সংখ্যা বা ফর্ম — কোনোটাই নয়, শুধু কী করতে
   * হবে আর কোথায় যেতে হবে। বাকিটা দেখিয়ে লাভ নেই, কারণ যাচাই না
   * হওয়া পর্যন্ত কোনোটাই কাজে আসবে না।
   */
  if (eligibility?.reason === "verification") {
    const waiting = eligibility.verificationStatus === "pending";

    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <span
            className="flex h-[76px] w-[76px] items-center justify-center rounded-full"
            style={{
              background:
                "color-mix(in srgb, var(--status-pending), transparent 88%)",
              color: "var(--status-pending)",
            }}
          >
            <BadgeCheck size={34} />
          </span>

          <p className="text-[17px] font-bold text-[var(--text-primary)]">
            {t(waiting ? "verifyPendingTitle" : "withdrawNeedVerifyTitle")}
          </p>

          <p className="max-w-[440px] text-[14px] leading-relaxed text-[var(--text-muted)]">
            {t(waiting ? "verifyPendingText" : "withdrawNeedVerifyText")}
          </p>

          {waiting ? null : (
            <Link
              to="/dashboard/verification"
              className="aff-btn aff-btn--primary mt-2 w-full max-w-[320px]"
            >
              {t("goToVerification")}
            </Link>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label={t("availableBalance")}
          value={money(user?.balance)}
          tone="var(--primary500)"
          Icon={BanknoteArrowDown}
        />
        <Stat
          label={t("activePlayersBrought")}
          value={`${eligibility?.activeReferrals ?? 0} / ${eligibility?.requiredActiveReferrals ?? 0}`}
          sub={t("activePlayersText")}
          tone={
            (eligibility?.activeReferrals ?? 0) >=
            (eligibility?.requiredActiveReferrals ?? 0)
              ? "var(--status-success)"
              : "var(--status-pending)"
          }
          Icon={Users}
        />
        <Stat
          label={t("withdrawStatus")}
          value={t(blocked ? "withdrawClosed" : "withdrawOpen")}
          tone={blocked ? "var(--status-danger)" : "var(--status-success)"}
        />
      </div>

      {blocked ? (
        <Card>
          <p className="flex items-start gap-2 text-[14px] text-[var(--status-pending)]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            {blockText()}
          </p>
        </Card>
      ) : null}

      {tv(setting.note) ? (
        <Card>
          <p className="text-[13px] text-[var(--text-muted)]">
            {tv(setting.note)}
          </p>
        </Card>
      ) : null}

      <Card title={t("navWithdraw")} subtitle={t("affWithdrawText")}>
        <form className="flex flex-col gap-5" onSubmit={submit}>
          <FormAlert>{error}</FormAlert>

          <FormField label={t("selectWithdrawMethod")}>
            {methods.length === 0 ? (
              <p className="text-[13px] text-[var(--text-disabled)]">
                {t("noWithdrawMethod")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {methods.map((item) => (
                  <button
                    key={item.methodId}
                    type="button"
                    onClick={() => {
                      setMethodId(item.methodId);
                      setValues({});
                    }}
                    className="flex h-11 cursor-pointer items-center gap-2 rounded-[10px] px-4 text-[13px] transition"
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
                    {tv(item.name)}
                  </button>
                ))}
              </div>
            )}
          </FormField>

          {/* অ্যাডমিনের ঠিক করা ঘরগুলো */}
          {(method?.fields || []).map((field) => (
            <FormField
              key={field.key}
              label={`${tv(field.label)}${field.required ? "" : ` (${t("optional")})`}`}
            >
              <input
                type={field.type === "number" ? "number" : field.type}
                value={values[field.key] || ""}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    [field.key]: event.target.value,
                  }))
                }
                placeholder={tv(field.placeholder)}
                className="h-12 w-full rounded-[12px] bg-[var(--form-box-bg)] px-4 text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              />
            </FormField>
          ))}

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
            disabled={busy || blocked || methods.length === 0}
            className="aff-btn aff-btn--primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t("loading") : t("withdrawNow")}
          </button>
        </form>
      </Card>
    </div>
  );
};

export default Withdraw;
