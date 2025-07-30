import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { rootReducer, type RootState } from "@/store/root-reducer";

// Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
  transforms: [
    // Transform to exclude certain fields from persistence
    {
      in: (inboundState: any) => {
        // Don't persist loading states and errors
        if (inboundState?.auth) {
          return {
            ...inboundState,
            auth: {
              ...inboundState.auth,
              loading: false,
              error: null,
              modals: {
                isAuthModalOpen: false,
                isLogoutModalOpen: false,
              },
            },
          };
        }
        return inboundState;
      },
      out: (outboundState: any) => outboundState,
    },
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export const persistor = persistStore(store);

// Export types
export type { RootState };
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

// Typed hooks
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Store instance type
export default store;
