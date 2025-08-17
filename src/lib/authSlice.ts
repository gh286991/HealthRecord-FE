"use client";

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { UserProfile } from '@/lib/api';

export interface AuthState {
  token: string | null;
  user: UserProfile | null;
}

const initialState: AuthState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) localStorage.setItem('token', action.payload);
        else localStorage.removeItem('token');
      }
    },
    setUser(state, action: PayloadAction<UserProfile | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      if (typeof window !== 'undefined') localStorage.removeItem('token');
    },
  },
});

export const { setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;


