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

import { API_BASE_URL } from '@/lib/api';

export async function getAIAdvice(range: RangeKey): Promise<string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/workout-records/ai/advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ range }),
  });
  if (!res.ok) throw new Error('AI advice request failed');
  const json = await res.json();
  return json?.advice || '';
}
