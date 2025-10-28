"use client";

import React, { useMemo } from 'react';
import type { WorkoutRecord, WorkoutExercise } from '@/lib/workoutApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function getDateKey(dateStr?: string) {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

function calcExerciseVolume(ex: WorkoutExercise): number {
  return (ex.sets || []).reduce((sum, s) => sum + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
}

function calcRecordVolume(r: WorkoutRecord): number {
  const v = r.resistanceData?.totalVolume ?? r.totalVolume;
  if (typeof v === 'number') return v;
  const exs = r.resistanceData?.exercises ?? r.exercises ?? [];
  return exs.reduce((sum, ex) => sum + calcExerciseVolume(ex), 0);
}

export default function VolumeOverTime({ records }: { records: WorkoutRecord[] }) {
  const data = useMemo(() => {
    const byDate: Record<string, number> = {};
    for (const r of records) {
      const key = getDateKey(r.date);
      if (!key) continue;
      const vol = calcRecordVolume(r);
      if (vol > 0) byDate[key] = (byDate[key] || 0) + vol;
    }
    return Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, volume]) => ({ date, volume }));
  }, [records]);

  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">目前沒有可用的重訓量資料</div>;
  }

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#111827' }} />
          <YAxis tick={{ fontSize: 10, fill: '#111827' }} />
          <Tooltip
            formatter={(value: number | string) => [`${value} kg·reps`, 'Volume']}
            labelStyle={{ color: '#111827' }}
            itemStyle={{ color: '#111827' }}
            contentStyle={{ borderColor: '#D1D5DB', color: '#111827' }}
          />
          <Legend wrapperStyle={{ color: '#111827' }} />
          <Line type="monotone" dataKey="volume" name="每日總訓練量 (kg·reps)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
