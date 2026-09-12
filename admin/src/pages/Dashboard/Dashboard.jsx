import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Users,
  UserCheck,
  ArrowDownToLine,
  ArrowUpFromLine,
  Clock,
  Handshake,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { api } from "../../api/axios";
import { selectAdmin } from "../../features/auth/authSelectors";
import { useSelector } from "react-redux";

const CARDS = [
  { key: "totalUsers", label: "Total Users", icon: Users, money: false },
  { key: "activeUsers", label: "Active Users", icon: UserCheck, money: false },
  { key: "totalDeposit", label: "Total Deposit", icon: ArrowDownToLine, money: true },
  { key: "totalWithdraw", label: "Total Withdraw", icon: ArrowUpFromLine, money: true },
  { key: "pendingDeposits", label: "Pending Deposits", icon: Clock, money: false },
  { key: "pendingWithdraws", label: "Pending Withdraws", icon: Clock, money: false },
  { key: "totalAffiliates", label: "Affiliates", icon: Handshake, money: false },
  { key: "totalAdmins", label: "Admin Accounts", icon: ShieldCheck, money: false },
];

const STATUS_COLOR = {
  pending: "var(--status-pending)",
  approved: "var(--status-success)",
  rejected: "var(--status-danger)",
  done: "var(--status-info)",
};

/** ড্যাশবোর্ডের তথ্য আনে — কম্পোনেন্টের বাইরে, যাতে effect আর বোতাম দুজনেই ব্যবহার করতে পারে */
const fetchStats = async () => {
  const res = await api.get("/api/dashboard/stats");
  return res?.data?.data || null;
};

const format = (value) => new Intl.NumberFormat("en-US").format(value || 0);

const Dashboard = () => {
  const admin = useSelector(selectAdmin);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    fetchStats()
      .then((next) => alive && setData(next))
      .catch((error) =>
        toast.error(error?.response?.data?.message || "Failed to load dashboard"),
      )
      .finally(() => alive && setLoading(false));

    // পেজ ছেড়ে গেলে উত্তর এলে আর state বদলানো হয় না
    return () => {
      alive = false;
    };
  }, []);

  // Refresh বোতাম
  const load = async () => {
    try {
      setLoading(true);
      setData(await fetchStats());
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const stats = data?.stats || {};
  const chart = data?.chart || [];
  const activity = data?.recentActivity || [];

  // চার্টের সর্বোচ্চ মান — বারের উচ্চতা এর সাপেক্ষে
  const peak = Math.max(
    1,
    ...chart.flatMap((row) => [row.deposit, row.withdraw]),
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold text-[var(--neutral100)] lg:text-[28px]">
            Dashboard
          </h1>
          <p className="mt-1 text-[14px] text-[var(--text-muted)]">
            Welcome back, {admin?.email}
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ad-btn ad-btn--ghost ad-btn--sm"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── সংখ্যার কার্ড ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.key} className="ad-card">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[var(--neutral800)] text-[var(--primary500)]">
                  <Icon size={18} />
                </span>
              </div>

              <p className="mt-4 text-[20px] font-extrabold leading-none text-[var(--neutral100)] lg:text-[24px]">
                {loading ? "—" : (card.money ? "৳" : "") + format(stats[card.key])}
              </p>

              <p className="mt-2 text-[13px] text-[var(--text-muted)]">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[1.4fr_1fr]">
        {/* ── ৭ দিনের চার্ট ── */}
        <div className="ad-card">
          <h2 className="text-[16px] font-bold text-[var(--neutral100)]">
            Last 7 days
          </h2>

          <div className="mt-4 flex items-center gap-5">
            <span className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary500)]" />
              Deposit
            </span>
            <span className="flex items-center gap-2 text-[12px] text-[var(--text-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--neutral600)]" />
              Withdraw
            </span>
          </div>

          <div className="ad-scroll mt-6 overflow-x-auto">
            <div className="flex min-w-[420px] items-end gap-3">
              {chart.map((row) => (
                <div key={row.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-40 w-full items-end justify-center gap-1.5">
                    <span
                      className="w-full max-w-[16px] rounded-t-[4px] bg-[var(--primary500)]"
                      style={{ height: `${(row.deposit / peak) * 100}%` }}
                      title={`Deposit ৳${format(row.deposit)}`}
                    />
                    <span
                      className="w-full max-w-[16px] rounded-t-[4px] bg-[var(--neutral600)]"
                      style={{ height: `${(row.withdraw / peak) * 100}%` }}
                      title={`Withdraw ৳${format(row.withdraw)}`}
                    />
                  </div>

                  <span className="text-[12px] text-[var(--text-muted)]">
                    {row.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── সাম্প্রতিক কার্যক্রম ── */}
        <div className="ad-card">
          <h2 className="text-[16px] font-bold text-[var(--neutral100)]">
            Recent activity
          </h2>

          <ul className="mt-4 flex flex-col gap-3">
            {activity.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-[12px] bg-[var(--neutral800)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-[var(--neutral100)]">
                    {item.user}
                  </p>
                  <p className="text-[12px] capitalize text-[var(--text-muted)]">
                    {item.type}
                  </p>
                </div>

                <div className="shrink-0 text-end">
                  {item.amount > 0 && (
                    <p className="text-[14px] font-bold text-[var(--neutral100)]">
                      ৳{format(item.amount)}
                    </p>
                  )}

                  <p
                    className="text-[12px] font-semibold capitalize"
                    style={{ color: STATUS_COLOR[item.status] }}
                  >
                    {item.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-[12px] text-[var(--text-disabled)]">
        Numbers other than the admin count are placeholder data — they will come
        from the user, deposit and withdraw collections once those are built.
      </p>
    </div>
  );
};

export default Dashboard;
