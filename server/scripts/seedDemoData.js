/**
 * পরীক্ষার জন্য কিছু নমুনা ডেটা বসায়।
 *
 *   node scripts/seedDemoData.js          — বসায় (আগেরগুলো থাকলে বাদ দেয়)
 *   node scripts/seedDemoData.js reset    — আগেরগুলো মুছে নতুন করে বসায়
 *
 * সব কিছুর নাম `demo` দিয়ে শুরু, তাই আসল ডেটার সাথে মিশে যায় না আর
 * দরকার হলে আলাদা করে চেনা যায়।
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";
import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import DepositRequest from "../models/DepositRequest.js";
import TurnOver from "../models/TurnOver.js";
import AutoDeposit from "../models/AutoDeposit.js";
import RegisterBonusCampaign from "../models/RegisterBonusCampaign.js";

dotenv.config();

const BCRYPT_ROUNDS = 12;
const PASSWORD = "Demo#2026";

const METHODS = ["demo-bkash", "demo-nagad", "demo-usdt"];
const USER_RE = /^demo/;

const wipe = async () => {
  const users = await User.find({ userId: USER_RE });
  const ids = users.map((u) => u._id);

  await Promise.all([
    DepositRequest.deleteMany({ user: { $in: ids } }),
    TurnOver.deleteMany({ user: { $in: ids } }),
    AutoDeposit.deleteMany({ user: { $in: ids } }),
  ]);

  await User.deleteMany({ _id: { $in: ids } });

  for (const method of await DepositMethod.find({ methodId: { $in: METHODS } })) {
    await DepositFieldConfig.deleteOne({ depositMethod: method._id });
    await DepositBonusTurnover.deleteOne({ depositMethod: method._id });
    await DepositMethod.deleteOne({ _id: method._id });
  }

  await RegisterBonusCampaign.deleteMany({ "title.en": /^Demo/ });
};

/** ৬ অক্ষরের রেফারেল কোড */
const makeCode = async () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let attempt = 0; attempt < 30; attempt += 1) {
    let code = "";
    for (let i = 0; i < 6; i += 1) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!(await User.exists({ referralCode: code }))) return code;
  }

  throw new Error("রেফারেল কোড বানানো গেল না");
};

const makeGameName = async () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";

  for (let attempt = 0; attempt < 30; attempt += 1) {
    let name = "";
    for (let i = 0; i < 10; i += 1) {
      name += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (!(await User.exists({ userGamePlayName: name }))) return name;
  }

  throw new Error("গেম নাম বানানো গেল না");
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  if (process.argv[2] === "reset") await wipe();

  if (await User.exists({ userId: USER_RE })) {
    console.log("নমুনা ডেটা আগে থেকেই আছে — নতুন করে বসাতে: reset");
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  let phone = 1900000001;

  const makeUser = async (userId, extra = {}) =>
    User.create({
      userId,
      password: hash,
      countryCode: "+880",
      phone: String(phone++),
      currency: "BDT",
      referralCode: await makeCode(),
      userGamePlayName: await makeGameName(),
      ...extra,
    });

  /* ── ডিপোজিটের উপায় ── */
  const bkash = await DepositMethod.create({
    methodId: "demo-bkash",
    methodName: { bn: "বিকাশ", en: "bKash" },
    group: "ewallet",
    methodType: "agent",
    minDepositAmount: 300,
    maxDepositAmount: 25000,
    sort: 0,
    contacts: [
      { id: "b1", label: { bn: "এজেন্ট ১", en: "Agent 1" }, number: "01711111111", isActive: true, sort: 0 },
      { id: "b2", label: { bn: "এজেন্ট ২", en: "Agent 2" }, number: "01722222222", isActive: true, sort: 1 },
    ],
  });

  await DepositFieldConfig.create({
    depositMethod: bkash._id,
    instructions: {
      bn: "উপরের নম্বরে টাকা পাঠিয়ে নিচের তথ্যগুলো দিন",
      en: "Send the money to the number above, then fill in below",
    },
    inputs: [
      {
        key: "senderNumber",
        label: { bn: "প্রেরকের নম্বর", en: "Sender number" },
        placeholder: { bn: "যে নম্বর থেকে পাঠিয়েছেন", en: "The number you sent from" },
        type: "tel",
        required: true,
      },
      {
        key: "trxId",
        label: { bn: "ট্রানজেকশন আইডি", en: "Transaction ID" },
        placeholder: { bn: "যেমন 9F3KD2LM", en: "e.g. 9F3KD2LM" },
        required: true,
      },
    ],
  });

  await DepositBonusTurnover.create({
    depositMethod: bkash._id,
    turnoverMultiplier: 2,
    channels: [
      { id: "cashout", name: { bn: "ক্যাশআউট", en: "Cash Out" }, tagText: "+5%", bonusPercent: 5 },
      { id: "sendmoney", name: { bn: "সেন্ড মানি", en: "Send Money" }, tagText: "+0%", bonusPercent: 0 },
    ],
    promotions: [
      {
        id: "first100",
        name: { bn: "প্রথম ডিপোজিট ১০০%", en: "First deposit 100%" },
        bonusType: "percent",
        bonusValue: 100,
        turnoverMultiplier: 5,
        bonusScope: "first-deposit",
        sort: 0,
      },
    ],
  });

  const nagad = await DepositMethod.create({
    methodId: "demo-nagad",
    methodName: { bn: "নগদ", en: "Nagad" },
    group: "ewallet",
    minDepositAmount: 300,
    maxDepositAmount: 25000,
    sort: 1,
    contacts: [
      { id: "n1", label: { bn: "এজেন্ট", en: "Agent" }, number: "01733333333", isActive: true, sort: 0 },
    ],
  });

  await DepositFieldConfig.create({
    depositMethod: nagad._id,
    instructions: { bn: "টাকা পাঠিয়ে আইডি দিন", en: "Send the money then give the id" },
    inputs: [
      { key: "trxId", label: { bn: "ট্রানজেকশন আইডি", en: "Transaction ID" }, required: true },
    ],
  });

  await DepositBonusTurnover.create({
    depositMethod: nagad._id,
    turnoverMultiplier: 1,
    channels: [
      { id: "sendmoney", name: { bn: "সেন্ড মানি", en: "Send Money" }, tagText: "+2%", bonusPercent: 2 },
    ],
  });

  const usdt = await DepositMethod.create({
    methodId: "demo-usdt",
    methodName: { bn: "ইউএসডিটি", en: "USDT TRC20" },
    group: "crypto",
    minDepositAmount: 500,
    maxDepositAmount: 500000,
    sort: 0,
    contacts: [
      { id: "u1", label: { bn: "ওয়ালেট", en: "Wallet" }, number: "TXk9mQ2p8Lb3vN7dR4sY", isActive: true, sort: 0 },
    ],
  });

  await DepositFieldConfig.create({
    depositMethod: usdt._id,
    instructions: { bn: "উপরের ওয়ালেটে পাঠান", en: "Send to the wallet above" },
    inputs: [
      { key: "txHash", label: { bn: "ট্রানজেকশন হ্যাশ", en: "Transaction hash" }, required: true },
    ],
  });

  await DepositBonusTurnover.create({
    depositMethod: usdt._id,
    turnoverMultiplier: 1,
    channels: [{ id: "trc20", name: { bn: "TRC20", en: "TRC20" }, tagText: "+0%", bonusPercent: 0 }],
  });

  /* ── রেজিস্টার বোনাস ── */
  await RegisterBonusCampaign.create({
    title: { bn: "ডেমো সাইন আপ বোনাস", en: "Demo sign up bonus" },
    description: { bn: "নতুন অ্যাকাউন্টে ২০০ টাকা", en: "200 on a new account" },
    bonusAmount: 200,
    turnoverMultiplier: 3,
    status: "active",
  });

  /* ── অ্যাফিলিয়েট ── */
  const affiliates = [];
  const affNames = ["Rahim Uddin", "Karim Mia", "Selina Akter"];

  for (let i = 0; i < 3; i += 1) {
    const [firstName, lastName] = affNames[i].split(" ");

    const aff = await makeUser(`demoaff${i + 1}`, {
      role: "aff-user",
      firstName,
      lastName,
      email: `demoaff${i + 1}@example.com`,
      balance: 500 * (i + 1),
      referCommission: 2 + i,
      depositCommission: 4 + i,
      gameWinCommission: 1,
      gameLossCommission: 6,
      // তৃতীয়জনের কিছুই জমেনি — Bulk Adjustment এ বাদ পড়বে
      ...(i < 2
        ? {
            referCommissionBalance: 100 * (i + 1),
            depositCommissionBalance: 250 * (i + 1),
            gameLossCommissionBalance: 400 * (i + 1),
            gameWinCommissionBalance: 150 * (i + 1),
          }
        : {}),
    });

    affiliates.push(aff);
  }

  /* ── প্লেয়ার ── */
  const players = [];

  for (let i = 1; i <= 8; i += 1) {
    const player = await makeUser(`demouser${i}`, {
      firstName: "Player",
      lastName: String(i),
      email: i % 2 ? `demouser${i}@example.com` : "",
      balance: i * 250,
      // প্রথম তিনজন তিন অ্যাফিলিয়েটের নিচে
      ...(i <= 3 ? { referredBy: affiliates[i - 1]._id } : {}),
      // একজন বন্ধ, যাতে ফিল্টারটা পরীক্ষা করা যায়
      ...(i === 6 ? { isActive: false } : {}),
    });

    players.push(player);
  }

  for (let i = 0; i < 3; i += 1) {
    await User.updateOne({ _id: affiliates[i]._id }, { $set: { referralCount: 1 } });
  }

  /* ── ডিপোজিটের ইতিহাস ── */
  const makeDeposit = async (user, { amount, status, channel, promo, when }) => {
    const channelPercent = channel === "cashout" ? 5 : 0;
    const percentBonus = (amount * channelPercent) / 100;
    const promoBonus = promo ? amount : 0;
    const totalBonus = percentBonus + promoBonus;
    const credited = amount + totalBonus;
    const multiplier = promo ? 5 : 2;

    const request = await DepositRequest.create({
      user: user._id,
      methodId: "demo-bkash",
      channelId: channel,
      promoId: promo ? "first100" : "none",
      amount,
      fields: { senderNumber: "01811111111", trxId: `DEMO${Date.now()}${amount}` },
      calc: {
        channelPercent,
        percentBonus,
        promoBonus,
        totalBonus,
        turnoverMultiplier: multiplier,
        targetTurnover: credited * multiplier,
        creditedAmount: credited,
        eligibleProviders: [],
        affiliateDepositCommission: {},
      },
      status,
      ...(status === "approved" ? { approvedAt: when } : {}),
      ...(status === "rejected" ? { rejectedAt: when, adminNote: "Transaction id not found" } : {}),
      display: {
        methodName: { bn: "বিকাশ", en: "bKash" },
        channelName:
          channel === "cashout"
            ? { bn: "ক্যাশআউট", en: "Cash Out" }
            : { bn: "সেন্ড মানি", en: "Send Money" },
        channelTagText: channel === "cashout" ? "+5%" : "+0%",
        channelNumber: "01711111111",
        userId: user.userId,
        source: "User Deposit",
      },
      createdAt: when,
    });

    if (status === "approved") {
      await TurnOver.create({
        user: user._id,
        sourceType: "deposit",
        sourceId: request._id,
        title: `Deposit ${amount}`,
        required: credited * multiplier,
        progress: Math.round(credited * multiplier * 0.4),
        creditedAmount: credited,
        status: "running",
        createdAt: when,
      });
    }

    return request;
  };

  const day = 24 * 60 * 60 * 1000;
  const now = Date.now();

  await makeDeposit(players[0], { amount: 1000, status: "approved", channel: "cashout", promo: true, when: new Date(now - 6 * day) });
  await makeDeposit(players[0], { amount: 2000, status: "approved", channel: "cashout", when: new Date(now - 3 * day) });
  await makeDeposit(players[0], { amount: 500, status: "rejected", channel: "sendmoney", when: new Date(now - 2 * day) });
  await makeDeposit(players[0], { amount: 1500, status: "pending", channel: "cashout", when: new Date(now - day) });

  await makeDeposit(players[1], { amount: 800, status: "approved", channel: "sendmoney", when: new Date(now - 4 * day) });
  await makeDeposit(players[1], { amount: 3000, status: "pending", channel: "cashout", when: new Date(now - 5 * 60 * 60 * 1000) });

  await makeDeposit(players[2], { amount: 600, status: "pending", channel: "sendmoney", when: new Date(now - 60 * 60 * 1000) });

  /* ── অটো ডিপোজিট ── */
  await AutoDeposit.create({
    user: players[0]._id,
    userIdText: players[0].userId,
    amount: 1200,
    invoiceNumber: `BCDEMO${now}`,
    status: "PAID",
    balanceAdded: true,
    paidAt: new Date(now - 2 * day),
    transactionId: "DEMOTX9911",
    bank: "bKash",
    calc: {
      depositAmount: 1200,
      bonusAmount: 120,
      creditedAmount: 1320,
      turnoverMultiplier: 2,
      targetTurnover: 2640,
    },
    createdAt: new Date(now - 2 * day),
  });

  await AutoDeposit.create({
    user: players[1]._id,
    userIdText: players[1].userId,
    amount: 700,
    invoiceNumber: `BCDEMO${now + 1}`,
    status: "PENDING",
    createdAt: new Date(now - 3 * 60 * 60 * 1000),
  });

  /* ── রেজিস্টার বোনাসের টার্নওভার ── */
  await TurnOver.create({
    user: players[3]._id,
    sourceType: "register-bonus",
    sourceId: players[3]._id,
    title: "Register bonus 200",
    required: 600,
    progress: 600,
    creditedAmount: 200,
    status: "completed",
    completedAt: new Date(now - day),
  });

  console.log("নমুনা ডেটা বসানো হলো:");
  console.log(`  ৩টি ডিপোজিট মেথড (ফর্ম ও বোনাসের নিয়মসহ)`);
  console.log(`  ১টি রেজিস্টার বোনাস ক্যাম্পেইন`);
  console.log(`  ৩ জন অ্যাফিলিয়েট — demoaff1..3`);
  console.log(`  ৮ জন প্লেয়ার — demouser1..8 (demouser6 বন্ধ)`);
  console.log(`  ৭টি ডিপোজিট (৩টি অপেক্ষমাণ), ২টি অটো ডিপোজিট, টার্নওভার`);
  console.log(`\n  সবার পাসওয়ার্ড: ${PASSWORD}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("ব্যর্থ:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
