import express from "express";

import DepositMethod from "../models/DepositMethod.js";
import DepositFieldConfig from "../models/DepositFieldConfig.js";
import DepositBonusTurnover from "../models/DepositBonusTurnover.js";
import {
  protectAdmin,
  requireMother,
  requireWrite,
} from "../middleware/protectAdmin.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { num } from "../utils/depositCalc.js";

const router = express.Router();

const text = (value) => String(value ?? "").trim();

const langText = (input = {}, current = {}) => ({
  bn: text(input?.bn) || current?.bn || "",
  en: text(input?.en) || current?.en || "",
});

const cleanContacts = (list) => {
  if (!Array.isArray(list)) return [];

  return list
    .map((item, index) => ({
      id: text(item?.id) || `contact-${Date.now()}-${index}`,
      label: langText(item?.label),
      number: text(item?.number),
      isActive: item?.isActive !== false,
      sort: num(item?.sort ?? index),
    }))
    .filter((item) => item.number);
};

/* =========================
   ক্লায়েন্ট
   ========================= */

/**
 * ডিপোজিট পেজের সব তথ্য একসাথে।
 *
 * মেথড, ফর্মের ঘর আর বোনাসের নিয়ম — তিনটে আলাদা কালেকশনে থাকলেও
 * ক্লায়েন্ট একবারেই সব পায়, তাই পেজ খুলতে তিনটে রিকোয়েস্ট লাগে না।
 */
router.get("/public", async (req, res) => {
  try {
    const methods = await DepositMethod.find({ isActive: true })
      .sort({ sort: 1, createdAt: 1 })
      .lean();

    const ids = methods.map((method) => method._id);

    const [fieldConfigs, bonusConfigs] = await Promise.all([
      DepositFieldConfig.find({ depositMethod: { $in: ids } }).lean(),
      DepositBonusTurnover.find({ depositMethod: { $in: ids } }).lean(),
    ]);

    const fieldMap = new Map(
      fieldConfigs.map((item) => [String(item.depositMethod), item]),
    );
    const bonusMap = new Map(
      bonusConfigs.map((item) => [String(item.depositMethod), item]),
    );

    const data = methods.map((method) => {
      const fieldConfig = fieldMap.get(String(method._id));
      const bonusConfig = bonusMap.get(String(method._id));

      return {
        ...method,
        // বন্ধ নম্বর বা চ্যানেল ক্লায়েন্টে যায় না
        contacts: (method.contacts || []).filter((c) => c.isActive !== false),
        instructions: fieldConfig?.instructions || { bn: "", en: "" },
        inputs: fieldConfig?.inputs || [],
        turnoverMultiplier: num(bonusConfig?.turnoverMultiplier ?? 1) || 1,
        channels: (bonusConfig?.channels || []).filter(
          (c) => c.isActive !== false,
        ),
        promotions: (bonusConfig?.promotions || [])
          .filter((p) => p.isActive !== false)
          .sort((a, b) => num(a.sort) - num(b.sort)),
      };
    });

    return successResponse(res, "Deposit methods loaded", { methods: data });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

/* =========================
   অ্যাডমিন
   ========================= */

router.get("/", protectAdmin, async (req, res) => {
  try {
    const methods = await DepositMethod.find()
      .sort({ sort: 1, createdAt: 1 })
      .lean();

    return successResponse(res, "Methods loaded", { methods });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

router.post(
  "/",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const body = req.body || {};
      const methodId = text(body.methodId).toLowerCase();

      if (!methodId) return errorResponse(res, "Method id is required", 400);

      if (await DepositMethod.exists({ methodId })) {
        return errorResponse(res, "This method id already exists", 409);
      }

      const method = await DepositMethod.create({
        methodId,
        methodName: langText(body.methodName),
        methodType: body.methodType === "personal" ? "personal" : "agent",
        group: ["crypto", "bank"].includes(body.group) ? body.group : "ewallet",
        logoUrl: text(body.logoUrl),
        minDepositAmount: Math.max(0, num(body.minDepositAmount)),
        maxDepositAmount: Math.max(0, num(body.maxDepositAmount)),
        contacts: cleanContacts(body.contacts),
        sort: Math.max(0, num(body.sort)),
        isActive: body.isActive !== false,
      });

      return successResponse(res, "Method created", { method }, 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.put(
  "/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const method = await DepositMethod.findById(req.params.id);

      if (!method) return errorResponse(res, "Method not found", 404);

      const body = req.body || {};

      if (body.methodName) {
        method.methodName = langText(body.methodName, method.methodName);
      }
      if (body.methodType) {
        method.methodType = body.methodType === "personal" ? "personal" : "agent";
      }
      if (body.group && ["ewallet", "crypto", "bank"].includes(body.group)) {
        method.group = body.group;
      }
      if (body.logoUrl !== undefined) method.logoUrl = text(body.logoUrl);
      if (body.minDepositAmount !== undefined) {
        method.minDepositAmount = Math.max(0, num(body.minDepositAmount));
      }
      if (body.maxDepositAmount !== undefined) {
        method.maxDepositAmount = Math.max(0, num(body.maxDepositAmount));
      }
      if (Array.isArray(body.contacts)) {
        method.contacts = cleanContacts(body.contacts);
      }
      if (body.sort !== undefined) method.sort = Math.max(0, num(body.sort));
      if (typeof body.isActive === "boolean") method.isActive = body.isActive;

      await method.save();

      return successResponse(res, "Method updated", { method });
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

router.delete(
  "/:id",
  protectAdmin,
  requireMother,
  requireWrite,
  async (req, res) => {
    try {
      const method = await DepositMethod.findById(req.params.id);

      if (!method) return errorResponse(res, "Method not found", 404);

      // মেথডের সাথে তার ফর্ম ও বোনাসের নিয়মও যায় — নইলে অনাথ কনফিগ
      // পড়ে থাকত যা কোনো পেজেই আর দেখা যেত না
      await Promise.all([
        DepositMethod.deleteOne({ _id: method._id }),
        DepositFieldConfig.deleteOne({ depositMethod: method._id }),
        DepositBonusTurnover.deleteOne({ depositMethod: method._id }),
      ]);

      return successResponse(res, "Method deleted");
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },
);

export default router;
