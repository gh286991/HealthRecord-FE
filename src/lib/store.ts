"use client";

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { workoutApi } from './workoutApi';
import { authApiRtk } from './authApi';
import { nutritionApiRtk } from './nutritionApi';
import authReducer from './authSlice';

import { workoutPlanApi } from './workoutPlanApi';
import { aiAdviceApi } from './aiAdviceApi';
import { legalApiRtk } from './legalApi';

export const store = configureStore({
  reducer: {
    [workoutApi.reducerPath]: workoutApi.reducer,
    [authApiRtk.reducerPath]: authApiRtk.reducer,
    [nutritionApiRtk.reducerPath]: nutritionApiRtk.reducer,
    auth: authReducer,
    [workoutPlanApi.reducerPath]: workoutPlanApi.reducer,
    [aiAdviceApi.reducerPath]: aiAdviceApi.reducer,
    [legalApiRtk.reducerPath]: legalApiRtk.reducer,
  },
  middleware: (getDefault) => getDefault().concat(
    workoutApi.middleware, 
    authApiRtk.middleware,      
    nutritionApiRtk.middleware, 
    workoutPlanApi.middleware,
    aiAdviceApi.middleware,
    legalApiRtk.middleware),
});

export type RootState = ReturnType<typeof store.getState>;


setupListeners(store.dispatch);
