import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { siteData } from "../../data/siteData";

// TODO(server): server তৈরি হলে static import সরিয়ে এই লাইনটা ব্যবহার হবে —
// const res = await api.get("/api/global/client/site-data");
// return res?.data?.data || {};
export const fetchGlobalClientData = createAsyncThunk(
  "global/fetchGlobalClientData",
  async (_, { rejectWithValue }) => {
    try {
      return siteData;
    } catch (error) {
      return rejectWithValue(error?.message || "Global data load failed");
    }
  },
);

const initialState = {
  siteIdentify: null,
  notice: null,
  sliders: [],
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
