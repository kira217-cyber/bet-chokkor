import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import gameApiKeyRoutes from "./routes/gameApiKeyRoutes.js";
import maintenanceRoutes from "./routes/maintenanceRoutes.js";
import otpSettingRoutes from "./routes/otpSettingRoutes.js";
import userAuthRoutes from "./routes/userAuthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import registerBonusRoutes from "./routes/registerBonusRoutes.js";
import depositMethodRoutes from "./routes/depositMethodRoutes.js";
import depositFieldRoutes from "./routes/depositFieldRoutes.js";
import depositBonusTurnoverRoutes from "./routes/depositBonusTurnoverRoutes.js";
import depositRequestRoutes from "./routes/depositRequestRoutes.js";
import adminManualDepositRoutes from "./routes/adminManualDepositRoutes.js";
import autoDepositRoutes from "./routes/autoDepositRoutes.js";
import turnoverRoutes from "./routes/turnoverRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import bulkAdjustmentRoutes from "./routes/bulkAdjustmentRoutes.js";
import callbackRoutes from "./routes/callbackRoutes.js";
import gameHistoryRoutes from "./routes/gameHistoryRoutes.js";
import playGameRoutes from "./routes/playGameRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import referralRoutes from "./routes/referralRoutes.js";
import affiliateRoutes from "./routes/affiliateRoutes.js";
import affWithdrawRoutes from "./routes/affWithdrawRoutes.js";
import withdrawMethodRoutes from "./routes/withdrawMethodRoutes.js";
import eWalletRoutes from "./routes/eWalletRoutes.js";
import withdrawRequestRoutes from "./routes/withdrawRequestRoutes.js";

dotenv.config();

// সিক্রেট ছাড়া সার্ভার চালু হলে টোকেন যাচাই ভেঙে পড়ত — তাই
// শুরুতেই থামিয়ে দেওয়া হয়, চুপচাপ চলতে দেওয়ার চেয়ে ভালো
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("❌ JWT_SECRET নেই বা খুব ছোট (কমপক্ষে ৩২ অক্ষর) — .env দেখুন");
  process.exit(1);
}

await connectDB();

const app = express();

// রিভার্স প্রক্সির পেছনে থাকলে আসল IP পেতে (rate limit এর জন্য দরকার)
app.set("trust proxy", 1);

app.use(helmet());

/**
 * CORS — অরিজিন তালিকা env থেকে। খালি রাখলে সব অরিজিন allowed।
 * API টোকেন-ভিত্তিক (কুকি নয়), তাই খোলা CORS এ CSRF ঝুঁকি নেই;
 * তবু ডিপ্লয়ে তালিকা দিয়ে দিলে আরও কড়া হয়।
 */
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0) return callback(null, true);
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: false,
  }),
);

// বড় পে-লোড দিয়ে মেমরি ভরানো ঠেকাতে সীমা
app.use(express.json({ limit: "1mb" }));

// আপলোড করা ছবি সরাসরি পরিবেশন — helmet এর crossOriginResourcePolicy
// ডিফল্টে same-origin, তাই অন্য পোর্টের অ্যাডমিন/ক্লায়েন্ট থেকে ছবি
// দেখা যেত না
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static("uploads"),
);
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// পুরো API তে সাধারণ সীমা (লগইনে আলাদা কড়া সীমা আছে)
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.json({ success: true, message: "BetChokkor Server is running." });
});

app.get("/health", (req, res) => {
  res.json({ success: true, uptime: process.uptime() });
});

app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin/game-api-key", gameApiKeyRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/otp-setting", otpSettingRoutes);
app.use("/api/user", userAuthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/register-bonus", registerBonusRoutes);
app.use("/api/deposit-methods", depositMethodRoutes);
app.use("/api/deposit-fields", depositFieldRoutes);
app.use("/api/deposit-bonus-turnover", depositBonusTurnoverRoutes);
app.use("/api/deposit-requests", depositRequestRoutes);
app.use("/api/manual-deposit", adminManualDepositRoutes);
app.use("/api/auto-deposit", autoDepositRoutes);
app.use("/api/turnover", turnoverRoutes);
app.use("/api/admin/manage", adminUserRoutes);
app.use("/api/admin/bulk-adjustment", bulkAdjustmentRoutes);

// white-label মাস্টার প্রতিটা বাজি ও ফলের খবর এখানে পাঠায়
app.use("/api/callback", callbackRoutes);
app.use("/api/game-history", gameHistoryRoutes);
app.use("/api/play-game", playGameRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/referral", referralRoutes);
app.use("/api/affiliate", affiliateRoutes);
app.use("/api/aff-withdraw", affWithdrawRoutes);
app.use("/api/withdraw-methods", withdrawMethodRoutes);
app.use("/api/e-wallets", eWalletRoutes);
app.use("/api/withdraw-requests", withdrawRequestRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// শেষ ভরসার এরর হ্যান্ডলার — প্রোডাকশনে ভিতরের বার্তা বাইরে যায় না
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  res.status(status).json({
    success: false,
    message: isProd && status === 500 ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 BetChokkor Server running on port ${PORT}`);
});
