# BetChokkor — Client

মূল সাইট (প্লেয়ার ফেসিং)। React 19 + Vite 7 + Tailwind v4 + Redux Toolkit,
চলে `localhost:5173` এ।

## চালানো

```bash
cd client
npm install
cp .env.example .env     # VITE_API_URL এ সার্ভারের ঠিকানা
npm run dev              # http://localhost:5173
```

সার্ভার ছাড়াও সাইট চলে — নিচের "গেম ডেটা" অংশ দেখুন।

## পেজ

| পাথ | কী |
| --- | --- |
| `/` | হোম — ব্যানার, ক্যাটাগরি, ভেন্ডর, প্রোভাইডার, ম্যাচ অডস, ইভেন্ট, ফিচার্ড গেমস |
| `/games/:category?vendor=` | গেম লিস্ট — যেকোনো ক্যাটাগরি বা প্রোভাইডারে ক্লিক করলে এখানেই আসে |
| `/login`, `/register`, `/forgot-password` | অথ পেজ (সাইডবার-ফুটার ছাড়া) |

## ভাষা

সব লেখা বাংলা ও ইংরেজি দুটোতেই — `src/data/locale.js` এ, আর
`Context/LanguageProvider.jsx` এর `t(key)` / `tv({bn, en})` দিয়ে ব্যবহার।
নেভবারের পতাকায় ক্লিক করে ভাষা বদলায়।

## সাইজিং

`src/index.css` এ `--u` বেস ইউনিট: মোবাইলে `1vw` (স্ক্রিনের সাথে স্কেল
করে), ৪৮০px এর উপরে ফিক্সড `3.75px`। মূল সাইটের সব মাপ এই এককেই নেওয়া,
তাই `calc(var(--u) * N)` দেখলে বুঝতে হবে সংখ্যাটা মূল সাইট থেকে মাপা।

## গেম ডেটা কোথা থেকে আসে

অ্যাডমিন প্যানেলের **Game API Key** পেজে white-label master এর কী বসানো
থাকলে ক্যাটাগরি, ভেন্ডর আর গেম সার্ভারের প্রক্সি দিয়ে সেখান থেকেই আসে।

কী বসানো না থাকলে (বা সার্ভার বন্ধ থাকলে) সাইট আগের মতোই
`src/data/gameData.js` ও `src/data/gameListData.js` এর বিল্ট-ইন নমুনা ডেটা
দেখায় — `globalGameSlice` এর thunk কখনো reject করে না, তাই হোম পেজ কোনো
অবস্থাতেই ভাঙে না।

`state.globalGame.source` দেখে বোঝা যায় ডেটা `"live"` না `"static"`।

গেম লিস্ট পেজে লাইভ ডেটা এলে "আরও লোড করুন" বোতাম আর "X টির মধ্যে Y টি"
গণনা দেখায় (`features/globalGame/useGameList.js`); স্ট্যাটিক ডেটায় আনার
মতো কিছু নেই বলে ওগুলো দেখানোও হয় না।

## গেম খেলা

গেম লঞ্চ এখনো তৈরি হয়নি। যেকোনো গেমে ক্লিক করলে "গেম খেলা শীঘ্রই আসছে"
মডাল দেখায় (`components/ComingSoonModal/`, state থাকে
`Context/ComingSoonProvider.jsx` এ)। ক্যাটাগরি বা ভেন্ডরে ক্লিক আগের মতোই
গেম লিস্ট পেজে নিয়ে যায়।

## অ্যাসেট

`public/assets/` এর সব ইমেজ BetChokkor এর CDN (`img.b971606.com`) থেকে
নেওয়া। নতুন অ্যাসেট লাগলে `../scripts/asset-urls.txt` এ URL যোগ করে
`node scripts/download-assets.mjs` চালাতে হবে।
