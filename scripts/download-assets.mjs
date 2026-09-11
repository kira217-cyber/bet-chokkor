/**
 * BetChokkor asset downloader
 *
 * asset-urls.txt এ থাকা প্রতিটা CDN URL ডাউনলোড করে
 * client/public/assets/ এর ভিতরে সোর্স path structure ধরে রেখে সেভ করে।
 *
 *   node scripts/download-assets.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const URL_FILE = path.join(__dirname, "asset-urls.txt");
const OUT_DIR = path.join(ROOT, "client", "public", "assets");

// CDN path → public/assets এর ভিতরের ছোট, পড়ার মতো path
const PATH_MAP = [
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/vendor-type\/for-dark\//, "vendors/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/menu-type\/active\//, "icons/menu/colored/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/menu-type\/inactive\//, "icons/menu/chrome/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/menu-type\//, "icons/menu/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/utility-type\//, "icons/utility/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/trivial-type\//, "icons/trivial/"],
  [/^b06\/h5\/assets\/v3\/images\/icon-set\/flag-type\//, "icons/flag/"],
  [/^b06\/h5\/assets\/v3\/images\/account-landing\//, "auth/"],
  [/^b06\/h5\/assets\/v3\/images\/rotating-phone\//, "misc/"],
  [/^b06\/h5\/assets\/v3\/images\//, "brand/"],
  [/^b06\/h5\/assets\/images\/footer\//, "footer/"],
  [/^b06\/h5\/assets\/images\/icons\//, "icons/pwa/"],
  [/^b06\/h5\/assets\/images\/animation\//, "misc/"],
  [/^upload\/game\/AWCV2_JILI\//, "games/jili/"],
  [/^upload\/h5Announcement\//, "banners/mobile/"],
  [/^upload\/announcement\//, "banners/desktop/"],
  [/^upload\/cstool\/.*\//, "misc/"],
];

const toLocalPath = (url) => {
  const rel = new URL(url).pathname.replace(/^\/+/, "");

  for (const [pattern, replacement] of PATH_MAP) {
    if (pattern.test(rel)) {
      return replacement + rel.split("/").pop();
    }
  }

  return "misc/" + rel.split("/").pop();
};

const download = async (url) => {
  const target = path.join(OUT_DIR, toLocalPath(url));

  await fs.mkdir(path.dirname(target), { recursive: true });

  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Referer: "https://betchokkor.com/",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  await fs.writeFile(target, Buffer.from(await res.arrayBuffer()));

  return path.relative(OUT_DIR, target).split(path.sep).join("/");
};

const run = async () => {
  const urls = (await fs.readFile(URL_FILE, "utf8"))
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  console.log(`${urls.length} টা অ্যাসেট ডাউনলোড হচ্ছে...\n`);

  let ok = 0;
  const failed = [];

  // একসাথে ১০টার বেশি রিকোয়েস্ট নয় — CDN rate limit এড়াতে
  for (let i = 0; i < urls.length; i += 10) {
    const batch = urls.slice(i, i + 10);

    await Promise.all(
      batch.map(async (url) => {
        try {
          await download(url);
          ok += 1;
        } catch (error) {
          failed.push(`${url} → ${error.message}`);
        }
      }),
    );
  }

  console.log(`✔ সফল: ${ok}`);

  if (failed.length) {
    console.log(`✘ ব্যর্থ: ${failed.length}`);
    failed.forEach((line) => console.log("  " + line));
  }
};

run();
