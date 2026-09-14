/**
 * পরীক্ষার জন্য একটা mother অ্যাডমিন।
 *
 *   node scripts/createTestAdmin.js
 *
 * আসল mother অ্যাডমিনের পাসওয়ার্ড বদলে গেলেও এটা দিয়ে প্যানেলে ঢোকা
 * যায়। দরকার না থাকলে Admin Accounts পেজ থেকে মুছে ফেলা যাবে।
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Admin from "../models/Admin.js";

dotenv.config();

const EMAIL = "demo@betchokkor.com";
const PASSWORD = "Demo#2026admin";

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });

  const existing = await Admin.findOne({ email: EMAIL });

  if (existing) {
    existing.password = await bcrypt.hash(PASSWORD, 12);
    existing.role = "mother";
    existing.isActive = true;
    await existing.save();
    console.log("পাসওয়ার্ড আবার বসানো হলো");
  } else {
    await Admin.create({
      email: EMAIL,
      password: await bcrypt.hash(PASSWORD, 12),
      role: "mother",
      name: "Demo Admin",
      isActive: true,
    });
    console.log("অ্যাডমিন তৈরি হলো");
  }

  console.log(`  ইমেইল   : ${EMAIL}`);
  console.log(`  পাসওয়ার্ড: ${PASSWORD}`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("ব্যর্থ:", error.message);
  await mongoose.disconnect();
  process.exit(1);
});
