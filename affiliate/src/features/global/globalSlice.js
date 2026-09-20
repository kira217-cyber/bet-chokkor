import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { affiliateData } from "../../data/affiliateData";
import { api } from "../../api/axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const img = (u) => (!u ? "" : u.startsWith("http") ? u : `${API_URL}${u}`);

/**
 * অ্যাফিলিয়েট সাইটের ডেটা — বেশিরভাগ স্ট্যাটিক, কিন্তু পরিচয় (লোগো,
 * favicon, টাইটেল) ও ফুটার অ্যাডমিন থেকে (সার্ভার) আসে। এই কলটাই লোডার
 * দেখানোর আসল কারণ; সার্ভার না পেলে স্ট্যাটিকটাই থাকে, সাইট খালি হয় না।
 */
export const fetchAffiliateData = createAsyncThunk(
  "global/fetchAffiliateData",
  async () => {
    // পরিচয় শুধুই অ্যাডমিন থেকে — কোনো স্ট্যাটিক ফলব্যাক নেই
    const base = {
      ...affiliateData,
      footer: null,
      siteIdentify: { siteName: "", logo: "", brandLogo: "", favicon: "" },
      home: null,
      auth: null,
    };

    try {
      const res = await api.get("/api/site-settings/affiliate/public");
      const { identify, footer } = res?.data?.data || {};

      if (identify) {
        base.siteIdentify = {
          siteName: identify.siteName || "",
          logo: identify.logo ? img(identify.logo) : "",
          brandLogo: identify.brandLogo ? img(identify.brandLogo) : "",
          favicon: identify.favicon ? img(identify.favicon) : "",
        };
      }

      if (footer) {
        base.footer = {
          logo: footer.logo ? img(footer.logo) : "",
          description: footer.description,
          copyright: footer.copyright,
          ageNotice: footer.ageNotice,
        };
      }
    } catch {
      // সার্ভার না পেলে স্ট্যাটিকটাই থাকে
    }

    // হোম পেজের কনটেন্ট (admin থেকে; খালি হলে কম্পোনেন্ট স্ট্যাটিক দেখায়)
    try {
      const res = await api.get("/api/affiliate-home/public");
      const h = res?.data?.data || null;
      if (h) {
        if (h.hero) {
          h.hero.desktopImage = img(h.hero.desktopImage);
          h.hero.mobileImage = img(h.hero.mobileImage);
        }
        if (Array.isArray(h.providers?.items)) {
          h.providers.items = h.providers.items.map((p) => ({
            ...p,
            image: img(p.image),
          }));
        }
        base.home = h;
      }
    } catch {
      // হোম কনটেন্ট না পেলে স্ট্যাটিকটাই থাকে
    }

    // Login/Register পেজের কনটেন্ট (admin থেকে)
    try {
      const res = await api.get("/api/affiliate-auth/public");
      const a = res?.data?.data || null;
      if (a) {
        ["login", "register", "forgot"].forEach((k) => {
          if (a[k]?.image) a[k].image = img(a[k].image);
        });
        base.auth = a;
      }
    } catch {
      // না পেলে স্ট্যাটিকটাই থাকে
    }

    return base;
  },
);

const initialState = {
  siteIdentify: null,
  footer: null,
  stats: [],
  commissionTiers: [],
  steps: [],
  features: [],
  providers: [],
  faqs: [],
  home: null,
  auth: null,

  loading: false,
  loaded: false,
  error: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    clearGlobalData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAffiliateData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAffiliateData.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.siteIdentify = data.siteIdentify || null;
        state.footer = data.footer || null;
        state.stats = data.stats || [];
        state.commissionTiers = data.commissionTiers || [];
        state.steps = data.steps || [];
        state.features = data.features || [];
        state.providers = data.providers || [];
        state.faqs = data.faqs || [];
        state.home = data.home || null;
        state.auth = data.auth || null;

        state.loading = false;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchAffiliateData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Affiliate data load failed";
      });
  },
});

export const { clearGlobalData } = globalSlice.actions;

export default globalSlice.reducer;
