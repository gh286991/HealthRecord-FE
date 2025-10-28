"use client";

import React, { useMemo } from 'react';
import type { WorkoutRecord, WorkoutExercise } from '@/lib/workoutApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function calcExerciseVolume(ex: WorkoutExercise): number {
  return (ex.sets || []).reduce((sum, s) => sum + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
}

export default function TopExercisesByVolume({ records, topN = 5, maxLabelLength = 12 }: { records: WorkoutRecord[]; topN?: number; maxLabelLength?: number }) {
  const { rows, containerHeight } = useMemo(() => {
    const volByExercise: Record<string, number> = {};
    for (const r of records) {
      const exs = r.resistanceData?.exercises ?? r.exercises ?? [];
      for (const ex of exs) {
        const name = ex.exerciseName || '未命名動作';
        volByExercise[name] = (volByExercise[name] || 0) + calcExerciseVolume(ex);
      }
    }
    const sorted = Object.entries(volByExercise)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);
    const trunc = (s: string) => (s.length > maxLabelLength ? s.slice(0, maxLabelLength - 1) + '…' : s);
    const rows = sorted.map(([name, value]) => ({ name, label: trunc(name), value }));
    const height = Math.max(240, rows.length * 36);
    return { rows, containerHeight: height };
  }, [records, topN, maxLabelLength]);

  if (!rows || rows.length === 0) {
    return <div className="text-sm text-gray-500">目前沒有可用的動作訓練量資料</div>;
  }

  return (
    <div className="w-full" style={{ height: containerHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#111827' }} />
          <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 11, fill: '#111827' }} />
          <Tooltip
            formatter={(value: number | string, _name: string, props: { payload?: { name?: string } }) => [`${value} kg·reps`, props?.payload?.name || '']}
            labelStyle={{ color: '#111827' }}
            itemStyle={{ color: '#111827' }}
            contentStyle={{ borderColor: '#D1D5DB', color: '#111827' }}
          />
          <Bar dataKey="value" fill="#10b981" maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
