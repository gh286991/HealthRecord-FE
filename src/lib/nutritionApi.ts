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
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
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
    // 獲取飲食記錄列表
    getNutritionRecords: builder.query<NutritionRecord[], { date?: string }>({
      query: ({ date }) => ({
        url: '/diet-records',
        params: date ? { date } : undefined,
      }),
      providesTags: ['NutritionRecord'],
    }),

    // 獲取單一飲食記錄
    getNutritionRecord: builder.query<NutritionRecord, string>({
      query: (id) => `/diet-records/${id}`,
      providesTags: (result, error, id) => [{ type: 'NutritionRecord', id }],
    }),

    // 創建飲食記錄
    createNutritionRecord: builder.mutation<NutritionRecord, CreateNutritionRecord>({
      query: (data) => ({
        url: '/diet-records',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    // 更新飲食記錄
    updateNutritionRecord: builder.mutation<NutritionRecord, { id: string; data: UpdateNutritionRecord }>({
      query: ({ id, data }) => ({
        url: `/diet-records/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    // 刪除飲食記錄
    deleteNutritionRecord: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/diet-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NutritionRecord'],
    }),

    // 獲取每日摘要
    getDailySummary: builder.query<{
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
    }, string>({
      query: (date) => ({
        url: '/diet-records/daily-summary',
        params: { date },
      }),
      providesTags: ['NutritionRecord'],
    }),

    // 獲取有記錄的日期標記
    getMarkedDates: builder.query<string[], { year: number; month: number }>({
      query: ({ year, month }) => `/diet-records/marked-dates/${year}/${month}`,
      providesTags: ['NutritionRecord'],
    }),

    // 上傳照片
    uploadPhoto: builder.mutation<{ photoUrl: string }, { id: string; file: File }>({
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
  }),
});

// 導出 hooks
export const {
  useGetNutritionRecordsQuery,
  useCreateNutritionRecordMutation,
  useUpdateNutritionRecordMutation,
  useDeleteNutritionRecordMutation,
  useGetMarkedDatesQuery,
  useUploadPhotoMutation,
} = nutritionApiRtk;