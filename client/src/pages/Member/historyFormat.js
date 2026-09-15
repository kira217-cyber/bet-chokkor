/** ইতিহাসের পাতায় টাকা, তারিখ আর স্ট্যাটাসের রঙ */

export const money = (value) => {
  const amount = Number(value || 0);

  return `৳ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const STATUS_TONE = {
  pending: "var(--status-pending)",
  approved: "var(--status-success)",
  paid: "var(--status-success)",
  completed: "var(--status-success)",
  running: "var(--status-pending)",
  rejected: "var(--status-danger)",
  failed: "var(--status-danger)",
  win: "var(--status-success)",
  loss: "var(--status-danger)",
  push: "var(--status-info)",
};

export const statusTone = (status) =>
  STATUS_TONE[String(status || "").toLowerCase()] || "var(--text-muted)";
