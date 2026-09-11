export const selectGlobalGame = (state) => state.globalGame;

export const selectGameCategories = (state) => state.globalGame.categories;
export const selectHomeProviders = (state) => state.globalGame.homeProviders;
export const selectFeaturedGames = (state) => state.globalGame.featuredGames;
export const selectEvents = (state) => state.globalGame.events;

export const selectGlobalGameLoading = (state) => state.globalGame.loading;
export const selectGlobalGameLoaded = (state) => state.globalGame.loaded;
export const selectGlobalGameError = (state) => state.globalGame.error;
