"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RegisterData, LoginData, UserProfile, UpdateUserData } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

export const authApiRtk = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    register: builder.mutation<{ message: string }, RegisterData>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<{ accessToken: string; user?: UserProfile }, LoginData>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateUserData>({
      query: (body) => ({ url: '/auth/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApiRtk;


