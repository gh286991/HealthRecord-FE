"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '@/lib/api';

// 使用共用的 API_BASE_URL，避免不同檔案 fallback 不一致

// 運動類型枚舉（與後端保持一致）
export enum WorkoutType {
  Resistance = 'resistance',
  Cardio = 'cardio',
  Flexibility = 'flexibility',
  Swimming = 'swimming',
  Sports = 'sports',
  Other = 'other'
}

export enum CardioType {
  Running = 'running',
  Cycling = 'cycling',
  Walking = 'walking',
  Elliptical = 'elliptical',
  Rowing = 'rowing',
  Treadmill = 'treadmill',
  StairClimber = 'stairclimber',
  Other = 'other'
}

export interface WorkoutSet {
  weight: number;
  reps: number;
  restSeconds?: number;
  rpe?: number;
  completed?: boolean;
}

export interface WorkoutExercise {
  exerciseName: string;
  bodyPart?: string;
  exerciseId: string;
  sets: WorkoutSet[];
}

// 運動類型專用數據接口
export interface ResistanceData {
  exercises: WorkoutExercise[];
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  totalRestSeconds?: number;
}

export interface CardioData {
  cardioType: CardioType;
  distance?: number; // 距離（公里）
  intensity: number; // 強度等級（1-10）
  averageHeartRate?: number; // 平均心率
  maxHeartRate?: number; // 最大心率
  caloriesBurned?: number; // 消耗卡路里
  location?: string; // 運動地點
}

export interface FlexibilityData {
  poses: string[]; // 體式或動作名稱
  difficulty?: number; // 難度等級（1-10）
  focusAreas: string[]; // 重點部位
  relaxationLevel?: number; // 放鬆程度（1-10）
}

export interface WorkoutRecord {
  _id: string;
  userId: string;
  date: string;
  type: WorkoutType; // 運動類型
  duration?: number; // 運動持續時間（分鐘）- 通用欄位
  notes?: string;
  
  // 各運動類型的專用數據
  resistanceData?: ResistanceData;
  cardioData?: CardioData;
  flexibilityData?: FlexibilityData;
  
  // 向後兼容的舊欄位（標記為可選）
  exercises?: WorkoutExercise[];
  totalVolume?: number;
  totalSets?: number;
  totalReps?: number;
  workoutDurationSeconds?: number;
  totalRestSeconds?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface DailyWorkoutResponse {
  date: string;
  records: WorkoutRecord[];
  dailyTotals: {
    totalVolume: number;
    totalSets: number;
    totalReps: number;
    totalDuration: number; // 總運動時間（分鐘）
    recordCount: number;
    recordsByType: Record<WorkoutType, number>; // 按運動類型統計
  };
}

export const workoutApi = createApi({
  reducerPath: 'workoutApi',
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
  tagTypes: ['WorkoutRecord', 'WorkoutSummary', 'Exercises'],
  endpoints: (builder) => ({
    getWorkoutList: builder.query<DailyWorkoutResponse, { date?: string; type?: WorkoutType } | void>({
      query: (params) => ({ url: '/workout-records', params: params as Record<string, unknown> | undefined }),
      transformResponse: (response: unknown, _meta, arg) => {
        if (Array.isArray(response)) {
          const records: WorkoutRecord[] = response;
          const dailyTotals = records.reduce(
            (t, r) => {
              // 統計重訓數據（從新結構或舊欄位取值）
              const volume = r.resistanceData?.totalVolume || r.totalVolume || 0;
              const sets = r.resistanceData?.totalSets || r.totalSets || 0;
              const reps = r.resistanceData?.totalReps || r.totalReps || 0;
              const duration = r.duration || 0;
              const type = r.type || WorkoutType.Resistance;
              
              return {
                totalVolume: t.totalVolume + volume,
                totalSets: t.totalSets + sets,
                totalReps: t.totalReps + reps,
                totalDuration: t.totalDuration + duration,
                recordCount: t.recordCount + 1,
                recordsByType: {
                  ...t.recordsByType,
                  [type]: (t.recordsByType[type] || 0) + 1,
                },
              };
            },
            { totalVolume: 0, totalSets: 0, totalReps: 0, totalDuration: 0, recordCount: 0, recordsByType: {} as Record<WorkoutType, number> },
          );
          const date = (arg as { date?: string } | undefined)?.date || new Date().toISOString().split('T')[0];
          return { date, records, dailyTotals } as DailyWorkoutResponse;
        }
        return response as DailyWorkoutResponse;
      },
      providesTags: (result) => [
        { type: 'WorkoutSummary', id: 'LIST' },
        ...((result?.records || []).map((r) => ({ type: 'WorkoutRecord' as const, id: r._id }))),
      ],
    }),
    getWorkoutDailySummary: builder.query<DailyWorkoutResponse, string>({
      query: (date) => ({ url: '/workout-records/daily-summary', params: { date } }),
      providesTags: [{ type: 'WorkoutSummary', id: 'LIST' }],
    }),
    getWorkoutById: builder.query<WorkoutRecord, string>({
      query: (id) => `/workout-records/${id}`,
      providesTags: (result, _e, id) => [{ type: 'WorkoutRecord', id }],
    }),
    createWorkout: builder.mutation<WorkoutRecord, {
      date: string;
      type: WorkoutType;
      duration?: number;
      notes?: string;
      resistanceData?: Omit<ResistanceData, 'totalVolume' | 'totalSets' | 'totalReps'>;
      cardioData?: CardioData;
      flexibilityData?: FlexibilityData;
      // 向後兼容的舊欄位
      exercises?: WorkoutExercise[];
      workoutDurationSeconds?: number;
      totalRestSeconds?: number;
    }>({
      query: (body) => ({ url: '/workout-records', method: 'POST', body }),
      invalidatesTags: [{ type: 'WorkoutSummary', id: 'LIST' }],
    }),
    updateWorkout: builder.mutation<WorkoutRecord, { 
      id: string; 
      body: Partial<{
        date: string;
        type: WorkoutType;
        duration?: number;
        notes?: string;
        resistanceData?: Partial<ResistanceData>;
        cardioData?: Partial<CardioData>;
        flexibilityData?: Partial<FlexibilityData>;
        // 向後兼容的舊欄位
        exercises?: WorkoutExercise[];
        workoutDurationSeconds?: number;
        totalRestSeconds?: number;
      }>
    }>({
      query: ({ id, body }) => ({ url: `/workout-records/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, _e, arg) => [
        { type: 'WorkoutRecord', id: arg.id },
        { type: 'WorkoutSummary', id: 'LIST' },
      ],
    }),
    deleteWorkout: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/workout-records/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'WorkoutSummary', id: 'LIST' }],
    }),
    getBodyParts: builder.query<string[], void>({
      query: () => '/workout-records/common/body-parts',
    }),
    getWorkoutTypes: builder.query<WorkoutType[], void>({
      query: () => '/workout-records/common/workout-types',
    }),
    getCommonExercises: builder.query<Array<{ _id: string; name: string; bodyPart: string }>, string | void>({
      query: (bodyPart) => ({ url: '/workout-records/common/exercises', params: bodyPart ? { bodyPart } : undefined }),
      providesTags: [{ type: 'Exercises', id: 'LIST' }],
    }),
    getAllExercises: builder.query<Array<{ _id: string; name: string; bodyPart: string }>, string | void>({
      query: (bodyPart) => ({ url: '/workout-records/exercises', params: bodyPart ? { bodyPart } : undefined }),
      providesTags: [{ type: 'Exercises', id: 'LIST' }],
    }),
    getUserExercises: builder.query<Array<{ _id: string; name: string; bodyPart: string }>, string | void>({
      query: (bodyPart) => ({ url: '/workout-records/user/exercises', params: bodyPart ? { bodyPart } : undefined }),
    }),
    addUserExercise: builder.mutation<{ _id: string; name: string; bodyPart: string }, { name: string; bodyPart: string }>({
      query: (body) => ({ url: '/workout-records/user/exercises', method: 'POST', body }),
      invalidatesTags: [{ type: 'Exercises', id: 'LIST' }],
    }),
    updateUserExercise: builder.mutation<{ _id: string; name: string; bodyPart: string }, { id: string; body: Partial<{ name: string; bodyPart: string; isActive: boolean }> }>({
      query: ({ id, body }) => ({ url: `/workout-records/user/exercises/${id}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Exercises', id: 'LIST' }],
    }),
    deleteUserExercise: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/workout-records/user/exercises/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Exercises', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWorkoutListQuery,
  useGetWorkoutDailySummaryQuery,
  useGetWorkoutByIdQuery,
  useCreateWorkoutMutation,
  useUpdateWorkoutMutation,
  useDeleteWorkoutMutation,
  useGetBodyPartsQuery,
  useGetWorkoutTypesQuery,
  useGetCommonExercisesQuery,
  useGetAllExercisesQuery,
  useGetUserExercisesQuery,
  useAddUserExerciseMutation,
  useUpdateUserExerciseMutation,
  useDeleteUserExerciseMutation,
} = workoutApi;


