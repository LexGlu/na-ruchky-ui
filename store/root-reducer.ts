import { combineReducers } from "@reduxjs/toolkit";

import { authSlice } from "@/store/auth/auth.slice";

export const rootReducer = combineReducers({
  auth: authSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
