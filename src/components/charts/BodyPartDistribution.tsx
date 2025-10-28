"use client";

import React, { useMemo } from 'react';
import type { WorkoutRecord, WorkoutExercise } from '@/lib/workoutApi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

function calcExerciseVolume(ex: WorkoutExercise): number {
  return (ex.sets || []).reduce((sum, s) => sum + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
}

export default function BodyPartDistribution({ records }: { records: WorkoutRecord[] }) {
  const data = useMemo(() => {
    const map: Record<string, { volume: number; sets: number }> = {};
    for (const r of records) {
      const exs = r.resistanceData?.exercises ?? r.exercises ?? [];
      for (const ex of exs) {
        const key = ex.bodyPart || 'other';
        const vol = calcExerciseVolume(ex);
        const setCount = ex.sets?.length || 0;
        map[key] = {
          volume: (map[key]?.volume || 0) + vol,
          sets: (map[key]?.sets || 0) + setCount,
        };
      }
    }
    const arr = Object.entries(map).map(([bodyPart, v]) => ({ name: bodyPart, value: v.sets, volume: v.volume }));
    // 以組數為主的分佈，如果全為 0 則回傳空
    return arr.filter((d) => d.value > 0);
  }, [records]);

  if (!data || data.length === 0) {
    return <div className="text-sm text-gray-500">目前沒有可用的部位分佈資料</div>;
  }

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={100} paddingAngle={2}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | string, name: string, props: { payload?: { volume?: number } }) => {
              const volume = props?.payload?.volume || 0;
              return [`${value} 組｜${volume} kg·reps`, name];
            }}
            labelStyle={{ color: '#111827' }}
            itemStyle={{ color: '#111827' }}
            contentStyle={{ borderColor: '#D1D5DB', color: '#111827' }}
          />
          <Legend wrapperStyle={{ color: '#111827' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

