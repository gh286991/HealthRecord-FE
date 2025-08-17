"use client";

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { workoutApi } from './workoutApi';
import { authApiRtk } from './authApi';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    [workoutApi.reducerPath]: workoutApi.reducer,
    [authApiRtk.reducerPath]: authApiRtk.reducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().concat(workoutApi.middleware, authApiRtk.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

setupListeners(store.dispatch);


