import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { gameData } from "../../data/gameData";

/** সার্ভারের প্রক্সি — আসল কী সার্ভারে থাকে, ব্রাউজারে কখনো আসে না */
const GAME_PROXY_API = "/api/admin/game-api-key/client";

/**
 * ক্যাটাগরি, প্রোভাইডার ও ফিচার্ড গেম আনে।
 *
 * অ্যাডমিনে গেম API key বসানো না থাকলে (বা সার্ভার বন্ধ থাকলে) সাইট
 * আগের মতোই স্ট্যাটিক ডেটা দেখায় — এই thunk কখনো reject করে না, তাই
 * কী বসার আগে-পরে হোম পেজ একইভাবে চলে, কোথাও ভাঙে না।
 */
export const fetchGlobalGameData = createAsyncThunk(
  "globalGame/fetchGlobalGameData",
  async () => {
    try {
      const res = await api.get(`${GAME_PROXY_API}/game-data`);
      const payload = res?.data?.data;
      const live = payload?.configured ? payload.data : null;

      if (!live || !Array.isArray(live.gameCategories) || !live.gameCategories.length) {
        return { ...gameData, source: "static" };
      }

      // master এর কোনো তালিকা খালি এলে সেটুকু স্ট্যাটিক থেকেই নেওয়া হয়,
      // যাতে হোম পেজে ফাঁকা সেকশন না দেখায়
      return {
        gameCategories: live.gameCategories,
        homeProviders: live.homeProviders?.length
          ? live.homeProviders
          : gameData.homeProviders,
        featuredGames: live.featuredGames?.length
          ? live.featuredGames
          : gameData.featuredGames,
        // master ইভেন্ট দেয় না — এটা আমাদের নিজের তালিকা
        events: gameData.events,
        source: "live",
      };
    } catch {
      // সার্ভার বন্ধ বা নেটওয়ার্ক সমস্যা — সাইট তবু চলবে
      return { ...gameData, source: "static" };
    }
  },
);

const initialState = {
  categories: [],
  homeProviders: [],
  featuredGames: [],
  events: [],

  // "live" মানে master থেকে, "static" মানে বিল্ট-ইন নমুনা ডেটা
  source: "static",

  loading: false,
  loaded: false,
  error: null,
};

const globalGameSlice = createSlice({
  name: "globalGame",
  initialState,
  reducers: {
    clearGlobalGameError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalGameData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalGameData.fulfilled, (state, action) => {
        const data = action.payload || {};

        state.loading = false;
        state.loaded = true;

        state.categories = Array.isArray(data.gameCategories)
          ? data.gameCategories
          : [];
        state.homeProviders = Array.isArray(data.homeProviders)
          ? data.homeProviders
          : [];
        state.featuredGames = Array.isArray(data.featuredGames)
          ? data.featuredGames
          : [];
        state.events = Array.isArray(data.events) ? data.events : [];
        state.source = data.source || "static";
      })
      .addCase(fetchGlobalGameData.rejected, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.error = action.payload || "Failed to load game data";
      });
  },
});

export const { clearGlobalGameError } = globalGameSlice.actions;

export default globalGameSlice.reducer;
