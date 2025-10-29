'use client';

import { createApi } from '@reduxjs/toolkit/query/react';
import { jsonBaseQuery } from '@/lib/rtkBase';
import { WorkoutExercise } from './workoutApi'; // Reuse from workoutApi for consistency

export interface WorkoutPlan {
  _id: string;
  name: string;
  creator: string;
  assignedTo: string;
  plannedDate: string;
  status: 'pending' | 'completed';
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export const workoutPlanApi = createApi({
  reducerPath: 'workoutPlanApi',
  baseQuery: jsonBaseQuery,
  tagTypes: ['WorkoutPlan'],
  endpoints: (builder) => ({
    getWorkoutPlans: builder.query<WorkoutPlan[], { date?: string } | void>({ 
      query: (params) => ({ url: '/workout-plans', params: params as Record<string, unknown> | undefined }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'WorkoutPlan' as const, id: _id })),
              { type: 'WorkoutPlan', id: 'LIST' },
            ]
          : [{ type: 'WorkoutPlan', id: 'LIST' }],
    }),
    getWorkoutPlanById: builder.query<WorkoutPlan, string>({
      query: (id) => `/workout-plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'WorkoutPlan', id }],
    }),
    createWorkoutPlan: builder.mutation<WorkoutPlan, Partial<WorkoutPlan>>({
      query: (body) => ({ url: '/workout-plans', method: 'POST', body }),
      invalidatesTags: [{ type: 'WorkoutPlan', id: 'LIST' }],
    }),
    updateWorkoutPlan: builder.mutation<WorkoutPlan, { id: string; body: Partial<WorkoutPlan> }>({
      query: ({ id, body }) => ({ url: `/workout-plans/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, arg) => [{ type: 'WorkoutPlan', id: arg.id }],
    }),
    deleteWorkoutPlan: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({ url: `/workout-plans/${id}`, method: 'DELETE' }),
      invalidatesTags: () => [{ type: 'WorkoutPlan', id: 'LIST' }],
    }),
    completeWorkoutPlan: builder.mutation<WorkoutPlan, string>({
      query: (id) => ({ url: `/workout-plans/${id}/complete`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [{ type: 'WorkoutPlan', id }],
    }),
    createWorkoutPlansBulk: builder.mutation<{ created: number }, { name: string; exercises: WorkoutExercise[]; startDate: string; endDate: string; recurrence: 'daily' | 'weekly'; weekdays?: number[] }>({
      query: (body) => ({ url: '/workout-plans/bulk', method: 'POST', body }),
      invalidatesTags: [{ type: 'WorkoutPlan', id: 'LIST' }],
    }),
    getPlannedDates: builder.query<string[], { year: number; month: number; status?: 'pending' | 'completed' }>({
      query: ({ year, month, status = 'pending' }) => ({
        url: '/workout-plans/marked-dates',
        params: { year, month, status },
      }),
      providesTags: [{ type: 'WorkoutPlan', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetWorkoutPlansQuery,
  useGetWorkoutPlanByIdQuery,
  useCreateWorkoutPlanMutation,
  useUpdateWorkoutPlanMutation,
  useDeleteWorkoutPlanMutation,
  useCompleteWorkoutPlanMutation,
  useCreateWorkoutPlansBulkMutation,
  useGetPlannedDatesQuery,
} = workoutPlanApi;
