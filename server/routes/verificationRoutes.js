import express from "express";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

import Verification from "../models/Verification.js";
import VerificationSetting from "../models/VerificationSetting.js";
import User from "../models/User.js";

import upload from "../config/multer.js";
import { protectUser } from "../middleware/protectUser.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { isOtpRequired, isVerified, clearOtp } from "../utils/otp.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();
const isId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const DOCUMENT_TYPES = ["nid", "passport", "driving"];

/** পুরোনো ছবি মুছে ফেলা — নইলে বারবার পাঠাতে পাঠাতে ফোল্ডার ভরে যেত */
const removeUpload = (url) => {
  if (!url || !url.startsWith("/uploads/")) return;

  fs.promises.unlink(path.join("uploads", path.basename(url))).catch(() => {});
};

const fileUrl = (file) => (file ? `/uploads/${file.filename}` : "");

/** OTP এর সুইচ দুই সাইটে আলাদা, তাই ভূমিকা দেখে বেছে নেওয়া */
const siteOf = (user) => (user?.role === "aff-user" ? "affiliate" : "client");

/**
 * যাচাই লাগবে কিনা, আর হয়ে থাকলে কী অবস্থায়।
 *
 * ডিপোজিট ও উইথড্রের রুট দুটোই এটা ডাকে, তাই শর্তটা এক জায়গাতেই
 * লেখা — দুই জায়গায় আলাদা লিখলে একটা বদলে অন্যটা পিছিয়ে থাকত।
 */
export const verificationGate = async (userId, action, role = "user") => {
  const setting = await VerificationSetting.current();

  // অ্যাফিলিয়েটের নিজের সুইচ — তাঁদের শুধু উইথড্রেই লাগে
  const needed =
    role === "aff-user"
      ? setting.affiliateRequireForWithdraw
      : action === "deposit"
        ? setting.requireForDeposit
        : setting.requireForWithdraw;

  if (!needed) return { ok: true };

  const row = await Verification.findOne({ user: userId }).lean();

  if (row?.status === "approved") return { ok: true };

  return {
    ok: false,
    status: row?.status || "none",
    message:
      row?.status === "pending"
        ? "Your identity verification is still being checked"
        : "Please complete identity verification first",
  };
};

/* =========================
   ব্যবহারকারী
   ========================= */

/** নিজের অবস্থা — সেটিং সহ, যাতে পাতাটা কী বলবে সেটা ঠিক করতে পারে */
router.get("/my", protectUser, async (req, res) => {
  try {
    const [row, setting] = await Promise.all([
      Verification.findOne({ user: req.user._id })
        .select("-reviewedBy")
        .lean(),
      VerificationSetting.current(),
    ]);

    return successResponse(res, "Verification loaded", {
      verification: row || null,
      setting: {
        requireForDeposit: setting.requireForDeposit,
        requireForWithdraw: setting.requireForWithdraw,
        affiliateRequireForWithdraw: setting.affiliateRequireForWithdraw,
        note: setting.note,
      },
      otpRequired: await isOtpRequired(siteOf(req.user), "profileVerify"),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/**
 * আবেদন পাঠানো বা আবার পাঠানো।
 *
 * অনুমোদিত হয়ে গেলে আর বদলানো যায় না — নইলে যাচাই হয়ে যাওয়ার পরে
 * অন্য কারো কাগজ বসিয়ে দেওয়া যেত। ঝুলে থাকা আবেদনও বদলানো যায়,
 * কারণ ভুল ছবি দিলে অ্যাডমিনের বাতিল করার অপেক্ষায় বসে থাকার মানে নেই।
 */
router.post(
  "/",
  protectUser,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
    { name: "selfieImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const existing = await Verification.findOne({ user: req.user._id });

      if (existing?.status === "approved") {
        return errorResponse(
          res,
          "Your identity is already verified",
          400,
          "alreadyVerified",
        );
      }

      const fullName = text(req.body?.fullName);
      const documentType = text(req.body?.documentType).toLowerCase();
      const documentNumber = text(req.body?.documentNumber);

      if (!fullName || !documentNumber) {
        return errorResponse(res, "Please fill in every field", 400, "missingFields");
      }

      if (!DOCUMENT_TYPES.includes(documentType)) {
        return errorResponse(res, "Pick a document type", 400, "missingFields");
      }

      /*
       * OTP চালু থাকলে নম্বরটা আগে যাচাই হতে হবে — কাগজপত্রের সাথে
       * ফোনটাও যে তাঁরই, সেটা নিশ্চিত হয়।
       *
       * সাইটটা ভূমিকা দেখে বাছা হয়। আগে `"client"` বসানো ছিল, তাই
       * অ্যাডমিন অ্যাফিলিয়েটের জন্য OTP বন্ধ রাখলেও তাঁরা ক্লায়েন্টের
       * সুইচে আটকে যেতেন।
       */
      if (await isOtpRequired(siteOf(req.user), "profileVerify")) {
        const okOtp = isVerified({
          flow: "profileVerify",
          countryCode: req.user.countryCode,
          phone: req.user.phone,
        });

        if (!okOtp) {
          return errorResponse(res, "Verify the code first", 400, "otpNotVerified");
        }
      }

      const files = req.files || {};
      const front = fileUrl(files.frontImage?.[0]);
      const back = fileUrl(files.backImage?.[0]);
      const selfie = fileUrl(files.selfieImage?.[0]);

      // প্রথমবার ছবি লাগবেই; আবার পাঠানোর সময় যেটা দেননি সেটা আগেরটাই থাকে
      if (!existing && (!front || !selfie)) {
        return errorResponse(
          res,
          "Front side of the document and a selfie are required",
          400,
          "missingFields",
        );
      }

      const row = existing || new Verification({ user: req.user._id });

      if (front) {
        removeUpload(row.frontImage);
        row.frontImage = front;
      }

      if (back) {
        removeUpload(row.backImage);
        row.backImage = back;
      }

      if (selfie) {
        removeUpload(row.selfieImage);
        row.selfieImage = selfie;
      }

      row.userIdText = req.user.userId;
      // ভূমিকা আবেদনের সাথেই — অ্যাডমিনের দুটো আলাদা তালিকা এটা দেখেই চলে
      row.role = req.user.role === "aff-user" ? "aff-user" : "user";
      row.fullName = fullName;
      row.documentType = documentType;
      row.documentNumber = documentNumber;
      row.dateOfBirth = req.body?.dateOfBirth
        ? new Date(req.body.dateOfBirth)
        : null;

      row.status = "pending";
      row.reviewNote = "";
      row.reviewedBy = null;
      row.reviewedAt = null;
      row.submittedAt = new Date();

      await row.save();

      // ব্যবহারকারীর ঘরেও একই অবস্থা — হেডারের ব্যাজ এটা দেখেই চলে
      await User.updateOne(
        { _id: req.user._id },
        { $set: { verificationStatus: "pending" } },
      );

      clearOtp({
        flow: "profileVerify",
        countryCode: req.user.countryCode,
        phone: req.user.phone,
      });

      return successResponse(res, "Verification submitted", {
        verification: row,
      });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/admin", protectAdmin, async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    // ভূমিকা ধরে আলাদা তালিকা — অ্যাডমিনে খেলোয়াড় ও অ্যাফিলিয়েটের
    // পাতা দুটো আলাদা, একই তালিকায় মিশিয়ে দিলে খুঁজে পাওয়া কঠিন হতো
    const role = req.query.role === "aff-user" ? "aff-user" : "user";
    const filter = { role };

    const status = text(req.query.status);

    if (["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    const search = text(req.query.q);

    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      filter.$or = [
        { userIdText: regex },
        { fullName: regex },
        { documentNumber: regex },
      ];
    }

    const [rows, total, counts] = await Promise.all([
      Verification.find(filter)
        .populate("user", "userId phone balance role")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Verification.countDocuments(filter),
      Verification.aggregate([
        { $match: { role } },
        { $group: { _id: "$status", n: { $sum: 1 } } },
      ]),
    ]);

    return successResponse(res, "Verifications loaded", {
      rows,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      counts: counts.reduce(
        (acc, item) => ({ ...acc, [item._id]: item.n }),
        { pending: 0, approved: 0, rejected: 0 },
      ),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/** অনুমোদন বা বাতিল */
const review = (nextStatus) => async (req, res) => {
  try {
    if (!isId(req.params.id)) return errorResponse(res, "Bad id", 400);

    const note = text(req.body?.note);

    if (nextStatus === "rejected" && !note) {
      return errorResponse(res, "Please say why it was rejected", 400);
    }

    // ঝুলে থাকা আবেদনটাই একবারে দাবি করা — দুজন অ্যাডমিন একসাথে
    // চাপলেও দ্বিতীয়জন খালি হাতে ফিরবেন, দুবার হিসাব হবে না
    const row = await Verification.findOneAndUpdate(
      { _id: req.params.id, status: "pending" },
      {
        $set: {
          status: nextStatus,
          reviewNote: note,
          reviewedBy: req.admin._id,
          reviewedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    ).populate("user", "userId phone");

    if (!row) {
      return errorResponse(res, "Already reviewed or not found", 409);
    }

    await User.updateOne(
      { _id: row.user?._id || row.user },
      { $set: { verificationStatus: nextStatus } },
    );

    return successResponse(res, `Verification ${nextStatus}`, {
      verification: row,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

router.patch(
  "/admin/:id/approve",
  protectAdmin,
  requireWrite,
  review("approved"),
);

router.patch(
  "/admin/:id/reject",
  protectAdmin,
  requireWrite,
  review("rejected"),
);

/* =========================
   সেটিং
   ========================= */

router.get("/admin/setting", protectAdmin, requireMother, async (req, res) => {
  try {
    const setting = await VerificationSetting.current();
    return successResponse(res, "Setting loaded", { setting });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.put(
  "/admin/setting",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const setting = await VerificationSetting.current();

      if (req.body?.requireForDeposit !== undefined) {
        setting.requireForDeposit = Boolean(req.body.requireForDeposit);
      }

      if (req.body?.affiliateRequireForWithdraw !== undefined) {
        setting.affiliateRequireForWithdraw = Boolean(
          req.body.affiliateRequireForWithdraw,
        );
      }

      if (req.body?.requireForWithdraw !== undefined) {
        setting.requireForWithdraw = Boolean(req.body.requireForWithdraw);
      }

      if (req.body?.note) {
        setting.note = {
          bn: text(req.body.note.bn) || setting.note.bn,
          en: text(req.body.note.en) || setting.note.en,
        };
      }

      await setting.save();

      return successResponse(res, "Setting saved", { setting });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

/** একজনের যাচাইয়ের অবস্থা — ব্যবহারকারীর বিস্তারিত পাতার জন্য */
router.get("/admin/user/:userId", protectAdmin, async (req, res) => {
  try {
    if (!isId(req.params.userId)) return errorResponse(res, "Bad id", 400);

    const [row, user] = await Promise.all([
      Verification.findOne({ user: req.params.userId }).lean(),
      User.findById(req.params.userId).select("userId").lean(),
    ]);

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "Verification loaded", {
      verification: row || null,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

export default router;
