import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { affiliateData } from "../../data/affiliateData";

// TODO(server): server তৈরি হলে static import সরিয়ে API কল হবে —
// const res = await api.get("/api/global/affiliate/site-data");
// return res?.data?.data || {};
export const fetchAffiliateData = createAsyncThunk(
  "global/fetchAffiliateData",
  async (_, { rejectWithValue }) => {
    try {
      return affiliateData;
    } catch (error) {
      return rejectWithValue(error?.message || "Affiliate data load failed");
    }
  },
);

const initialState = {
  siteIdentify: null,
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
