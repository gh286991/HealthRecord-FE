"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api';

// 飲食記錄相關類型
export interface FoodItem {
  foodId?: string;
  foodName: string;
  description?: string;
  quantity?: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
}

export interface CreateNutritionRecord {
  date: string;
  mealType: '早餐' | '午餐' | '晚餐' | '點心';
  foods: FoodItem[];
  notes?: string;
  price?: number;
  photoUrls?: string[];
  isDraft?: boolean;
}

export interface UpdateNutritionRecord {
  date?: string;
  mealType?: '早餐' | '午餐' | '晚餐' | '點心';
  foods?: FoodItem[];
  notes?: string;
  price?: number;
  photoUrls?: string[];
  isDraft?: boolean;
}

export interface NutritionRecord {
  _id: string;
  userId: string;
  date: string;
  mealType: '早餐' | '午餐' | '晚餐' | '點心';
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  notes?: string;
  price?: number;
  photoUrls?: string[];
  photoUrl?: string; // For backward compatibility
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailySummary {
  date: string;
  records: NutritionRecord[];
  dailyTotals: {
    totalCalories: number;
    totalProtein: number;
    totalCarbohydrates: number;
    totalFat: number;
    totalFiber: number;
    totalSugar: number;
    totalSodium: number;
    mealCount: number;
  };
}



export const nutritionApiRtk = createApi({
  reducerPath: 'nutritionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['NutritionRecord'],
  endpoints: (builder) => ({
    // ... other endpoints
    getNutritionRecords: builder.query<NutritionRecord[], { date?: string }>({
      query: ({ date }) => ({
        url: '/diet-records',
        params: date ? { date } : undefined,
      }),
      providesTags: ['NutritionRecord'],
    }),

    getNutritionRecord: builder.query<NutritionRecord, string>({
      query: (id) => `/diet-records/${id}`,
      providesTags: (result, error, id) => [{ type: 'NutritionRecord', id }],
    }),

    createNutritionRecord: builder.mutation<NutritionRecord, CreateNutritionRecord>({
      query: (data) => ({
        url: '/diet-records',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    createDraftRecord: builder.mutation<NutritionRecord, CreateNutritionRecord>({
      query: (data) => ({
        url: '/diet-records/draft',
        method: 'POST',
        body: data,
      }),
    }),

    updateNutritionRecord: builder.mutation<NutritionRecord, { id: string; data: UpdateNutritionRecord }>({
      query: ({ id, data }) => ({
        url: `/diet-records/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    deleteNutritionRecord: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/diet-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    getDailySummary: builder.query<DailySummary, string>({
      query: (date) => ({
        url: '/diet-records/daily-summary',
        params: { date },
      }),
      providesTags: ['NutritionRecord'],
    }),

    getMarkedDates: builder.query<string[], { year: number; month: number }>({
      query: ({ year, month }) => `/diet-records/marked-dates/${year}/${month}`,
      providesTags: ['NutritionRecord'],
    }),

    // 上傳多張照片
    uploadPhotos: builder.mutation<{ photoUrls: string[] }, { id: string; files: File[] }>({
      query: ({ id, files }) => {
        const formData = new FormData();
        files.forEach(file => formData.append('files', file));
        return {
          url: `/diet-records/${id}/photos`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['NutritionRecord'],
    }),

    // 上傳單張照片 (舊版相容)
    uploadPhoto: builder.mutation<{ photoUrls: string[] }, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/diet-records/${id}/photo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: ['NutritionRecord'],
    }),

    // AI分析照片
    analyzePhoto: builder.mutation<{ foods: FoodItem[] }, { photoUrl: string }>({
      query: ({ photoUrl }) => ({
        url: '/diet-records/analyze-photo',
        method: 'POST',
        body: { photoUrl },
      }),
    }),
  }),
});

// 導出 hooks
export const {
  useGetNutritionRecordsQuery,
  useCreateNutritionRecordMutation,
  useCreateDraftRecordMutation,
  useUpdateNutritionRecordMutation,
  useDeleteNutritionRecordMutation,
  useGetMarkedDatesQuery,
  useUploadPhotosMutation,
  useUploadPhotoMutation, // Added back for compatibility
  useAnalyzePhotoMutation,
} = nutritionApiRtk;