"use client";

import { createApi } from '@reduxjs/toolkit/query/react';
import { jsonBaseQuery } from '@/lib/rtkBase';

export type RangeKey = '7d' | '30d';

export interface AdviceSummaryBodyPart {
  bodyPart: string;
  sets: number;
  volume: number;
}

export interface AdviceSummaryExercise {
  name: string;
  sets: number;
  volume: number;
  sessions: number;
}

export interface AdviceSummary {
  totalSets: number;
  totalVolume: number;
  days: number;
  byBodyPart: AdviceSummaryBodyPart[];
  topExercises: AdviceSummaryExercise[];
}

export interface SuggestedPlanSet { weight: number; reps: number; restSeconds?: number }
export interface SuggestedPlanExercise { exerciseName: string; exerciseId: string; bodyPart?: string; sets: SuggestedPlanSet[] }
export interface SuggestedPlan { name: string; plannedDate: string; exercises: SuggestedPlanExercise[] }

export const aiAdviceApi = createApi({
  reducerPath: 'aiAdviceApi',
  baseQuery: jsonBaseQuery,
  endpoints: (builder) => ({
    getAiAdvice: builder.mutation<string, { range: RangeKey }>({
      query: ({ range }) => ({
        url: '/workout-records/ai/advice',
        method: 'POST',
        body: { range },
      }),
      transformResponse: (response: unknown) => {
        const r = response as { advice?: string } | undefined;
        return r?.advice || '';
      },
    }),
    suggestAiPlan: builder.mutation<SuggestedPlan[], { range: RangeKey; advice?: string }>({
      query: ({ range, advice }) => ({
        url: '/workout-records/ai/suggest-plan',
        method: 'POST',
        body: { range, advice },
      }),
      transformResponse: (response: unknown) => {
        const r = response as { plans?: SuggestedPlan[] } | undefined;
        return Array.isArray(r?.plans) ? r!.plans! : [];
      },
    }),
  }),
});

export const {
  useGetAiAdviceMutation,
  useSuggestAiPlanMutation,
} = aiAdviceApi;
