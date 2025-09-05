"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RegisterData, LoginData, UserProfile, UpdateUserData } from '@/lib/api';
import { BodyRecord } from '@/types/body-record';
import { API_BASE_URL } from '@/lib/api';

// 使用共用的 API_BASE_URL，避免不同檔案 fallback 不一致

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
  tagTypes: ['Profile', 'BodyRecords'],
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
    updateProfile: builder.mutation<UserProfile, Partial<UpdateUserData>>({
      query: (body) => ({ url: '/auth/profile', method: 'PATCH', body }),
      invalidatesTags: ['Profile'],
    }),
    getBodyRecords: builder.query<BodyRecord[], void>({
      query: () => '/body-record',
      providesTags: ['BodyRecords'],
    }),
    addBodyRecord: builder.mutation<BodyRecord, Partial<BodyRecord>>({
      query: (body) => ({ url: '/body-record', method: 'POST', body }),
      invalidatesTags: ['BodyRecords', 'Profile'],
    }),
    deleteBodyRecord: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/body-record/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BodyRecords', 'Profile'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetBodyRecordsQuery,
  useAddBodyRecordMutation,
  useDeleteBodyRecordMutation,
} = authApiRtk;


