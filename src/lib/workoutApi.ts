"use client";

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9090';

export interface WorkoutSet {
  weight: number;
  reps: number;
  restSeconds?: number;
  rpe?: number;
}

export interface WorkoutExercise {
  exerciseName: string;
  sets: WorkoutSet[];
}

export interface WorkoutRecord {
  _id: string;
  userId: string;
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
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
    recordCount: number;
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
  tagTypes: ['WorkoutRecord', 'WorkoutSummary'],
  endpoints: (builder) => ({
    getWorkoutList: builder.query<DailyWorkoutResponse, { date?: string } | void>({
      query: (params) => ({ url: '/workout-records', params }),
      transformResponse: (response: any, _meta, arg) => {
        if (Array.isArray(response)) {
          const records: WorkoutRecord[] = response;
          const dailyTotals = records.reduce(
            (t, r) => ({
              totalVolume: t.totalVolume + (r.totalVolume || 0),
              totalSets: t.totalSets + (r.totalSets || 0),
              totalReps: t.totalReps + (r.totalReps || 0),
              recordCount: t.recordCount + 1,
            }),
            { totalVolume: 0, totalSets: 0, totalReps: 0, recordCount: 0 },
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
    createWorkout: builder.mutation<WorkoutRecord, { date: string; exercises: WorkoutExercise[]; notes?: string }>({
      query: (body) => ({ url: '/workout-records', method: 'POST', body }),
      invalidatesTags: [{ type: 'WorkoutSummary', id: 'LIST' }],
    }),
    updateWorkout: builder.mutation<WorkoutRecord, { id: string; body: Partial<{ date: string; exercises: WorkoutExercise[]; notes?: string }> }>({
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
  }),
});

export const {
  useGetWorkoutListQuery,
  useGetWorkoutDailySummaryQuery,
  useGetWorkoutByIdQuery,
  useCreateWorkoutMutation,
  useUpdateWorkoutMutation,
  useDeleteWorkoutMutation,
} = workoutApi;


