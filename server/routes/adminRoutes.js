import express from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

import Admin from "../models/Admin.js";
import generateToken from "../utils/generateToken.js";
import { successResponse, errorResponse } from "../utils/response.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";

const router = express.Router();

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD = 8;

// পরপর এতবার ভুল হলে অ্যাকাউন্ট এতক্ষণের জন্য লক
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

/** এক IP থেকে লগইন চেষ্টা সীমিত — brute force ঠেকাতে */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const isStrongEnough = (password) =>
  typeof password === "string" && password.trim().length >= MIN_PASSWORD;

/* =========================
   প্রথম mother অ্যাডমিন
   ========================= */

/**
 * ডেটাবেসে একটাও অ্যাডমিন না থাকলেই কেবল কাজ করে। একবার অ্যাডমিন
 * তৈরি হয়ে গেলে এই রুট চিরতরে বন্ধ, তাই খোলা থাকলেও ঝুঁকি নেই।
 */
router.post("/create-first-time", async (req, res) => {
  try {
    const totalAdmins = await Admin.estimatedDocumentCount();

    if (totalAdmins > 0) {
      return errorResponse(res, "First admin already created", 403);
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    if (!isStrongEnough(password)) {
      return errorResponse(
        res,
        `Password must be at least ${MIN_PASSWORD} characters`,
        400,
      );
    }

    const admin = await Admin.create({
      email: String(email).toLowerCase().trim(),
      password: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: "mother",
      permissions: [],
    });

    return successResponse(
      res,
      "First mother admin created successfully",
      { admin: admin.toSafeJSON() },
      201,
    );
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   লগইন
   ========================= */
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return errorResponse(res, "Email and password required", 400);
    }

    const admin = await Admin.findOne({
      email: String(email).toLowerCase().trim(),
    }).select("+password +failedLoginAttempts +lockedUntil");

    // অ্যাকাউন্ট নেই আর পাসওয়ার্ড ভুল — একই বার্তা, যাতে কোন ইমেইল
    // আছে সেটা বাইরে থেকে যাচাই করা না যায়
    if (!admin) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      const minutes = Math.ceil((admin.lockedUntil - Date.now()) / 60000);

      return errorResponse(
        res,
        `Account locked. Try again in ${minutes} minute(s).`,
        423,
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;

      if (admin.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000);
        admin.failedLoginAttempts = 0;
      }

      await admin.save();

      return errorResponse(res, "Invalid email or password", 401);
    }

    if (!admin.isActive) {
      return errorResponse(res, "This admin account is disabled", 403);
    }

    admin.failedLoginAttempts = 0;
    admin.lockedUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    return successResponse(res, "Login successful", {
      token,
      admin: admin.toSafeJSON(),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   নিজের প্রোফাইল
   ========================= */
router.get("/profile", protectAdmin, async (req, res) => {
  return successResponse(res, "Profile loaded", {
    admin: req.admin.toSafeJSON(),
  });
});

router.put("/profile", protectAdmin, requireWrite, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};

    const admin = await Admin.findById(req.admin._id).select("+password");

    if (!admin) {
      return errorResponse(res, "Admin not found", 404);
    }

    const nextEmail =
      typeof email === "string" && email.trim()
        ? email.toLowerCase().trim()
        : admin.email;

    const wantEmailChange = nextEmail !== admin.email;
    const wantPasswordChange =
      typeof newPassword === "string" && newPassword.trim().length > 0;

    if (!wantEmailChange && !wantPasswordChange) {
      return errorResponse(res, "Nothing to update", 400);
    }

    if (!currentPassword) {
      return errorResponse(res, "Current password is required", 400);
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    if (wantEmailChange) {
      const exists = await Admin.findOne({ email: nextEmail });

      if (exists && String(exists._id) !== String(admin._id)) {
        return errorResponse(res, "Email already in use", 409);
      }

      admin.email = nextEmail;
    }

    if (wantPasswordChange) {
      if (!isStrongEnough(newPassword)) {
        return errorResponse(
          res,
          `New password must be at least ${MIN_PASSWORD} characters`,
          400,
        );
      }

      admin.password = await bcrypt.hash(newPassword.trim(), BCRYPT_ROUNDS);
    }

    await admin.save();

    return successResponse(res, "Profile updated successfully", {
      admin: admin.toSafeJSON(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, "Email already exists", 409);
    }

    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন ব্যবস্থাপনা (শুধু mother)
   ========================= */
router.get("/admins", protectAdmin, requireMother, async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("_id email role permissions isActive lastLoginAt createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse(res, "Admins loaded successfully", { admins });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/admins",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const { email, password, role, permissions } = req.body || {};

      if (!email || !password) {
        return errorResponse(res, "Email and password required", 400);
      }

      if (!isStrongEnough(password)) {
        return errorResponse(
          res,
          `Password must be at least ${MIN_PASSWORD} characters`,
          400,
        );
      }

      const normalizedEmail = String(email).toLowerCase().trim();

      if (await Admin.exists({ email: normalizedEmail })) {
        return errorResponse(res, "Admin already exists", 409);
      }

      const finalRole = ["mother", "viewer"].includes(role) ? role : "sub";

      const admin = await Admin.create({
        email: normalizedEmail,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
        role: finalRole,
        // mother ও viewer সব পেজেই ঢোকে, তাই আলাদা তালিকা লাগে না
        permissions:
          finalRole === "sub" && Array.isArray(permissions) ? permissions : [],
      });

      return successResponse(
        res,
        "Admin created successfully",
        { admin: admin.toSafeJSON() },
        201,
      );
    } catch (error) {
      if (error?.code === 11000) {
        return errorResponse(res, "Email already exists", 409);
      }

      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/admins/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const { email, role, permissions, newPassword, isActive } = req.body || {};

      const target = await Admin.findById(req.params.id);

      if (!target) {
        return errorResponse(res, "Admin not found", 404);
      }

      const isSelf = String(target._id) === String(req.admin._id);

      // নিজের role বা isActive বদলে ফেললে নিজেকেই বের করে দেওয়ার
      // ঝুঁকি থাকে, তাই সেটা আটকানো
      if (isSelf && (role !== undefined || isActive !== undefined)) {
        return errorResponse(
          res,
          "You cannot change your own role or status",
          400,
        );
      }

      if (typeof email === "string" && email.trim()) {
        const normalizedEmail = email.toLowerCase().trim();

        const exists = await Admin.findOne({ email: normalizedEmail });

        if (exists && String(exists._id) !== String(target._id)) {
          return errorResponse(res, "Email already in use", 409);
        }

        target.email = normalizedEmail;
      }

      if (typeof role === "string") {
        target.role = ["mother", "viewer"].includes(role) ? role : "sub";

        if (target.role !== "sub") {
          target.permissions = [];
        }
      }

      if (Array.isArray(permissions) && target.role === "sub") {
        target.permissions = permissions;
      }

      if (typeof isActive === "boolean") {
        target.isActive = isActive;
      }

      if (typeof newPassword === "string" && newPassword.trim()) {
        if (!isStrongEnough(newPassword)) {
          return errorResponse(
            res,
            `New password must be at least ${MIN_PASSWORD} characters`,
            400,
          );
        }

        target.password = await bcrypt.hash(
          newPassword.trim(),
          BCRYPT_ROUNDS,
        );

        // পাসওয়ার্ড বদলালে আগের লক আর ব্যর্থ গণনা মুছে যায়
        target.failedLoginAttempts = 0;
        target.lockedUntil = null;
      }

      await target.save();

      return successResponse(res, "Admin updated successfully", {
        admin: target.toSafeJSON(),
      });
    } catch (error) {
      if (error?.code === 11000) {
        return errorResponse(res, "Email already exists", 409);
      }

      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/admins/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const target = await Admin.findById(req.params.id);

      if (!target) {
        return errorResponse(res, "Admin not found", 404);
      }

      if (String(target._id) === String(req.admin._id)) {
        return errorResponse(res, "You cannot delete your own account", 400);
      }

      // শেষ mother অ্যাডমিন মুছে গেলে প্যানেলে আর কেউ ঢুকতে পারবে না
      if (target.role === "mother") {
        const motherCount = await Admin.countDocuments({ role: "mother" });

        if (motherCount <= 1) {
          return errorResponse(res, "Cannot delete the last mother admin", 400);
        }
      }

      await Admin.deleteOne({ _id: target._id });

      return successResponse(res, "Admin deleted successfully");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
