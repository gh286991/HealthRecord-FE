'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

type SummaryData = {
  date: string;
  exercises: Array<{ name: string; sets: number; reps: number; volume: number }>;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  workoutDurationSeconds?: number;
  totalRestSeconds?: number;
};

export default function WorkoutSummaryModal({
  open,
  data,
  onClose,
  onAddAnother,
  encouragement,
}: {
  open: boolean;
  data: SummaryData | null;
  encouragement?: string;
  onClose: () => void;
  onAddAnother?: () => void;
}) {
  const t = useTranslations();
  const { workoutMin, restMin, activeMin } = useMemo(() => {
    const w = Math.max(0, data?.workoutDurationSeconds || 0);
    const r = Math.max(0, data?.totalRestSeconds || 0);
    const a = Math.max(0, w - r);
    return {
      workoutMin: Math.floor(w / 60),
      restMin: Math.floor(r / 60),
      activeMin: Math.floor(a / 60),
    };
  }, [data]);

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-[min(92vw,520px)] rounded-3xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.18)] p-6">
        <div className="text-center mb-4">
          <div className="text-2xl">🎉</div>
          <div className="text-lg font-semibold text-gray-900 mt-2">{t('workout.workoutCompleted')}</div>
          {encouragement && (
            <div className="text-sm text-gray-600 mt-1">{encouragement}</div>
          )}
          <div className="text-xs text-gray-500 mt-1">{new Date(data.date).toLocaleString('zh-TW')}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center">
            <div className="text-xl font-bold text-emerald-700">{data.totalVolume}</div>
            <div className="text-xs text-emerald-700/80 mt-1">{t('workout.totalVolume')}</div>
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-center">
            <div className="text-xl font-bold text-blue-700">{data.totalSets}</div>
            <div className="text-xs text-blue-700/80 mt-1">{t('workout.totalSets')}</div>
          </div>
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-center">
            <div className="text-xl font-bold text-orange-700">{data.totalReps}</div>
            <div className="text-xs text-orange-700/80 mt-1">{t('workout.totalReps')}</div>
          </div>
        </div>

        {(data.workoutDurationSeconds || data.totalRestSeconds) && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-purple-50 border border-purple-200 p-3 text-center">
              <div className="text-lg font-semibold text-purple-700">{workoutMin} 分</div>
              <div className="text-xs text-purple-700/80 mt-1">{t('workout.totalTime')}</div>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center">
              <div className="text-lg font-semibold text-rose-700">{restMin} 分</div>
              <div className="text-xs text-rose-700/80 mt-1">{t('workout.restTime')}</div>
            </div>
            <div className="rounded-xl bg-teal-50 border border-teal-200 p-3 text-center">
              <div className="text-lg font-semibold text-teal-700">{activeMin} 分</div>
              <div className="text-xs text-teal-700/80 mt-1">{t('workout.workoutTime')}</div>
            </div>
          </div>
        )}

        <div className="max-h-60 overflow-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-2">{t('workout.exerciseName')}</th>
                <th className="text-right px-4 py-2">{t('workout.sets')}</th>
                <th className="text-right px-4 py-2">{t('workout.reps')}</th>
                <th className="text-right px-4 py-2">{t('workout.volume')}</th>
              </tr>
            </thead>
            <tbody>
              {data.exercises.map((ex, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-800">{ex.name}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{ex.sets}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{ex.reps}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{ex.volume}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3">
          {onAddAnother && (
            <button
              type="button"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold active:scale-95 transition"
              onClick={onAddAnother}
            >
              {t('workout.addAnotherWorkout')}
            </button>
          )}
          <button
            type="button"
            className="w-full py-3 rounded-2xl bg-[#0A84FF] hover:bg-[#0a7aeb] text-white font-semibold active:scale-95 transition"
            onClick={onClose}
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
}


