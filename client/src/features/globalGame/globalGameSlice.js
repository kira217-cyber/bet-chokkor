import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { gameData } from "../../data/gameData";

// TODO(server): server তৈরি হলে static import সরিয়ে game-proxy API কল হবে —
// const res = await api.get(`${GAME_PROXY_API}/game-data`);
// return res?.data?.data || {};
export const fetchGlobalGameData = createAsyncThunk(
  "globalGame/fetchGlobalGameData",
  async (_, { rejectWithValue }) => {
    try {
      return gameData;
    } catch (error) {
      return rejectWithValue(error?.message || "Failed to load game data");
    }
  },
);

const initialState = {
  categories: [],
  homeProviders: [],
  featuredGames: [],
  events: [],

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
