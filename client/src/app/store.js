import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import globalReducer from "../features/global/globalSlice";
import globalGameReducer from "../features/globalGame/globalGameSlice";
import maintenanceReducer from "../features/maintenance/maintenanceSlice";
import notificationReducer from "../features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    global: globalReducer,
    globalGame: globalGameReducer,
    maintenance: maintenanceReducer,
    notification: notificationReducer,
  },
});

export default store;
