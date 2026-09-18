import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { siteData } from "../../data/siteData";
import { api } from "../../api/axios";
import { imageUrl } from "../deposit/imageUrl";

/**
 * সাইটের কনটেন্ট — বেশিরভাগ স্ট্যাটিক siteData থেকে, কিন্তু স্লাইডার,
 * নোটিশ, ইভেন্ট ও প্রমোশন অ্যাডমিন প্যানেল থেকে (সার্ভার) আসে। সার্ভার
 * সাড়া না দিলে স্ট্যাটিকটাই থাকে, তাই সাইট কখনো খালি হয় না।
 */
export const fetchGlobalClientData = createAsyncThunk(
  "global/fetchGlobalClientData",
  async (_, { rejectWithValue }) => {
    const base = { ...siteData, events: [], promotions: [] };

    try {
      const res = await api.get("/api/site-content/public");
      const c = res?.data?.data || {};

      if (Array.isArray(c.sliders) && c.sliders.length) {
        base.sliders = c.sliders.map((s) => ({
          id: s._id,
          desktopImage: imageUrl(s.imageDesktop || s.imageMobile),
          mobileImage: imageUrl(s.imageMobile || s.imageDesktop),
          link: s.link || "#",
          title: { bn: "", en: "" },
        }));
      }

      if (c.notice && (c.notice.bn || c.notice.en)) {
        base.notice = { text: c.notice };
      }

      if (Array.isArray(c.events)) {
        base.events = c.events.map((e) => ({
          id: e._id,
          image: imageUrl(e.image),
          actionType: e.actionType || "none",
          linkUrl: e.linkUrl || "",
          modal: {
            title: e.modal?.title || { bn: "", en: "" },
            description: e.modal?.description || { bn: "", en: "" },
            image: imageUrl(e.modal?.image),
          },
        }));
      }

      if (Array.isArray(c.promotions)) {
        base.promotions = c.promotions.map((p) => ({
          id: p._id,
          image: imageUrl(p.image),
          title: p.title || { bn: "", en: "" },
          description: p.description || { bn: "", en: "" },
          tag: p.tag || "",
          category: p.category || "welcome-offer",
          startAt: p.startAt || null,
          endAt: p.endAt || null,
        }));
      }
    } catch {
      // সার্ভার না পেলে স্ট্যাটিকটাই থাকে
    }

    return base;
  },
);

const initialState = {
  siteIdentify: null,
  notice: null,
  sliders: [],
  events: [],
  promotions: [],
  bottomNavItems: [],
  sideNavLinks: [],
  socialLinks: [],

  footerSetting: null,

  loading: false,
  loaded: false,
  error: null,
};

const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    clearGlobalData: (state) => {
      state.siteIdentify = null;
      state.notice = null;
      state.sliders = [];
      state.events = [];
      state.promotions = [];
      state.bottomNavItems = [];
      state.sideNavLinks = [];
      state.socialLinks = [];

      state.footerSetting = null;

      state.loading = false;
      state.loaded = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalClientData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalClientData.fulfilled, (state, action) => {
        const payload = action.payload || {};

        state.siteIdentify = payload.siteIdentify || null;
        state.notice = payload.notice || null;

        state.sliders = Array.isArray(payload.sliders) ? payload.sliders : [];
        state.events = Array.isArray(payload.events) ? payload.events : [];
        state.promotions = Array.isArray(payload.promotions)
          ? payload.promotions
          : [];
        state.bottomNavItems = Array.isArray(payload.bottomNavItems)
          ? payload.bottomNavItems
          : [];
        state.sideNavLinks = Array.isArray(payload.sideNavLinks)
          ? payload.sideNavLinks
          : [];
        state.socialLinks = Array.isArray(payload.socialLinks)
          ? payload.socialLinks
          : [];

        state.footerSetting = payload.footerSetting || null;

        state.loading = false;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchGlobalClientData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Global data load failed";
      });
  },
});

export const { clearGlobalData } = globalSlice.actions;

export default globalSlice.reducer;
