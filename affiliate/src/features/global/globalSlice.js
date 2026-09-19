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
