import express from "express";

import { protectAdmin } from "../middleware/protectAdmin.js";
import { successResponse } from "../utils/response.js";
import Admin from "../models/Admin.js";

const router = express.Router();

/**
 * ড্যাশবোর্ডের সংখ্যা।
 *
 * এখন বেশিরভাগ স্ট্যাটিক — user, deposit, withdraw মডেল তৈরি হলে
 * এখানে আসল query বসবে। অ্যাডমিনের সংখ্যাটা কিন্তু আসল ডেটাবেস থেকেই।
 */
router.get("/stats", protectAdmin, async (req, res) => {
  const adminCount = await Admin.countDocuments();

  return successResponse(res, "Dashboard stats loaded", {
    stats: {
      totalUsers: 12480,
      activeUsers: 3162,
      totalDeposit: 8420000,
      totalWithdraw: 5130000,
      pendingDeposits: 24,
      pendingWithdraws: 11,
      totalAffiliates: 318,
      totalAdmins: adminCount,
    },

    // শেষ ৭ দিনের ডিপোজিট/উইথড্র — চার্টের জন্য
    chart: [
      { day: "Sat", deposit: 940000, withdraw: 560000 },
      { day: "Sun", deposit: 1120000, withdraw: 610000 },
      { day: "Mon", deposit: 1035000, withdraw: 720000 },
      { day: "Tue", deposit: 1280000, withdraw: 690000 },
      { day: "Wed", deposit: 1190000, withdraw: 810000 },
      { day: "Thu", deposit: 1405000, withdraw: 880000 },
      { day: "Fri", deposit: 1450000, withdraw: 860000 },
    ],

    recentActivity: [
      { id: "a1", type: "deposit", user: "rai18", amount: 5000, status: "pending" },
      { id: "a2", type: "withdraw", user: "sabbir77", amount: 12000, status: "approved" },
      { id: "a3", type: "register", user: "nusrat_01", amount: 0, status: "done" },
      { id: "a4", type: "deposit", user: "mehedi_bd", amount: 2500, status: "approved" },
      { id: "a5", type: "withdraw", user: "arif.khan", amount: 7800, status: "rejected" },
    ],
  });
});

export default router;
