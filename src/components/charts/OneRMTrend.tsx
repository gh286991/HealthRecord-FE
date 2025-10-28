"use client";

import React, { useEffect, useMemo, useState } from 'react';
import type { WorkoutRecord } from '@/lib/workoutApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function dateKey(d?: string) {
  return (d || '').split('T')[0];
}

function estimate1RM(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  // Epley formula
  return weight * (1 + reps / 30);
}

function collectExerciseNames(records: WorkoutRecord[]): string[] {
  const set = new Set<string>();
  for (const r of records) {
    const exs = r.resistanceData?.exercises ?? r.exercises ?? [];
    for (const ex of exs) set.add(ex.exerciseName || '未命名動作');
  }
  return Array.from(set).sort();
}

export default function OneRMTrend({ records }: { records: WorkoutRecord[] }) {
  const exerciseNames = useMemo(() => collectExerciseNames(records), [records]);
  const [selected, setSelected] = useState<string>(exerciseNames[0] || '');

  // 若資料載入後才有清單，且目前選擇不在清單內，預設選第一個
  useEffect(() => {
    if (!selected || (exerciseNames.length > 0 && !exerciseNames.includes(selected))) {
      setSelected(exerciseNames[0] || '');
    }
  }, [exerciseNames, selected]);

  const data = useMemo(() => {
    const perDayMax: Record<string, number> = {};
    for (const r of records) {
      const key = dateKey(r.date);
      if (!key) continue;
      const exs = r.resistanceData?.exercises ?? r.exercises ?? [];
      let dayMax = 0;
      for (const ex of exs) {
        if ((ex.exerciseName || '未命名動作') !== selected) continue;
        for (const s of ex.sets || []) {
          const est = estimate1RM(Number(s.weight || 0), Number(s.reps || 0));
          if (est > dayMax) dayMax = est;
        }
      }
      if (dayMax > 0) perDayMax[key] = Math.max(perDayMax[key] || 0, dayMax);
    }
    return Object.entries(perDayMax)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, value]) => ({ date, value: Number((value as number).toFixed(1)) }));
  }, [records, selected]);

  if (!exerciseNames || exerciseNames.length === 0) {
    return <div className="text-sm text-gray-500">目前沒有可用的重訓動作資料</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">選擇動作</label>
          <select
            className="border rounded-md px-2 py-1 text-sm text-black"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {exerciseNames.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500">選取的動作目前沒有可用的 1RM 資料</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3" style={{ height: 300 }}>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">選擇動作</label>
        <select
          className="border rounded-md px-2 py-1 text-sm text-black"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {exerciseNames.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#111827' }} />
          <YAxis tick={{ fontSize: 10, fill: '#111827' }} />
          <Tooltip
            formatter={(value: number | string) => [`${value} kg`, `${selected || '1RM'}`]}
            labelStyle={{ color: '#111827' }}
            itemStyle={{ color: '#111827' }}
            contentStyle={{ borderColor: '#D1D5DB', color: '#111827' }}
          />
          <Line type="monotone" dataKey="value" name={`${selected || '動作'} 1RM 估算 (kg)`} stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
