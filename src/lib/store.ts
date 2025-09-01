"use client";

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { workoutApi } from './workoutApi';
import { authApiRtk } from './authApi';
import { nutritionApiRtk } from './nutritionApi';
import authReducer from './authSlice';

import { workoutPlanApi } from './workoutPlanApi';

export const store = configureStore({
  reducer: {
    [workoutApi.reducerPath]: workoutApi.reducer,
    [authApiRtk.reducerPath]: authApiRtk.reducer,
    [nutritionApiRtk.reducerPath]: nutritionApiRtk.reducer,
    auth: authReducer,
    [workoutPlanApi.reducerPath]: workoutPlanApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(
    workoutApi.middleware, 
    authApiRtk.middleware,      
    nutritionApiRtk.middleware, 
    workoutPlanApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;


setupListeners(store.dispatch);


