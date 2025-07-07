import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  RegisterData,
  LoginData,
  UserProfile,
  UpdateUserData,
  AuthResponse,
  Food,
  FoodQueryParams,
  NutritionRecord,
  CreateNutritionRecord,
  UpdateNutritionRecord,
  DailyNutritionResponse,
  NutritionSummary,
  NutritionQueryParams,
  WeeklyStatsResponse,
  MonthlyStatsResponse,
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devhealthjapi.zeabur.app'

export const healthApi = createApi({
  reducerPath: 'healthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // 自動添加 JWT token
      const token = localStorage.getItem('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      headers.set('content-type', 'application/json')
      return headers
    },
  }),
  tagTypes: ['User', 'NutritionRecord', 'Food', 'Stats'],
  endpoints: (builder) => ({
    // ========== 認證相關 API ==========
    register: builder.mutation<{ message: string }, RegisterData>({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),

    login: builder.mutation<AuthResponse, LoginData>({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    getUserProfile: builder.query<UserProfile, void>({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<UserProfile, UpdateUserData>({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // ========== 食物相關 API ==========
    getFoods: builder.query<Food[], FoodQueryParams>({
      query: (params = {}) => ({
        url: '/foods',
        params,
      }),
      providesTags: ['Food'],
    }),

    getFoodCategories: builder.query<string[], void>({
      query: () => '/foods/categories',
      providesTags: ['Food'],
    }),

    getFoodById: builder.query<Food, string>({
      query: (id) => `/foods/${id}`,
      providesTags: (result, error, id) => [{ type: 'Food', id }],
    }),

    createFood: builder.mutation<Food, Omit<Food, '_id' | 'createdAt' | 'updatedAt' | '__v'>>({
      query: (data) => ({
        url: '/foods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Food'],
    }),

    updateFood: builder.mutation<Food, { id: string; data: Partial<Food> }>({
      query: ({ id, data }) => ({
        url: `/foods/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Food', id }, 'Food'],
    }),

    deleteFood: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/foods/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Food', id }, 'Food'],
    }),

    // ========== 營養記錄相關 API ==========
    getNutritionRecords: builder.query<DailyNutritionResponse, NutritionQueryParams>({
      query: (params = {}) => ({
        url: '/diet-records',
        params,
      }),
      providesTags: ['NutritionRecord'],
      transformResponse: (response: unknown, meta, arg) => {
        // 處理 API 回應格式
        if (Array.isArray(response)) {
          // 如果 API 直接回傳陣列，需要轉換為 DailyNutritionResponse 格式
          const records = response as NutritionRecord[]
          const dailyTotals = records.reduce((totals, record) => ({
            totalCalories: totals.totalCalories + record.totalCalories,
            totalProtein: totals.totalProtein + record.totalProtein,
            totalCarbohydrates: totals.totalCarbohydrates + record.totalCarbohydrates,
            totalFat: totals.totalFat + record.totalFat,
            totalFiber: totals.totalFiber + record.totalFiber,
            totalSugar: totals.totalSugar + record.totalSugar,
            totalSodium: totals.totalSodium + record.totalSodium,
            mealCount: totals.mealCount + 1,
          }), {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbohydrates: 0,
            totalFat: 0,
            totalFiber: 0,
            totalSugar: 0,
            totalSodium: 0,
            mealCount: 0,
          })

          return {
            date: arg.date || new Date().toISOString().split('T')[0],
            records,
            dailyTotals,
          }
        }
        return response as DailyNutritionResponse
      },
    }),

    getNutritionRecordById: builder.query<NutritionRecord, string>({
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

    createNutritionRecordWithPhoto: builder.mutation<NutritionRecord, { data: CreateNutritionRecord; photo?: File }>({
      query: ({ data, photo }) => {
        const formData = new FormData()
        formData.append('date', data.date)
        formData.append('mealType', data.mealType)
        formData.append('foods', JSON.stringify(data.foods))
        if (data.notes) {
          formData.append('notes', data.notes)
        }
        if (photo) {
          formData.append('file', photo)
        }

        return {
          url: '/diet-records/with-photo',
          method: 'POST',
          body: formData,
          formData: true,
        }
      },
      invalidatesTags: ['NutritionRecord'],
    }),

    updateNutritionRecord: builder.mutation<NutritionRecord, { id: string; data: UpdateNutritionRecord }>({
      query: ({ id, data }) => ({
        url: `/diet-records/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'NutritionRecord', id }, 'NutritionRecord'],
    }),

    deleteNutritionRecord: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/diet-records/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'NutritionRecord', id }, 'NutritionRecord'],
    }),

    getNutritionSummary: builder.query<NutritionSummary, string>({
      query: (date) => ({
        url: '/diet-records/daily-summary',
        params: { date },
      }),
      providesTags: ['NutritionRecord'],
    }),

    uploadNutritionPhoto: builder.mutation<{ photoUrl: string }, { id: string; photo: File }>({
      query: ({ id, photo }) => {
        const formData = new FormData()
        formData.append('file', photo)

        return {
          url: `/diet-records/${id}/photo`,
          method: 'POST',
          body: formData,
          formData: true,
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'NutritionRecord', id }],
    }),

    // ========== 統計相關 API ==========
    getWeeklyStats: builder.query<WeeklyStatsResponse, string>({
      query: (startDate) => `/nutrition/stats/weekly/${startDate}`,
      providesTags: ['Stats'],
    }),

    getMonthlyStats: builder.query<MonthlyStatsResponse, { year: number; month: number }>({
      query: ({ year, month }) => `/nutrition/stats/monthly/${year}/${month}`,
      providesTags: ['Stats'],
    }),
  }),
})

// 導出自動生成的 hooks
export const {
  // 認證相關
  useRegisterMutation,
  useLoginMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  
  // 食物相關
  useGetFoodsQuery,
  useGetFoodCategoriesQuery,
  useGetFoodByIdQuery,
  useCreateFoodMutation,
  useUpdateFoodMutation,
  useDeleteFoodMutation,
  
  // 營養記錄相關
  useGetNutritionRecordsQuery,
  useGetNutritionRecordByIdQuery,
  useCreateNutritionRecordMutation,
  useCreateNutritionRecordWithPhotoMutation,
  useUpdateNutritionRecordMutation,
  useDeleteNutritionRecordMutation,
  useGetNutritionSummaryQuery,
  useUploadNutritionPhotoMutation,
  
  // 統計相關
  useGetWeeklyStatsQuery,
  useGetMonthlyStatsQuery,
} = healthApi 