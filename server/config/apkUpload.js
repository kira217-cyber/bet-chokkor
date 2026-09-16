import fs from "node:fs";
import path from "node:path";
import multer from "multer";

/**
 * APK আপলোড — ছবির থেকে আলাদা।
 *
 * ছবিগুলো ছোট (৫MB) আর `uploads/` এ বসে; APK বড় (১০০MB পর্যন্ত) আর
 * আলাদা ফোল্ডারে, যাতে ছবির নিয়মের সাথে মিশে না যায়।
 *
 * ডিস্কে নাম নতুন করে বানানো হয় (../ আর নাম-সংঘর্ষ ঠেকাতে), কিন্তু
 * ব্যবহারকারীর দেওয়া আসল নামটা রুট আলাদা করে সেভ করে — ডাউনলোডের
 * সময় সেই নামেই নামে।
 */
const APK_DIR = "uploads/apk";

if (!fs.existsSync(APK_DIR)) fs.mkdirSync(APK_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, APK_DIR),
  filename: (req, file, cb) =>
    cb(null, `app-${Date.now()}-${Math.round(Math.random() * 1e9)}.apk`),
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  // অ্যান্ড্রয়েড mimetype নানা রকম পাঠায়, তাই বাড়তি হিসেবে .apk এক্সটেনশনও দেখা
  const okMime =
    file.mimetype === "application/vnd.android.package-archive" ||
    file.mimetype === "application/octet-stream" ||
    file.mimetype === "application/x-zip-compressed";

  if (ext === ".apk" && okMime) return cb(null, true);

  return cb(new Error("Only .apk files are allowed"), false);
};

const apkUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default apkUpload;
