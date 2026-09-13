import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { api } from "../../api/axios";

/**
 * সাইট রক্ষণাবেক্ষণে আছে কিনা।
 *
 * সার্ভারে পৌঁছাতে না পারলে মোড চালু ধরা হয় না — তাহলে নিজের সার্ভার
 * একটু ধীর হলেই সবাই "বন্ধ" দেখত। এই thunk কখনো reject করে না।
 */
export const fetchMaintenance = createAsyncThunk(
  "maintenance/fetchMaintenance",
  async () => {
    try {
      const res = await api.get("/api/maintenance/status");
      return res?.data?.data || null;
    } catch {
      return null;
    }
  },
);

const initialState = {
  isOn: false,
  title: null,
  message: null,
  loaded: false,
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,

  reducers: {
    /** API ব্যর্থ হলে ক্লায়েন্ট নিজেও মোড তুলে দিতে পারে */
    forceMaintenance: (state) => {
      state.isOn = true;
      state.loaded = true;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchMaintenance.fulfilled, (state, action) => {
        const data = action.payload;

        state.loaded = true;

        if (!data) return;

        state.isOn = Boolean(data.isOn);
        state.title = data.title || null;
        state.message = data.message || null;
      })
      .addCase(fetchMaintenance.rejected, (state) => {
        state.loaded = true;
      });
  },
});

export const { forceMaintenance } = maintenanceSlice.actions;

export default maintenanceSlice.reducer;
